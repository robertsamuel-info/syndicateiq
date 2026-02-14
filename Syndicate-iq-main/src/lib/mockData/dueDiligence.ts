import { DueDiligenceReport, RiskFactors } from '../../types';
import { calculateRiskScore, estimateSettlementDays } from '../utils/calculateRiskScore';

function generateRiskFactors(): RiskFactors {
  return {
    documentCompleteness: Math.floor(Math.random() * 60) + 40, // 40-100
    amendmentComplexity: Math.floor(Math.random() * 80) + 20, // 20-100
    crossBorderFactors: Math.floor(Math.random() * 90) + 10, // 10-100
    partyHistory: Math.floor(Math.random() * 70) + 30, // 30-100
    covenantStatus: Math.floor(Math.random() * 80) + 20, // 20-100
    marketVolatility: Math.floor(Math.random() * 70) + 15, // 15-85
  };
}

export function generateDueDiligenceReport(fileName: string): DueDiligenceReport {
  const uploadedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
  const processedAt = new Date(uploadedAt).toISOString();

  const riskFactors = generateRiskFactors();
  const riskScore = calculateRiskScore(riskFactors);
  const expectedDays = estimateSettlementDays(riskScore);

  const borrowers = [
    'Acme Real Estate Holdings',
    'Pacific Energy Solutions',
    'Metro Healthcare Group',
    'Global Manufacturing Corp',
    'TechVenture Capital',
  ];

  const covenants = [
    'Debt-to-Equity Ratio (max 3.0x)',
    'Interest Coverage Ratio (min 2.5x)',
    'Minimum Working Capital ($10M)',
    'Debt Service Coverage Ratio (min 1.25x)',
    'Capital Expenditure Limit ($25M/year)',
    'Reporting Requirements (quarterly)',
  ];

  const recommendation =
    riskScore < 30
      ? 'Low risk: Expected settlement in 5-10 days. Standard process sufficient.'
      : riskScore < 70
        ? `Medium risk: Expected settlement in ${expectedDays} days. Additional review recommended for amendments.`
        : `High risk: Expected settlement in ${expectedDays} days. Requires extensive review and potential escrow arrangements.`;

  return {
    id: `dd-${Date.now()}`,
    fileName,
    uploadedAt,
    processedAt,
    riskScore: Math.round(riskScore),
    riskFactors,
    extractedData: {
      borrower: borrowers[Math.floor(Math.random() * borrowers.length)],
      amount: Math.floor(Math.random() * 450 + 50) * 1000000, // $50M-$500M
      interestRate: Math.round((Math.random() * 5 + 3.5) * 100) / 100, // 3.5-8.5%
      maturityDate: new Date(
        Date.now() + Math.random() * 5 * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      covenants: covenants.slice(0, Math.floor(Math.random() * 4) + 3),
    },
    expectedSettlementDays: expectedDays,
    recommendation,
  };
}
