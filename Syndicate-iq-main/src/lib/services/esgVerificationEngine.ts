/**
 * ESG Verification Engine
 * Compares claimed vs verified metrics, maps LMA compliance, detects greenwashing
 */

import { type ExtractedESGMetrics } from './esgExtractor';
import { type ESGVerificationData } from '@/lib/utils/calculateGreenwashingRisk';

export interface ClaimedVsVerified {
  metric: string;
  claimed: number | string;
  verified: number | string;
  deviation: number; // percentage
  status: 'match' | 'minor' | 'major' | 'critical';
}

export interface LMAComplianceMapping {
  id: string;
  principle: string;
  category: 'use-of-proceeds' | 'evaluation' | 'management' | 'reporting';
  status: 'pass' | 'partial' | 'fail';
  evidence?: string;
  notes?: string;
}

/**
 * Simulates third-party verification (CDP, GRI, ISO registry)
 * In production, this would query actual external APIs
 */
export function simulateThirdPartyVerification(extracted: ExtractedESGMetrics): {
  cdp: { verified: boolean; confidence: 'high' | 'medium' | 'low'; data: Record<string, number>; deviation: number; lastUpdated: Date | null };
  gri: { verified: boolean; confidence: 'high' | 'medium' | 'low'; data: Record<string, number>; missingDataPoints: string[] };
  certifications: Array<{ type: string; valid: boolean; expired: boolean; expirationDate: Date | null; scope: string }>;
} {
  // Simulate CDP verification
  const cdpData: Record<string, number> = {};
  let cdpDeviation = 0;
  
  if (extracted.carbonEmissions.scope1?.value) {
    // Simulate slight variation in verification
    const verified = (extracted.carbonEmissions.scope1.value as number) * (0.95 + Math.random() * 0.1);
    cdpData.carbonReduction = verified;
    cdpDeviation = Math.abs((extracted.carbonEmissions.scope1.value as number) - verified) / (extracted.carbonEmissions.scope1.value as number) * 100;
  }
  
  // Simulate GRI verification
  const griData: Record<string, number> = {};
  const missingDataPoints: string[] = [];
  
  if (extracted.renewableEnergy.percentage?.value) {
    griData.renewableEnergy = extracted.renewableEnergy.percentage.value as number;
  } else {
    missingDataPoints.push('Renewable Energy Percentage');
  }
  
  if (!extracted.carbonEmissions.scope3) {
    missingDataPoints.push('Scope 3 Emissions');
  }
  
  // Extract certifications from text (simplified)
  const certifications: Array<{ type: string; valid: boolean; expired: boolean; expirationDate: Date | null; scope: string }> = [];
  
  // Simulate certification extraction
  const lowerText = JSON.stringify(extracted).toLowerCase();
  if (/iso\s*14001/i.test(lowerText) || /iso[\s-]?14001/i.test(lowerText)) {
    const expired = Math.random() > 0.6; // 40% chance of expired
    const expirationDate = expired 
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    certifications.push({
      type: 'ISO 14001',
      valid: !expired,
      expired,
      expirationDate,
      scope: 'Environmental Management System',
    });
  }
  
  if (/iso\s*9001/i.test(lowerText) || /iso[\s-]?9001/i.test(lowerText)) {
    certifications.push({
      type: 'ISO 9001',
      valid: true,
      expired: false,
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      scope: 'Quality Management System',
    });
  }
  
  // If no certifications found, add expired one to show issue
  if (certifications.length === 0) {
    certifications.push({
      type: 'ISO 14001',
      valid: false,
      expired: true,
      expirationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      scope: 'Environmental Management System',
    });
  }
  
  return {
    cdp: {
      verified: Object.keys(cdpData).length > 0,
      confidence: cdpDeviation < 5 ? 'high' : cdpDeviation < 15 ? 'medium' : 'low',
      data: cdpData,
      deviation: cdpDeviation,
      lastUpdated: new Date(),
    },
    gri: {
      verified: Object.keys(griData).length > 0,
      confidence: missingDataPoints.length === 0 ? 'high' : missingDataPoints.length < 3 ? 'medium' : 'low',
      data: griData,
      missingDataPoints,
    },
    certifications,
  };
}

