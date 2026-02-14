import { Loan, DueDiligenceReport, ESGReport } from '../../types';
import { mockLoans } from '../mockData/loans';
import { generateDueDiligenceReport } from '../mockData/dueDiligence';
import { generateESGReport } from '../mockData/esgReports';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock API Client
export const api = {
  // Loans
  async getLoans(): Promise<Loan[]> {
    await delay(500 + Math.random() * 500); // 500-1000ms
    return [...mockLoans];
  },

  async getLoan(id: string): Promise<Loan | null> {
    await delay(300 + Math.random() * 300);
    return mockLoans.find((loan) => loan.id === id) || null;
  },

  // Due Diligence
  async processDueDiligence(file: File): Promise<DueDiligenceReport> {
    // Simulate processing time (3-5 seconds)
    await delay(3000 + Math.random() * 2000);
    return generateDueDiligenceReport(file.name);
  },

  // ESG Analysis
  async analyzeESGReport(loanId: string, files: File[]): Promise<ESGReport> {
    // Simulate processing time (2-4 seconds)
    await delay(2000 + Math.random() * 2000);
    return generateESGReport(loanId);
  },

  async getESGReport(loanId: string): Promise<ESGReport | null> {
    await delay(300 + Math.random() * 300);
    // For demo, generate a new report each time
    return generateESGReport(loanId);
  },
};
