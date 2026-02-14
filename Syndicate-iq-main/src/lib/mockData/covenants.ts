import { Covenant } from '../../types';

const covenantNames = [
  'Debt-to-Equity Ratio',
  'Interest Coverage Ratio',
  'Current Ratio',
  'Minimum Working Capital',
  'Debt Service Coverage Ratio',
  'Leverage Ratio',
  'Fixed Charge Coverage',
  'Maximum Dividend Payments',
  'Capital Expenditure Limit',
  'Minimum Liquidity',
  'EBITDA Covenant',
  'Tangible Net Worth',
  'Reporting Requirement',
  'Financial Statement Submission',
  'Compliance Certificate',
];

const descriptions = [
  'Maintain debt-to-equity ratio below 3.0x',
  'Interest coverage ratio must exceed 2.5x',
  'Current assets must be at least 1.5x current liabilities',
  'Maintain minimum working capital of $10M',
  'Debt service coverage ratio must exceed 1.25x',
  'Total leverage ratio must not exceed 4.0x',
  'Fixed charge coverage ratio must exceed 1.5x',
  'Dividend payments limited to 50% of net income',
  'Annual capital expenditures capped at $25M',
  'Maintain minimum cash and equivalents of $15M',
  'EBITDA must exceed $50M annually',
  'Tangible net worth must exceed $100M',
  'Submit quarterly financial statements within 45 days',
  'Annual audited financial statements due within 90 days',
  'Submit compliance certificate with each financial statement',
];

export function generateCovenants(loanIds: string[]): Covenant[] {
  const covenants: Covenant[] = [];
  const now = new Date();

  loanIds.forEach((loanId) => {
    const covenantCount = Math.floor(Math.random() * 4) + 3; // 3-6 covenants per loan

    for (let i = 0; i < covenantCount; i++) {
      const testDate = new Date(now);
      testDate.setMonth(testDate.getMonth() + Math.floor(Math.random() * 6) + 1); // 1-6 months from now

      const statusProb = Math.random();
      const status: Covenant['status'] =
        statusProb > 0.9 ? 'breached' : statusProb > 0.7 ? 'at-risk' : 'compliant';

      covenants.push({
        id: `covenant-${loanId}-${i + 1}`,
        loanId,
        name: covenantNames[Math.floor(Math.random() * covenantNames.length)],
        type: Math.random() > 0.6 ? 'financial' : Math.random() > 0.5 ? 'operational' : 'reporting',
        testDate: testDate.toISOString(),
        status,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
      });
    }
  });

  return covenants;
}