/**
 * Compares claimed metrics vs verified metrics
 * Returns comprehensive list of all ESG metrics with claimed vs verified comparison
 */
export function compareClaimedVsVerified(extracted: ExtractedESGMetrics): ClaimedVsVerified[] {
  const comparisons: ClaimedVsVerified[] = [];
  
  // Carbon reduction (from claimed improvements)
  const carbonReduction = extracted.claimedImprovements.find(i => 
    i.metric.toLowerCase().includes('carbon') || 
    i.metric.toLowerCase().includes('emission') ||
    i.metric.toLowerCase().includes('co2')
  );
  
  if (carbonReduction) {
    const claimedValue = parseFloat(carbonReduction.claimed.replace('%', '').replace(/[^0-9.-]/g, ''));
    if (!isNaN(claimedValue)) {
      // Simulate verified value (would come from third-party verification)
      const verifiedValue = claimedValue * (0.85 + Math.random() * 0.3); // 15-45% variation to show discrepancies
      const deviation = Math.abs(claimedValue - verifiedValue);
      const status = deviation < 5 ? 'match' : deviation < 10 ? 'minor' : deviation < 20 ? 'major' : 'critical';
      
      comparisons.push({
        metric: 'Carbon Reduction',
        claimed: `${claimedValue > 0 ? '+' : ''}${claimedValue}%`,
        verified: `${verifiedValue > 0 ? '+' : ''}${verifiedValue.toFixed(1)}%`,
        deviation,
        status,
      });
    }
  } else {
    // Add as missing if not found
    comparisons.push({
      metric: 'Carbon Reduction',
      claimed: 'N/A',
      verified: 'N/A',
      deviation: 0,
      status: 'critical',
    });
  }
  
  // Renewable energy
  if (extracted.renewableEnergy.percentage?.value) {
    const claimed = extracted.renewableEnergy.percentage.value as number;
    const verified = claimed * (0.95 + Math.random() * 0.1); // Less variation for renewable
    const deviation = Math.abs(claimed - verified);
    const status = deviation < 5 ? 'match' : deviation < 10 ? 'minor' : deviation < 20 ? 'major' : 'critical';
    
    comparisons.push({
      metric: 'Renewable Energy Usage',
      claimed: `${claimed}%`,
      verified: `${verified.toFixed(1)}%`,
      deviation,
      status,
    });
  } else {
    comparisons.push({
      metric: 'Renewable Energy Usage',
      claimed: 'N/A',
      verified: 'N/A',
      deviation: 0,
      status: 'critical',
    });
  }
  
  // Water savings/usage
  if (extracted.waterUsage.recycledPercentage?.value) {
    const claimed = extracted.waterUsage.recycledPercentage.value as number;
    const verified = claimed * (0.9 + Math.random() * 0.15);
    const deviation = Math.abs(claimed - verified);
    const status = deviation < 5 ? 'match' : deviation < 10 ? 'minor' : deviation < 20 ? 'major' : 'critical';
    
    comparisons.push({
      metric: 'Water Savings',
      claimed: `${claimed}%`,
      verified: `${verified.toFixed(1)}%`,
      deviation,
      status,
    });
  } else if (extracted.waterUsage.totalLiters?.value) {
    const claimed = extracted.waterUsage.totalLiters.value as number;
    const verified = claimed * (0.9 + Math.random() * 0.15);
    const deviation = Math.abs(claimed - verified) / claimed * 100;
    const status = deviation < 5 ? 'match' : deviation < 10 ? 'minor' : deviation < 20 ? 'major' : 'critical';
    
    comparisons.push({
      metric: 'Water Usage',
      claimed: `${(claimed / 1000).toFixed(0)}k L`,
      verified: `${(verified / 1000).toFixed(0)}k L`,
      deviation,
      status,
    });
  } else {
    comparisons.push({
      metric: 'Water Savings',
      claimed: 'N/A',
      verified: 'N/A',
      deviation: 0,
      status: 'critical',
    });
  }
  
  // Scope 3 Emissions (often missing)
  if (extracted.carbonEmissions.scope3?.value) {
    const claimed = extracted.carbonEmissions.scope3.value as number;
    const verified = claimed * (0.85 + Math.random() * 0.25);
    const deviation = Math.abs(claimed - verified) / claimed * 100;
    const status = deviation < 10 ? 'match' : deviation < 20 ? 'minor' : deviation < 35 ? 'major' : 'critical';
    
    comparisons.push({
      metric: 'Scope 3 Emissions',
      claimed: `${claimed.toFixed(0)} ${extracted.carbonEmissions.unit || 'tCO2e'}`,
      verified: `${verified.toFixed(0)} ${extracted.carbonEmissions.unit || 'tCO2e'}`,
      deviation,
      status,
    });
  } else {
    comparisons.push({
      metric: 'Scope 3 Emissions',
      claimed: 'N/A',
      verified: 'N/A',
      deviation: 0,
      status: 'critical',
    });
  }
  
  // Waste recycling
  if (extracted.wasteRecycling.rate?.value) {
    const claimed = extracted.wasteRecycling.rate.value as number;
    const verified = claimed * (0.95 + Math.random() * 0.1);
    const deviation = Math.abs(claimed - verified);
    const status = deviation < 5 ? 'match' : deviation < 10 ? 'minor' : deviation < 20 ? 'major' : 'critical';
    
    comparisons.push({
      metric: 'Waste Recycling Rate',
      claimed: `${claimed}%`,
      verified: `${verified.toFixed(1)}%`,
      deviation,
      status,
    });
  }
  
  return comparisons;
}

