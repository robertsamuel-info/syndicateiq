import { type ESGMetrics } from '@/types';

export interface ESGMonitoringCalculations {
  discrepancy: number;
  discrepancyPercentage: number;
  transparencyScore: number;
  reportingCompleteness: number;
  complianceStatus: 'compliant' | 'non-compliant';
  unmetRequirements: number;
  recommendedActions: string[];
}

/**
 * Calculate discrepancy between reported and verified emissions
 */
export function calculateDiscrepancy(
  reported: number,
  verified: number,
  targetReduction: number
): { discrepancy: number; percentage: number } {
  const discrepancy = Math.abs(reported - verified);
  const percentage = targetReduction > 0 
    ? (discrepancy / Math.abs(targetReduction)) * 100 
    : discrepancy;
  
  return { discrepancy, percentage };
}

/**
 * Calculate transparency score based on available data points
 */
export function calculateTransparencyScore(loan: ESGMetrics): number {
  const requiredDataPoints = 8; // Total required data points
  let verifiedPoints = 0;

  // Check emissions data
  if (loan.emissions.reported !== null && loan.emissions.reported !== undefined) verifiedPoints++;
  if (loan.emissions.verified !== null && loan.emissions.verified !== undefined) verifiedPoints++;
  if (loan.emissions.verificationDate) verifiedPoints++;
  if (loan.emissions.baselineYear) verifiedPoints++;

  // Check reporting data
  if (loan.reporting.lastSubmitted) verifiedPoints++;
  if (loan.reporting.completeness > 0) verifiedPoints++;

  // Check compliance
  if (Object.values(loan.lmaCompliance).every(v => v)) verifiedPoints++;
  if (loan.greenLoanStatus) verifiedPoints++;

  return Math.round((verifiedPoints / requiredDataPoints) * 100);
}

/**
 * Calculate reporting completeness percentage
 */
export function calculateReportingCompleteness(loan: ESGMetrics): number {
  return loan.reporting.completeness || 0;
}

/**
 * Check LMA compliance status
 */
export function checkLMACompliance(loan: ESGMetrics): {
  status: 'compliant' | 'non-compliant';
  unmetRequirements: number;
  requirements: Array<{ name: string; met: boolean }>;
} {
  const requirements = [
    { name: 'Green Loan Principles Framework', met: loan.lmaCompliance.greenLoanPrinciples },
    { name: 'Sustainability Coordinator Appointed', met: loan.lmaCompliance.sustainabilityCoordinator },
    { name: 'Reporting Aligned with Standards', met: loan.lmaCompliance.reportingAligned },
  ];

  const unmetRequirements = requirements.filter(r => !r.met).length;
  const status = unmetRequirements === 0 ? 'compliant' : 'non-compliant';

  return { status, unmetRequirements, requirements };
}

/**
 * Generate recommended actions based on loan data
 */
export function generateRecommendedActions(loan: ESGMetrics, calculations: ESGMonitoringCalculations): string[] {
  const actions: string[] = [];

  // High discrepancy
  if (calculations.discrepancyPercentage > 10) {
    actions.push('Request corrected emissions data with verification');
  }

  // Missing verification
  if (!loan.emissions.verificationDate) {
    actions.push('Request third-party verification of emissions data');
  }

  // Missed reports
  if (loan.reporting.missedReports > 0) {
    actions.push('Escalate overdue reporting to compliance committee');
  }

  // Low completeness
  if (calculations.reportingCompleteness < 70) {
    actions.push('Request complete ESG documentation');
  }

  // Non-compliance
  if (calculations.complianceStatus === 'non-compliant') {
    actions.push('Schedule compliance review meeting');
    if (calculations.unmetRequirements >= 2) {
      actions.push('Consider suspending green loan status');
    }
  }

  // High risk
  if (loan.greenwashingRisk.riskLevel === 'high') {
    actions.push('Escalate to ESG compliance committee');
    actions.push('Avoid regulatory penalties and reputation risk');
  }

  // Low transparency
  if (calculations.transparencyScore < 50) {
    actions.push('Request enhanced transparency and data disclosure');
  }

  return actions;
}

/**
 * Compute all ESG monitoring calculations
 */
export function computeESGMonitoringCalculations(loan: ESGMetrics): ESGMonitoringCalculations {
  const discrepancyCalc = calculateDiscrepancy(
    loan.emissions.reported || 0,
    loan.emissions.verified || 0,
    loan.emissions.targetReduction || 0
  );

  const transparencyScore = calculateTransparencyScore(loan);
  const reportingCompleteness = calculateReportingCompleteness(loan);
  const compliance = checkLMACompliance(loan);

  const calculations: ESGMonitoringCalculations = {
    discrepancy: discrepancyCalc.discrepancy,
    discrepancyPercentage: discrepancyCalc.percentage,
    transparencyScore,
    reportingCompleteness,
    complianceStatus: compliance.status,
    unmetRequirements: compliance.unmetRequirements,
    recommendedActions: [],
  };

  calculations.recommendedActions = generateRecommendedActions(loan, calculations);

  return calculations;
}

/**
 * Generate historical trend data for ESG metrics
 * @deprecated Use ESGHistoricalDataService.getMonthlyAggregated() instead
 */
export function generateHistoricalTrendData(loan: ESGMetrics, months: number = 6) {
  const now = new Date();
  const data = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Simulate trend variation
    const variation = (Math.random() - 0.5) * 5; // ±2.5% variation
    const reportedTrend = (loan.emissions.reported || 0) + variation;
    const verifiedTrend = (loan.emissions.verified || 0) + variation * 0.8; // Verified varies less
    
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      reported: Math.max(0, reportedTrend),
      verified: Math.max(0, verifiedTrend),
      transparencyScore: Math.min(100, Math.max(0, (loan.greenwashingRisk.transparencyScore || 0) + (Math.random() - 0.5) * 10)),
      complianceScore: Object.values(loan.lmaCompliance).filter(v => v).length * 33.33,
    });
  }
  
  return data;
}
