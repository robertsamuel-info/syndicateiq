import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { getRiskLevel } from '../../../lib/utils/calculateRiskScore';

interface RiskScoreGaugeProps {
  score: number;
  expectedDays: number;
}

export function RiskScoreGauge({ score, expectedDays }: RiskScoreGaugeProps) {
  const riskLevel = getRiskLevel(score);
  const percentage = score;

  const getRiskColor = () => {
    if (riskLevel === 'low') return 'semantic-success';
    if (riskLevel === 'medium') return 'semantic-warning';
    return 'semantic-danger';
  };

  const getRiskLabel = () => {
    if (riskLevel === 'low') return 'Low Risk';
    if (riskLevel === 'medium') return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Settlement Risk Score</h3>
          <Badge variant={riskLevel === 'low' ? 'success' : riskLevel === 'medium' ? 'warning' : 'danger'}>
            {getRiskLabel()}
          </Badge>
        </div>

        <div className="relative">
          <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden relative">
            {/* Background zones */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-semantic-success/20" style={{ width: '30%' }} />
              <div className="flex-1 bg-semantic-warning/20" style={{ width: '40%' }} />
              <div className="flex-1 bg-semantic-danger/20" style={{ width: '30%' }} />
            </div>

            {/* Score bar */}
            <div
              className={`absolute bottom-0 left-0 h-full transition-all duration-1000 bg-gradient-to-t ${
                riskLevel === 'low'
                  ? 'from-semantic-success to-semantic-success/70'
                  : riskLevel === 'medium'
                    ? 'from-semantic-warning to-semantic-warning/70'
                    : 'from-semantic-danger to-semantic-danger/70'
              }`}
              style={{ width: `${percentage}%` }}
            />

            {/* Score indicator */}
            <div
              className="absolute bottom-0 h-full w-1 bg-white transition-all duration-1000"
              style={{ left: `${percentage}%` }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white font-bold text-lg">
                {Math.round(score)}
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">0</div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">100</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Expected Settlement Time</span>
            <span className="text-xl font-bold text-accent-gold">{expectedDays} days</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Traditional process: ~14 days
          </p>
        </div>
      </div>
    </Card>
  );
}