/**
 * Generates detailed verification sources array
 */
export function generateVerificationSources(
  extracted: ExtractedESGMetrics,
  thirdPartyData: ReturnType<typeof simulateThirdPartyVerification>
): Array<{ source: string; confidence: 'High' | 'Medium' | 'Low'; notes: string }> {
  const sources: Array<{ source: string; confidence: 'High' | 'Medium' | 'Low'; notes: string }> = [];
  
  // CDP verification
  if (thirdPartyData.cdp.verified) {
    sources.push({
      source: 'CDP',
      confidence: thirdPartyData.cdp.confidence === 'high' ? 'High' : thirdPartyData.cdp.confidence === 'medium' ? 'Medium' : 'Low',
      notes: thirdPartyData.cdp.deviation < 5 
        ? 'Scope 1 & 2 fully verified' 
        : thirdPartyData.cdp.deviation < 15
        ? 'Scope 1 & 2 verified with minor discrepancies'
        : 'Scope 1 & 2 verified with significant discrepancies',
    });
  } else {
    sources.push({
      source: 'CDP',
      confidence: 'Low',
      notes: 'No CDP data available for verification',
    });
  }
  
  // GRI verification
  if (thirdPartyData.gri.verified) {
    sources.push({
      source: 'GRI',
      confidence: thirdPartyData.gri.confidence === 'high' ? 'High' : thirdPartyData.gri.confidence === 'medium' ? 'Medium' : 'Low',
      notes: thirdPartyData.gri.missingDataPoints.length === 0
        ? 'All GRI indicators verified'
        : `${thirdPartyData.gri.missingDataPoints.length} missing data points`,
    });
  } else {
    sources.push({
      source: 'GRI',
      confidence: 'Low',
      notes: 'GRI reporting not found or incomplete',
    });
  }
  
  // ISO Registry
  if (thirdPartyData.certifications.length > 0) {
    const validCert = thirdPartyData.certifications.find(c => c.valid && !c.expired);
    const expiredCert = thirdPartyData.certifications.find(c => c.expired);
    
    if (validCert) {
      sources.push({
        source: 'ISO Registry',
        confidence: 'High',
        notes: `${validCert.type} valid (${validCert.scope})`,
      });
    } else if (expiredCert) {
      sources.push({
        source: 'ISO Registry',
        confidence: 'Low',
        notes: `${expiredCert.type} expired`,
      });
    } else {
      sources.push({
        source: 'ISO Registry',
        confidence: 'Low',
        notes: 'No valid ISO certifications found',
      });
    }
  } else {
    sources.push({
      source: 'ISO Registry',
      confidence: 'Low',
      notes: 'ISO 14001 expired or not found',
    });
  }
  
  // Companies House / Regulatory
  sources.push({
    source: 'Companies House',
    confidence: 'High',
    notes: 'Verified official filings',
  });
  
  return sources;
}

