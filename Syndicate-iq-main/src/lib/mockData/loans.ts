import { Loan } from '../../types';

const sectors = ['Real Estate', 'Energy', 'Healthcare', 'Manufacturing', 'Technology', 'Finance'];
const borrowers = [
  'Acme Real Estate Holdings',
  'Pacific Energy Solutions',
  'Metro Healthcare Group',
  'Global Manufacturing Corp',
  'TechVenture Capital',
  'Atlantic Financial Services',
  'Summit Development LLC',
  'Nexus Energy Partners',
  'MediCare Systems Inc',
  'Industrial Dynamics Ltd',
  'Digital Innovations Group',
  'First National Banking',
  'Skyline Properties Group',
  'Renewable Power Co',
  'Regional Hospital Network',
  'Advanced Materials Corp',
  'Cloud Computing Ventures',
  'Merchant Bank Holdings',
];

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateLoans(count: number = 18): Loan[] {
  const loans: Loan[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const amount = randomInt(50, 500) * 1000000; // $50M - $500M
    const riskScore = randomInt(15, 85);
    const esgScore = randomInt(45, 95);
    const status: Loan['status'] =
      riskScore > 70 ? 'at-risk' : riskScore > 50 ? 'active' : Math.random() > 0.8 ? 'matured' : 'active';

    const createdAt = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
    const maturityDate = randomDate(new Date(2025, 6, 1), new Date(2030, 11, 31));

    loans.push({
      id: `loan-${i + 1}`,
      loanId: `LN-${String(i + 1).padStart(6, '0')}`,
      borrower: randomElement(borrowers),
      sector: randomElement(sectors),
      amount,
      currency: 'USD',
      interestRate: randomFloat(3.5, 8.5),
      maturityDate,
      status,
      riskScore,
      esgScore,
      createdAt,
      updatedAt: randomDate(new Date(createdAt), now),
    });
  }

  return loans;
}

export const mockLoans = generateLoans();
