import { type LoanDocument, type CovenantMonitoring, type ESGMetrics } from '@/types';

export const sampleLoans: LoanDocument[] = [
  {
    id: 'LOAN-001',
    fileName: 'Green_Energy_Corp_250M_Solar.pdf',
    uploadDate: new Date('2026-01-05'),
    processingTime: 90,
    status: 'complete',
    basicDetails: {
      borrower: 'Green Energy Corp',
      amount: 250000000,
      currency: 'USD',
      interestRate: 'SOFR + 2.1%',
      maturityDate: '2031-12-15',
      facilityType: 'Term Loan'
    },
    covenants: {
      financial: [
        {
          type: 'Debt/EBITDA',
          limit: '< 3.0x',
          currentValue: '2.4x',
          frequency: 'Quarterly'
        },
        {
          type: 'Interest Coverage',
          limit: '> 4.0x',
          currentValue: '5.2x',
          frequency: 'Quarterly'
        }
      ],
      reporting: [
        {
          type: 'Financial Statements',
          frequency: 'Quarterly',
          deadline: '45 days after quarter end'
        },
        {
          type: 'ESG Report',
          frequency: 'Annual',
          deadline: '90 days after year end'
        }
      ]
    },
    esgObligations: {
      targets: ['30% carbon reduction by 2028', 'Solar capacity 500MW by 2030'],
      reportingFrequency: 'Annual',
      verificationRequired: true
    },
    parties: {
      lenders: ['Bank A', 'Bank B', 'Bank C'],
      agent: 'Global Bank Ltd',
      trustee: 'Trust Services Inc'
    }
  },
  {
    id: 'LOAN-002',
    fileName: 'Manufacturing_Co_500M_Facility.pdf',
    uploadDate: new Date('2026-01-03'),
    processingTime: 95,
    status: 'complete',
    basicDetails: {
      borrower: 'Manufacturing Co Ltd',
      amount: 500000000,
      currency: 'EUR',
      interestRate: 'EURIBOR + 2.5%',
      maturityDate: '2030-06-30',
      facilityType: 'Revolving Credit'
    },
    covenants: {
      financial: [
        {
          type: 'Debt/EBITDA',
          limit: '< 3.5x',
          currentValue: '3.2x',
          frequency: 'Quarterly'
        }
      ],
      reporting: [
        {
          type: 'Financial Statements',
          frequency: 'Quarterly',
          deadline: '45 days after quarter end'
        }
      ]
    },
    esgObligations: {
      targets: [],
      reportingFrequency: 'Not Applicable',
      verificationRequired: false
    },
    parties: {
      lenders: ['European Bank', 'Deutsche Lending', 'Credit Union'],
      agent: 'European Bank'
    }
  }
];

export const sampleCovenantMonitoring: CovenantMonitoring[] = [
  {
    loanId: 'LOAN-001',
    borrowerName: 'Green Energy Corp',
    covenants: [
      {
        type: 'Debt/EBITDA',
        currentValue: 2.4,
        limit: 3.0,
        cushion: 20,
        trend: 'stable'
      }
    ],
    riskScore: 35,
    breachProbability: 15,
    forecastPeriod: 90,
    alerts: []
  },
  {
    loanId: 'LOAN-002',
    borrowerName: 'Manufacturing Co Ltd',
    covenants: [
      {
        type: 'Debt/EBITDA',
        currentValue: 3.2,
        limit: 3.5,
        cushion: 8.6,
        trend: 'deteriorating'
      }
    ],
    riskScore: 78,
    breachProbability: 65,
    forecastPeriod: 90,
    alerts: [
      {
        severity: 'critical',
        message: 'Covenant breach predicted in 90 days. EBITDA declining 15% QoQ.',
        triggeredDate: new Date('2026-01-08'),
        resolved: false
      }
    ]
  }
];

export const sampleESGData: ESGMetrics[] = [
  {
    loanId: 'LOAN-001',
    borrowerName: 'Green Energy Corp',
    greenLoanStatus: true,
    emissions: {
      reported: 12,
      verified: 12,
      verificationDate: new Date('2025-12-15'),
      baselineYear: 2023,
      targetReduction: 30,
      currentReduction: 12
    },
    reporting: {
      frequency: 'Annual',
      lastSubmitted: new Date('2025-12-20'),
      missedReports: 0,
      completeness: 95
    },
    greenwashingRisk: {
      riskLevel: 'low',
      transparencyScore: 92,
      flags: []
    },
    lmaCompliance: {
      greenLoanPrinciples: true,
      sustainabilityCoordinator: true,
      reportingAligned: true
    }
  },
  {
    loanId: 'LOAN-003',
    borrowerName: 'Renewable Energy Project Inc',
    greenLoanStatus: true,
    emissions: {
      reported: -40,
      verified: 5,
      baselineYear: 2022,
      targetReduction: 40,
      currentReduction: -5
    },
    reporting: {
      frequency: 'Quarterly',
      lastSubmitted: new Date('2025-06-30'),
      missedReports: 3,
      completeness: 45
    },
    greenwashingRisk: {
      riskLevel: 'high',
      transparencyScore: 35,
      flags: [
        'Emissions data discrepancy: Claimed 40% reduction, actual 5% increase',
        'No third-party verification',
        '3 quarterly reports missing',
        'Baseline methodology unclear'
      ]
    },
    lmaCompliance: {
      greenLoanPrinciples: false,
      sustainabilityCoordinator: false,
      reportingAligned: false
    }
  }
];
