import { ESGReport, LMAComplianceItem } from '../../types';
import { generateESGMetrics } from './esgMetrics';
import { calculateESGScore } from '../utils/calculateESGScore';
import { detectGreenwashing } from '../utils/detectGreenwashing';

const lmaRequirements: Array<{ requirement: string; category: LMAComplianceItem['category'] }> = [
  { requirement: 'Use of proceeds clearly defined for green projects', category: 'use-of-proceeds' },
  { requirement: 'Environmental objectives specified and measurable', category: 'use-of-proceeds' },
  { requirement: 'Project evaluation process documented', category: 'evaluation' },
  { requirement: 'External review or certification obtained', category: 'evaluation' },
  { requirement: 'Processes for managing proceeds tracked', category: 'management' },
  { requirement: 'Ongoing monitoring of project performance', category: 'management' },
  { requirement: 'Annual reporting on use of proceeds', category: 'reporting' },
  { requirement: 'Performance metrics reported transparently', category: 'reporting' },
];

export function generateESGReport(loanId: string): ESGReport {
  const uploadedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
  const processedAt = new Date(uploadedAt).toISOString();

  const metrics = generateESGMetrics([loanId]);
  const scores = calculateESGScore(metrics);
  const greenwashingResult = detectGreenwashing(metrics);

  // Generate LMA compliance
  const complianceItems: LMAComplianceItem[] = lmaRequirements.map((req, index) => ({
    id: `lma-${loanId}-${index + 1}`,
    requirement: req.requirement,
    category: req.category,
    compliant: Math.random() > 0.2, // 80% compliant
    evidence: Math.random() > 0.3 ? `Evidence document ${index + 1}.pdf` : undefined,
  }));

  const complianceScore = Math.round(
    (complianceItems.filter((item) => item.compliant).length / complianceItems.length) * 100
  );

  // Generate quarterly trends
  const quarters = ['1', '2', '3', '4'];
  const quarterlyTrends = quarters.map((quarter) => {
    const quarterMetrics = metrics.filter((m) => m.quarter === quarter && m.year === 2024);
    const quarterScores = calculateESGScore(quarterMetrics);
    return {
      quarter: `2024-Q${quarter}`,
      environmental: quarterScores.environmental,
      social: quarterScores.social,
      governance: quarterScores.governance,
    };
  });

  return {
    id: `esg-${loanId}-${Date.now()}`,
    loanId,
    uploadedAt,
    processedAt,
    overallScore: scores.overall,
    environmentalScore: scores.environmental,
    socialScore: scores.social,
    governanceScore: scores.governance,
    metrics,
    greenwashingResult,
    lmaCompliance: {
      score: complianceScore,
      items: complianceItems,
    },
    quarterlyTrends,
  };
}
