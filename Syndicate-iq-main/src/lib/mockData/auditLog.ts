import { AuditLogEntry } from '../../types';
import { generateHashSync } from '../utils/generateHash';
import { mockLoans } from './loans';

const actions = [
  'Document Uploaded',
  'Due Diligence Processed',
  'ESG Report Analyzed',
  'Covenant Test Performed',
  'Loan Status Updated',
  'Alert Created',
  'Report Generated',
  'Compliance Check Completed',
  'Risk Assessment Updated',
  'Document Signed',
];

const users = ['Admin User', 'Analyst 1', 'Analyst 2', 'Manager 1', 'System'];

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

export function generateAuditLog(count: number = 50): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const timestamp = randomDate(monthAgo, now);
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const loanId = Math.random() > 0.3 ? mockLoans[Math.floor(Math.random() * mockLoans.length)].id : undefined;

    const logText = `${timestamp}|${action}|${user}|${loanId || 'N/A'}`;
    const documentHash = generateHashSync(logText);

    entries.push({
      id: `audit-${i + 1}`,
      timestamp,
      action,
      user,
      loanId,
      documentHash,
      details: Math.random() > 0.5 ? { category: 'compliance', status: 'completed' } : undefined,
    });
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
