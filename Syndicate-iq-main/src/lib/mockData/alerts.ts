import { Alert } from '../../types';

const alertTemplates: Record<
  Alert['type'],
  Array<{ title: string; message: string; defaultSeverity: Alert['severity'] }>
> = {
  'covenant-breach': [
    {
      title: 'Debt-to-Equity Ratio Breached',
      message: 'Debt-to-equity ratio has exceeded the maximum threshold of 3.0x',
      defaultSeverity: 'high',
    },
    {
      title: 'Interest Coverage Ratio Below Minimum',
      message: 'Interest coverage ratio has fallen below the required 2.5x minimum',
      defaultSeverity: 'critical',
    },
    {
      title: 'Minimum Working Capital Not Met',
      message: 'Working capital has fallen below the required $10M minimum',
      defaultSeverity: 'high',
    },
  ],
  'missing-document': [
    {
      title: 'Q4 Financial Statements Overdue',
      message: 'Quarterly financial statements for Q4 2024 are 5 days overdue',
      defaultSeverity: 'medium',
    },
    {
      title: 'Compliance Certificate Missing',
      message: 'Compliance certificate for period ending Dec 31, 2024 not received',
      defaultSeverity: 'medium',
    },
    {
      title: 'Annual Audit Report Delayed',
      message: 'Annual audited financial statements are 15 days past due',
      defaultSeverity: 'high',
    },
  ],
  'esg-deviation': [
    {
      title: 'Carbon Emissions Target Missed',
      message: 'Actual carbon emissions exceeded target by 15% in Q4 2024',
      defaultSeverity: 'medium',
    },
    {
      title: 'ESG Score Decline Detected',
      message: 'ESG score has decreased by 8 points compared to previous quarter',
      defaultSeverity: 'medium',
    },
    {
      title: 'Renewable Energy Goal Not Met',
      message: 'Renewable energy usage is 10% below the target for 2024',
      defaultSeverity: 'low',
    },
  ],
  'deadline-reminder': [
    {
      title: 'Covenant Test Date Approaching',
      message: 'Debt-to-equity ratio test date is 7 days away (Jan 19, 2025)',
      defaultSeverity: 'low',
    },
    {
      title: 'Financial Statement Submission Due',
      message: 'Q4 financial statements due in 3 days (Jan 15, 2025)',
      defaultSeverity: 'low',
    },
    {
      title: 'Compliance Review Scheduled',
      message: 'Annual compliance review scheduled for next week',
      defaultSeverity: 'low',
    },
  ],
};

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

export function generateAlerts(loanIds: string[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  loanIds.forEach((loanId) => {
    // Generate 1-3 alerts per loan
    const alertCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < alertCount; i++) {
      const type: Alert['type'] =
        Math.random() > 0.7
          ? 'covenant-breach'
          : Math.random() > 0.5
            ? 'missing-document'
            : Math.random() > 0.5
              ? 'esg-deviation'
              : 'deadline-reminder';

      const templates = alertTemplates[type];
      const template = templates[Math.floor(Math.random() * templates.length)];

      const createdAt = randomDate(monthAgo, now);
      const resolved = Math.random() > 0.6; // 40% resolved
      const resolvedAt = resolved ? randomDate(new Date(createdAt), now) : undefined;

      alerts.push({
        id: `alert-${loanId}-${i + 1}`,
        loanId,
        type,
        severity: template.defaultSeverity,
        title: template.title,
        message: template.message,
        createdAt,
        resolved,
        resolvedAt,
      });
    }
  });

  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
