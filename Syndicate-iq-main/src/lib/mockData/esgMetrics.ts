import { ESGMetric } from '../../types';

const environmentalMetrics = [
  'Carbon Emissions (tCO2e)',
  'Energy Consumption (MWh)',
  'Water Usage (m³)',
  'Waste Reduction (%)',
  'Renewable Energy (%)',
  'Green Building Certifications',
  'Pollution Incidents',
];

const socialMetrics = [
  'Employee Safety Rate',
  'Workplace Diversity (%)',
  'Training Hours per Employee',
  'Community Investment ($)',
  'Employee Satisfaction Score',
  'Labor Rights Compliance',
  'Health & Safety Incidents',
];

const governanceMetrics = [
  'Board Diversity (%)',
  'ESG Committee Exists',
  'Ethics Violations',
  'Transparency Score',
  'Stakeholder Engagement Score',
  'Anti-Corruption Measures',
  'Whistleblower Policy Score',
];

export function generateESGMetrics(loanIds: string[]): ESGMetric[] {
  const metrics: ESGMetric[] = [];
  const quarters = ['1', '2', '3', '4'];
  const currentYear = 2024;

  loanIds.forEach((loanId) => {
    // Generate metrics for last 4 quarters
    for (let year = currentYear - 1; year <= currentYear; year++) {
      quarters.forEach((quarter) => {
        // Environmental metrics
        environmentalMetrics.forEach((metric) => {
          const baseValue = Math.random() * 100;
          const trend = Math.random() > 0.3 ? 1 : -1; // 70% improving
          const value = Math.max(0, baseValue + (Math.random() * 20 - 10) * trend);
          const target = baseValue * (1 + Math.random() * 0.2); // 0-20% improvement target

          metrics.push({
            id: `esg-${loanId}-env-${year}Q${quarter}-${metric}`,
            loanId,
            category: 'environmental',
            metric,
            value: Math.round(value * 10) / 10,
            unit: metric.includes('(%)') ? '%' : metric.includes('($)') ? '$' : 'unit',
            target: Math.random() > 0.3 ? Math.round(target * 10) / 10 : undefined,
            quarter,
            year,
          });
        });

        // Social metrics
        socialMetrics.forEach((metric) => {
          const baseValue = Math.random() * 100;
          const trend = Math.random() > 0.25 ? 1 : -1; // 75% improving
          const value = Math.max(0, baseValue + (Math.random() * 15 - 7) * trend);
          const target = baseValue * (1 + Math.random() * 0.15);

          metrics.push({
            id: `esg-${loanId}-soc-${year}Q${quarter}-${metric}`,
            loanId,
            category: 'social',
            metric,
            value: Math.round(value * 10) / 10,
            unit: metric.includes('(%)') ? '%' : metric.includes('($)') ? '$' : 'unit',
            target: Math.random() > 0.25 ? Math.round(target * 10) / 10 : undefined,
            quarter,
            year,
          });
        });

        // Governance metrics
        governanceMetrics.forEach((metric) => {
          const baseValue = Math.random() * 100;
          const trend = Math.random() > 0.2 ? 1 : -1; // 80% improving
          const value = Math.max(0, baseValue + (Math.random() * 10 - 5) * trend);
          const target = baseValue * (1 + Math.random() * 0.1);

          metrics.push({
            id: `esg-${loanId}-gov-${year}Q${quarter}-${metric}`,
            loanId,
            category: 'governance',
            metric,
            value: Math.round(value * 10) / 10,
            unit: metric.includes('(%)') ? '%' : 'unit',
            target: Math.random() > 0.2 ? Math.round(target * 10) / 10 : undefined,
            quarter,
            year,
          });
        });
      });
    }
  });

  return metrics;
}
