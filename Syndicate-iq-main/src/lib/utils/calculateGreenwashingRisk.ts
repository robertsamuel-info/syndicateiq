/**
 * Greenwashing Risk Calculation Algorithm
 * Based on 6 component scores with weighted calculation
 */

export interface RiskComponentScores {
  dataCompleteness: number;      // 0-100, 20% weight
  externalVerification: number;  // 0-100, 25% weight
  methodologyTransparency: number; // 0-100, 20% weight
  thirdPartyAudit: number;       // 0-100, 15% weight
  historicalConsistency: number; // 0-100, 10% weight
  peerBenchmarkDeviation: number; // 0-100, 10% weight
}

export interface ESGVerificationData {
  claimedMetrics: Record<string, number | string>;
  verifiedMetrics: Record<string, number | string>;
  totalMetrics: number;
  providedMetrics: number;
  hasScope3: boolean;
  hasBaseline: boolean;
  hasMethodology: boolean;
  thirdPartyAuditType: 'big4' | 'specialist' | 'industry' | 'internal' | 'none';
  hasThirdPartyAudit: boolean;
  certifications: Array<{ type: string; expired: boolean; valid: boolean }>;
  historicalData: Array<{ year: number; metrics: Record<string, number> }>;
  peerAverage: Record<string, number>;
  peerStdDev: Record<string, number>;
}