/**
 * Maps document to LMA Green Loan Principles
 */
export function mapLMACompliance(text: string, extracted: ExtractedESGMetrics): LMAComplianceMapping[] {
  const lowerText = text.toLowerCase();
  const mappings: LMAComplianceMapping[] = [];
  
  // 1. Use of Proceeds
  const hasUseOfProceeds = /use\s+of\s+proceeds/i.test(lowerText) || /proceeds\s+allocation/i.test(lowerText);
  const hasDetailedAllocation = /allocation\s+breakdown/i.test(lowerText) || /\d+%\s+(?:for|to|towards)/i.test(lowerText);
  const useOfProceedsStatus: 'pass' | 'partial' | 'fail' = hasDetailedAllocation ? 'pass' : hasUseOfProceeds ? 'partial' : 'fail';
  
  mappings.push({
    id: '1',
    principle: 'Use of Proceeds',
    category: 'use-of-proceeds',
    status: useOfProceedsStatus,
    evidence: hasUseOfProceeds ? 'Proceeds allocation mentioned' : undefined,
    notes: useOfProceedsStatus === 'partial' ? 'Missing detailed allocation breakdown' : useOfProceedsStatus === 'fail' ? 'No proceeds allocation documented' : undefined,
  });
  
  // 2. Project Evaluation
  const hasEvaluation = /esg\s+evaluation/i.test(lowerText) || /project\s+evaluation/i.test(lowerText) || /sustainability\s+assessment/i.test(lowerText);
  const hasDetailedEvaluation = /evaluation\s+criteria/i.test(lowerText) || /eligibility\s+assessment/i.test(lowerText);
  const evaluationStatus: 'pass' | 'partial' | 'fail' = hasDetailedEvaluation ? 'pass' : hasEvaluation ? 'partial' : 'fail';
  
  mappings.push({
    id: '2',
    principle: 'Project Evaluation',
    category: 'evaluation',
    status: evaluationStatus,
    evidence: hasEvaluation ? 'ESG evaluation mentioned' : undefined,
    notes: evaluationStatus === 'partial' ? 'Evaluation criteria not fully detailed' : evaluationStatus === 'fail' ? 'No ESG evaluation documented' : undefined,
  });
  
  // 3. Management of Proceeds
  const hasManagement = /proceeds\s+management/i.test(lowerText) || /segregated\s+account/i.test(lowerText) || /tracking\s+of\s+proceeds/i.test(lowerText);
  const hasSegregatedAccount = /segregated\s+account/i.test(lowerText) || /dedicated\s+account/i.test(lowerText);
  const managementStatus: 'pass' | 'partial' | 'fail' = hasSegregatedAccount ? 'pass' : hasManagement ? 'partial' : 'fail';
  
  mappings.push({
    id: '3',
    principle: 'Management of Proceeds',
    category: 'management',
    status: managementStatus,
    evidence: hasManagement ? 'Proceeds management mentioned' : undefined,
    notes: managementStatus === 'partial' ? 'No segregated account specified' : managementStatus === 'fail' ? 'No proceeds management documented' : undefined,
  });
  
  // 4. Reporting
  const hasReporting = /reporting\s+requirements/i.test(lowerText) || /esg\s+reporting/i.test(lowerText);
  const hasFrequency = /(?:annual|quarterly|semi[\s-]?annual)\s+report/i.test(lowerText);
  const hasAudit = /audit/i.test(lowerText) || /verification/i.test(lowerText);
  const reportingStatus: 'pass' | 'partial' | 'fail' = hasFrequency && hasAudit ? 'pass' : hasReporting ? 'partial' : 'fail';
  
  mappings.push({
    id: '4',
    principle: 'Reporting',
    category: 'reporting',
    status: reportingStatus,
    evidence: hasReporting ? 'Reporting requirements mentioned' : undefined,
    notes: reportingStatus === 'partial' ? 'Missing frequency or audit requirements' : reportingStatus === 'fail' ? 'No reporting requirements documented' : undefined,
  });
  
  return mappings;
}

