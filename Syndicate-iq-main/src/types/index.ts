export type LoanStatus = 'active' | 'at-risk' | 'matured' | 'defaulted';
export type RiskLevel = 'low' | 'medium' | 'high';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertType = 'covenant-breach' | 'missing-document' | 'esg-deviation' | 'deadline-reminder';
export type GreenwashingRisk = 'low' | 'medium' | 'high';

export interface Loan {
  id: string;
  loanId: string;
  borrower: string;
  sector: string;
  amount: number;
  currency: string;
  interestRate: number;
  maturityDate: string;
  status: LoanStatus;
  riskScore: number;
  esgScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Covenant {
  id: string;
  loanId: string;
  name: string;
  type: 'financial' | 'operational' | 'reporting';
  testDate: string;
  status: 'compliant' | 'at-risk' | 'breached';
  description: string;
}

export interface ESGMetric {
  id: string;
  loanId: string;
  category: 'environmental' | 'social' | 'governance';
  metric: string;
  value: number;
  unit: string;
  target?: number;
  quarter: string;
  year: number;
}

export interface Alert {
  id: string;
  loanId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

// ✅ Risk Factors used for settlement risk calculation
export interface RiskFactors {
  documentCompleteness: number; // 0-100
  amendmentComplexity: number;  // 0-100
  crossBorderFactors: number;   // 0-100
  partyHistory: number;         // 0-100
  covenantStatus: number;       // 0-100
  marketVolatility: number;     // 0-100
}

export interface DueDiligenceReport {
  id: string;
  fileName: string;
  uploadedAt: string;
  processedAt: string;
  riskScore: number;
  riskFactors: RiskFactors;
  extractedData: {
    borrower: string;
    amount: number;
    interestRate: number;
    maturityDate: string;
    covenants: string[];
  };
  expectedSettlementDays: number;
  recommendation: string;
}

export interface GreenwashingFlags {
  transparencyScore: number;
  performanceDecline: boolean;
  cherryPicking: boolean;
  vagueTargets: boolean;
}

export interface GreenwashingResult {
  riskLevel: GreenwashingRisk;
  flags: GreenwashingFlags;
  riskFactors: string[];
}

// ESG Verification Flow Types
export interface ESGVerificationResult {
  id: string;
  loanId: string;
  borrowerName: string;
  uploadedAt: Date;
  processedAt: Date;
  processingTime: number; // seconds
  
  // Step 2: Extracted Metrics
  extractedMetrics: {
    carbonEmissions: {
      scope1: number | null;
      scope2: number | null;
      scope3: number | null;
      unit: string;
      baselineYear: number | null;
    };
    renewableEnergy: {
      percentage: number | null;
      totalMWh: number | null;
    };
    waterUsage: {
      totalLiters: number | null;
      recycledPercentage: number | null;
    };
    wasteRecycling: {
      rate: number | null;
    };
    diversity: {
      womenInLeadership: number | null;
      boardDiversity: number | null;
    };
    safety: {
      incidents: number | null;
      lostTimeRate: number | null;
    };
    community: {
      investment: number | null;
      volunteerHours: number | null;
    };
    claimedImprovements: Array<{
      metric: string;
      claimed: string;
      baseline: string;
    }>;
  };
  
  // Step 3: Third-Party Verification
  thirdPartyVerification: {
    cdp: {
      verified: boolean;
      confidence: 'high' | 'medium' | 'low';
      data: Record<string, number>;
      deviation: number; // percentage
      lastUpdated: Date | null;
    };
    gri: {
      verified: boolean;
      confidence: 'high' | 'medium' | 'low';
      data: Record<string, number>;
      missingDataPoints: string[];
    };
    regulatory: {
      euTaxonomy: boolean;
      companiesHouse: boolean;
      governanceVerified: boolean;
    };
    certifications: Array<{
      type: string;
      valid: boolean;
      expired: boolean;
      expirationDate: Date | null;
      scope: string;
    }>;
    industryBenchmark: {
      sectorAverage: Record<string, number>;
      peerComparison: Record<string, {
        borrower: number;
        average: number;
        stdDev: number;
        outlier: boolean;
      }>;
    };
  };
  
  // Step 4: Risk Calculation
  riskScore: {
    overall: number; // 0-100
    level: 'low' | 'medium' | 'high';
    components: {
      dataCompleteness: number;
      externalVerification: number;
      methodologyTransparency: number;
      thirdPartyAudit: number;
      historicalConsistency: number;
      peerBenchmarkDeviation: number;
    };
    breakdown: Array<{
      component: string;
      score: number;
      weight: number;
      weightedScore: number;
    }>;
  };
  
  // Step 5: Alerts
  alerts: Array<{
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedLiability?: number;
    currency?: string;
    recommendedAction: string;
    notify: string[];
    priority: number; // 1-4, 1 = immediate
    timeline: string;
  }>;
  