export function calculateGreenwashingRisk(data: ESGVerificationData): {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  componentScores: RiskComponentScores;
  breakdown: {
    component: string;
    score: number;
    weight: number;
    weightedScore: number;
  }[];
} {
  // 1. Data Completeness (20% weight)
  let dataCompleteness = (data.providedMetrics / data.totalMetrics) * 100;
  if (!data.hasScope3) dataCompleteness -= 15;
  if (!data.hasBaseline) dataCompleteness -= 10;
  if (!data.hasMethodology) dataCompleteness -= 10;
  dataCompleteness = Math.max(0, Math.min(100, dataCompleteness));

  // 2. External Verification (25% weight)
  let externalVerification = 0;
  const verifiedCount = Object.keys(data.verifiedMetrics).length;
  const totalClaimed = Object.keys(data.claimedMetrics).length;
  if (totalClaimed > 0) {
    externalVerification = (verifiedCount / totalClaimed) * 100;
  }
  if (!data.hasThirdPartyAudit) externalVerification -= 20;
  if (verifiedCount === 0) externalVerification -= 15;
  externalVerification = Math.max(0, Math.min(100, externalVerification));

  // 3. Methodology Transparency (20% weight)
  let methodologyTransparency = 0;
  if (data.hasBaseline) methodologyTransparency += 25;
  if (data.hasMethodology) methodologyTransparency += 25;
  // Assume assumptions and limitations are present if methodology exists
  if (data.hasMethodology) {
    methodologyTransparency += 50; // Assumptions + limitations
  }

  // 4. Third-Party Audit (15% weight)
  let thirdPartyAudit = 0;
  switch (data.thirdPartyAuditType) {
    case 'big4':
      thirdPartyAudit = 100;
      break;
    case 'specialist':
      thirdPartyAudit = 80;
      break;
    case 'industry':
      thirdPartyAudit = 60;
      break;
    case 'internal':
      thirdPartyAudit = 30;
      break;
    case 'none':
      thirdPartyAudit = 0;
      break;
  }

  // 5. Historical Consistency (10% weight)
  let historicalConsistency = 50; // Default neutral if no history
  if (data.historicalData.length > 0) {
    // Compare current metrics to previous years
    const currentYear = Math.max(...data.historicalData.map(d => d.year));
    const previousYear = Math.max(...data.historicalData.filter(d => d.year < currentYear).map(d => d.year));
    
    if (previousYear) {
      const current = data.historicalData.find(d => d.year === currentYear);
      const previous = data.historicalData.find(d => d.year === previousYear);
      
      if (current && previous) {
        let consistentCount = 0;
        let totalComparable = 0;
        
        Object.keys(current.metrics).forEach(key => {
          if (previous.metrics[key] !== undefined) {
            totalComparable++;
            const change = Math.abs((current.metrics[key] as number) - (previous.metrics[key] as number)) / (previous.metrics[key] as number);
            if (change < 0.1) consistentCount++; // <10% change
            else if (change < 0.25) consistentCount += 0.7; // <25% change
            else if (change > 0.5) consistentCount += 0; // >50% change (contradictory)
          }
        });
        
        if (totalComparable > 0) {
          historicalConsistency = (consistentCount / totalComparable) * 100;
        }
      }
    }
  }

  // 6. Peer Benchmark Deviation (10% weight)
  let peerBenchmarkDeviation = 100; // Default perfect if no peers
  if (Object.keys(data.peerAverage).length > 0) {
    let withinRangeCount = 0;
    let totalComparable = 0;
    
    Object.keys(data.claimedMetrics).forEach(key => {
      if (data.peerAverage[key] !== undefined && data.peerStdDev[key] !== undefined) {
        totalComparable++;
        const claimed = typeof data.claimedMetrics[key] === 'number' ? data.claimedMetrics[key] as number : 0;
        const average = data.peerAverage[key];
        const stdDev = data.peerStdDev[key];
        const deviation = Math.abs(claimed - average) / stdDev;
        
        if (deviation <= 1) withinRangeCount += 1; // Within 1 std dev
        else if (deviation <= 2) withinRangeCount += 0.7; // Within 2 std dev
        else if (deviation <= 3) withinRangeCount += 0.3; // Within 3 std dev
        else withinRangeCount += 0; // Extreme outlier
      }
    });
    
    if (totalComparable > 0) {
      peerBenchmarkDeviation = (withinRangeCount / totalComparable) * 100;
    }
  }

  const componentScores: RiskComponentScores = {
    dataCompleteness,
    externalVerification,
    methodologyTransparency,
    thirdPartyAudit,
    historicalConsistency,
    peerBenchmarkDeviation,
  };

  // Calculate weighted overall score
  const weights = {
    dataCompleteness: 0.20,
    externalVerification: 0.25,
    methodologyTransparency: 0.20,
    thirdPartyAudit: 0.15,
    historicalConsistency: 0.10,
    peerBenchmarkDeviation: 0.10,
  };

  const overallScore = 
    componentScores.dataCompleteness * weights.dataCompleteness +
    componentScores.externalVerification * weights.externalVerification +
    componentScores.methodologyTransparency * weights.methodologyTransparency +
    componentScores.thirdPartyAudit * weights.thirdPartyAudit +
    componentScores.historicalConsistency * weights.historicalConsistency +
    componentScores.peerBenchmarkDeviation * weights.peerBenchmarkDeviation;

  const riskLevel: 'low' | 'medium' | 'high' = 
    overallScore <= 30 ? 'low' :
    overallScore <= 60 ? 'medium' : 'high';

  const breakdown = [
    { component: 'Data Completeness', score: dataCompleteness, weight: weights.dataCompleteness, weightedScore: dataCompleteness * weights.dataCompleteness },
    { component: 'External Verification', score: externalVerification, weight: weights.externalVerification, weightedScore: externalVerification * weights.externalVerification },
    { component: 'Methodology Transparency', score: methodologyTransparency, weight: weights.methodologyTransparency, weightedScore: methodologyTransparency * weights.methodologyTransparency },
    { component: 'Third-Party Audit', score: thirdPartyAudit, weight: weights.thirdPartyAudit, weightedScore: thirdPartyAudit * weights.thirdPartyAudit },
    { component: 'Historical Consistency', score: historicalConsistency, weight: weights.historicalConsistency, weightedScore: historicalConsistency * weights.historicalConsistency },
    { component: 'Peer Benchmark', score: peerBenchmarkDeviation, weight: weights.peerBenchmarkDeviation, weightedScore: peerBenchmarkDeviation * weights.peerBenchmarkDeviation },
  ];

  return {
    overallScore: Math.round(overallScore),
    riskLevel,
    componentScores,
    breakdown,
  };
}
