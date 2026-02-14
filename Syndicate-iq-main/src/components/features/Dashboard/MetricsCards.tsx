import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Shield, PieChart } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import type { PortfolioMetrics } from '../../../types';
import { formatCurrency } from '../../../lib/utils/formatCurrency';

interface MetricsCardsProps {
  metrics: PortfolioMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const riskDistributionTotal =
    metrics.riskDistribution.low + metrics.riskDistribution.medium + metrics.riskDistribution.high;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-accent-gold/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-accent-gold" />
          </div>
          <Badge variant="info">Portfolio</Badge>
        </div>
        <div>
          <p className="text-2xl font-bold text-white mb-1">
            {formatCurrency(metrics.totalValue)}
          </p>
          <p className="text-sm text-gray-400">Total Portfolio Value</p>
          <p className="text-xs text-gray-500 mt-2">{metrics.totalLoans} loans</p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-semantic-info/20 rounded-lg">
            <Shield className="h-5 w-5 text-semantic-info" />
          </div>
          <Badge variant={metrics.averageRiskScore < 50 ? 'success' : metrics.averageRiskScore < 70 ? 'warning' : 'danger'}>
            {metrics.averageRiskScore < 50 ? 'Low' : metrics.averageRiskScore < 70 ? 'Medium' : 'High'}
          </Badge>
        </div>
        <div>
          <p className="text-2xl font-bold text-white mb-1">{metrics.averageRiskScore.toFixed(1)}</p>
          <p className="text-sm text-gray-400">Average Risk Score</p>
          <div className="flex items-center gap-2 mt-2">
            {metrics.averageRiskScore < 50 ? (
              <TrendingDown className="h-4 w-4 text-semantic-success" />
            ) : (
              <TrendingUp className="h-4 w-4 text-semantic-warning" />
            )}
            <p className="text-xs text-gray-500">Portfolio risk level</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-semantic-success/20 rounded-lg">
            <PieChart className="h-5 w-5 text-semantic-success" />
          </div>
          <Badge variant={metrics.averageESGScore >= 70 ? 'success' : metrics.averageESGScore >= 50 ? 'warning' : 'danger'}>
            {metrics.averageESGScore >= 70 ? 'Good' : metrics.averageESGScore >= 50 ? 'Fair' : 'Poor'}
          </Badge>
        </div>
        <div>
          <p className="text-2xl font-bold text-white mb-1">{metrics.averageESGScore.toFixed(1)}</p>
          <p className="text-sm text-gray-400">Average ESG Score</p>
          <p className="text-xs text-gray-500 mt-2">
            {metrics.esgComplianceRate.toFixed(0)}% compliance rate
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-semantic-danger/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-semantic-danger" />
          </div>
          <Badge variant={metrics.activeAlerts === 0 ? 'success' : metrics.activeAlerts < 5 ? 'warning' : 'danger'}>
            {metrics.activeAlerts} active
          </Badge>
        </div>
        <div>
          <p className="text-2xl font-bold text-white mb-1">{metrics.activeAlerts}</p>
          <p className="text-sm text-gray-400">Active Alerts</p>
          <p className="text-xs text-gray-500 mt-2">Requires attention</p>
        </div>
      </Card>
    </div>
  );
}
