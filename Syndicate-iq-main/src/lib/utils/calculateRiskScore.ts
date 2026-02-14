import { RiskFactors } from '../../types';

export function calculateRiskScore(factors: RiskFactors): number {
  return (
    factors.documentCompleteness * 0.25 +
    factors.amendmentComplexity * 0.20 +
    factors.crossBorderFactors * 0.18 +
    factors.partyHistory * 0.15 +
    factors.covenantStatus * 0.12 +
    factors.marketVolatility * 0.10
  );
}

export function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore < 30) return 'low';
  if (riskScore < 70) return 'medium';
  return 'high';
}

export function estimateSettlementDays(riskScore: number): number {
  // Lower risk = faster settlement
  // High risk (70-100): 18-25 days
  // Medium risk (30-70): 10-18 days
  // Low risk (0-30): 5-10 days
  if (riskScore >= 70) {
    return Math.floor(18 + (riskScore - 70) * 0.23); // 18-25 days
  }
  if (riskScore >= 30) {
    return Math.floor(10 + (riskScore - 30) * 0.2); // 10-18 days
  }
  return Math.floor(5 + (riskScore * 0.17)); // 5-10 days
}