  // Step 6: Comparison Data
  comparison: Array<{
    metric: string;
    claimed: number | string;
    verified: number | string;
    deviation: number; // percentage
    status: 'match' | 'minor' | 'major' | 'critical';
  }>;
  
  // Claimed vs Verified Metrics (detailed)
  claimedVerifiedMetrics?: Array<{
    metric: string;
    claimed: string;
    verified: string;
    deviation: string;
    status: string;
  }>;
  
  // Verification Sources (detailed)
  verificationSources?: Array<{
    source: string;
    confidence: 'High' | 'Medium' | 'Low';
    notes: string;
  }>;
  
  // Compliance
  lmaCompliance: {
    greenLoanPrinciples: boolean;
    sustainabilityCoordinator: boolean;
    reportingAligned: boolean;
    overallCompliant: boolean;
    score: number; // 0-100
  };
  
  euTaxonomyCompliance: {
    compliant: boolean;
    score: number;
    issues: string[];
  };
}

export interface LMAComplianceItem {
  id: string;
  requirement: string;
  category: 'use-of-proceeds' | 'evaluation' | 'management' | 'reporting';
  compliant: boolean;
  evidence?: string;
}

export interface ESGReport {
  id: string;
  loanId: string;
  uploadedAt: string;
  processedAt: string;
  overallScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  metrics: ESGMetric[];
  greenwashingResult: GreenwashingResult;
  lmaCompliance: {
    score: number;
    items: LMAComplianceItem[];
  };
  quarterlyTrends: Array<{
    quarter: string;
    environmental: number;
    social: number;
    governance: number;
  }>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  loanId?: string;
  documentHash: string;
  details?: Record<string, unknown>;
}

export interface PortfolioMetrics {
  totalLoans: number;
  totalValue: number;
  averageRiskScore: number;
  averageESGScore: number;
  activeAlerts: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  esgComplianceRate: number;
}

// Guide-specific types for Document Processing
export interface LoanDocument {
  id: string;
  fileName: string;
  uploadDate: Date;
  processingTime: number;
  status: 'processing' | 'complete' | 'error';
  basicDetails: {
    borrower: string;
    amount: number;
    currency: string;
    interestRate: string;
    maturityDate: string;
    facilityType: string;
  };
  covenants: {
    financial: FinancialCovenant[];
    reporting: ReportingObligation[];
  };
  esgObligations: {
    targets: string[];
    reportingFrequency: string;
    verificationRequired: boolean;
  };
  parties: {
    lenders: string[];
    agent: string;
    trustee?: string;
  };
}

export interface FinancialCovenant {
  type: string;
  limit: string;
  currentValue?: string;
  frequency: string;
}

export interface ReportingObligation {
  type: string;
  frequency: string;
  deadline: string;
}

// Guide-specific types for Due Diligence
export interface DueDiligenceCheck {
  checkName: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  result?: 'pass' | 'fail' | 'warning';
  details: string;
  timestamp: Date;
}

export interface DueDiligenceReportGuide {
  tradeId: string;
  loanId: string;
  initiatedBy: string;
  initiatedDate: Date;
  completionTime: number;
  checks: DueDiligenceCheck[];
  summary: {
    overallRisk: 'low' | 'medium' | 'high';
    recommendation: string;
    totalCostSaved: number;
    timeSaved: string;
  };
}

// Guide-specific types for Covenant Monitoring
export interface CovenantMonitoring {
  loanId: string;
  borrowerName: string;
  covenants: CovenantStatus[];
  riskScore: number;
  breachProbability: number;
  forecastPeriod: number;
  alerts: AlertGuide[];
}

export interface CovenantStatus {
  type: string;
  currentValue: number;
  limit: number;
  cushion: number;
  trend: 'improving' | 'stable' | 'deteriorating';
}

export interface AlertGuide {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredDate: Date;
  resolved: boolean;
}

// Guide-specific types for ESG Monitoring
export interface ESGMetrics {
  loanId: string;
  borrowerName: string;
  greenLoanStatus: boolean;
  emissions: {
    reported: number;
    verified: number;
    verificationDate?: Date;
    baselineYear: number;
    targetReduction: number;
    currentReduction: number;
  };
  reporting: {
    frequency: string;
    lastSubmitted?: Date;
    missedReports: number;
    completeness: number;
  };
  greenwashingRisk: {
    riskLevel: 'low' | 'medium' | 'high';
    transparencyScore: number;
    flags: string[];
  };
  lmaCompliance: {
    greenLoanPrinciples: boolean;
    sustainabilityCoordinator: boolean;
    reportingAligned: boolean;
  };
}

// Guide-specific Portfolio Summary
export interface PortfolioSummary {
  totalLoans: number;
  totalValue: number;
  averageRisk: number;
  activeAlerts: number;
  portfolioHealth: number;
}