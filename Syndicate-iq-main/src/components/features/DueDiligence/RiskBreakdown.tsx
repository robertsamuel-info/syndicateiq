import { Card } from '../../ui/Card';
import { RiskFactors } from '../../../types';

interface RiskBreakdownProps {
  factors: RiskFactors;
  riskScore: number;
}

const factorLabels: Record<keyof RiskFactors, string> = {
  documentCompleteness: 'Document Completeness',
  amendmentComplexity: 'Amendment Complexity',
  crossBorderFactors: 'Cross-Border Factors',
  partyHistory: 'Party History',
  covenantStatus: 'Covenant Status',
  marketVolatility: 'Market Volatility',
};

const factorWeights: Record<keyof RiskFactors, number> = {
  documentCompleteness: 0.25,
  amendmentComplexity: 0.20,
  crossBorderFactors: 0.18,
  partyHistory: 0.15,
  covenantStatus: 0.12,
  marketVolatility: 0.10,
};

export function RiskBreakdown({ factors, riskScore }: RiskBreakdownProps) {
  const factorEntries = Object.entries(factors) as Array<[keyof RiskFactors, number]>;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-6">Risk Factor Breakdown</h3>
      <div className="space-y-4">
        {factorEntries.map(([key, value]) => {
          const contribution = value * factorWeights[key];
          const percentage = (contribution / riskScore) * 100;

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{factorLabels[key]}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{Math.round(value)}</span>
                  <span className="text-accent-gold font-medium w-16 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-gold/60 to-accent-gold transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Weight: {(factorWeights[key] * 100).toFixed(0)}%</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