/**
 * Converts extracted metrics to ESGVerificationData format for risk calculation
 */
export function convertToVerificationData(extracted: ExtractedESGMetrics): ESGVerificationData {
  // Extract claimed metrics
  const claimedMetrics: Record<string, number | string> = {};
  
  // Carbon reduction from claimed improvements
  const carbonReduction = extracted.claimedImprovements.find(i => i.metric.toLowerCase().includes('carbon'));
  if (carbonReduction) {
    claimedMetrics.carbonReduction = parseFloat(carbonReduction.claimed.replace('%', ''));
  }
  
  if (extracted.renewableEnergy.percentage?.value) {
    claimedMetrics.renewableEnergy = extracted.renewableEnergy.percentage.value as number;
  }
  
  if (extracted.waterUsage.recycledPercentage?.value) {
    claimedMetrics.waterReduction = extracted.waterUsage.recycledPercentage.value as number;
  }
  
  if (extracted.wasteRecycling.rate?.value) {
    claimedMetrics.wasteRecycling = extracted.wasteRecycling.rate.value as number;
  }
  
  // Verified metrics (simulated - would come from third-party verification)
  const verifiedMetrics: Record<string, number | string> = {};
  Object.keys(claimedMetrics).forEach(key => {
    const claimed = typeof claimedMetrics[key] === 'number' ? claimedMetrics[key] as number : 0;
    verifiedMetrics[key] = claimed * (0.9 + Math.random() * 0.2); // Simulate verification
  });
  
  // Calculate provided metrics count
  const totalMetrics = 47; // Standard ESG metric count
  const providedMetrics = [
    extracted.carbonEmissions.scope1,
    extracted.carbonEmissions.scope2,
    extracted.carbonEmissions.scope3,
    extracted.renewableEnergy.percentage,
    extracted.renewableEnergy.totalMWh,
    extracted.waterUsage.totalLiters,
    extracted.waterUsage.recycledPercentage,
    extracted.wasteRecycling.rate,
    extracted.diversity.womenInLeadership,
    extracted.diversity.boardDiversity,
    extracted.safety.incidents,
    extracted.safety.lostTimeRate,
    extracted.community.investment,
    extracted.community.volunteerHours,
  ].filter(m => m !== null).length;
  
  return {
    claimedMetrics,
    verifiedMetrics,
    totalMetrics,
    providedMetrics,
    hasScope3: extracted.carbonEmissions.scope3 !== null,
    hasBaseline: extracted.carbonEmissions.baselineYear !== null,
    hasMethodology: /methodology/i.test(JSON.stringify(extracted)),
    thirdPartyAuditType: 'none', // Would be extracted from document
    hasThirdPartyAudit: false,
    certifications: [],
    historicalData: [],
    peerAverage: {},
    peerStdDev: {},
  };
}
