import { useState } from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info, X, Check } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Alert } from '../../../types';
import { formatRelativeTime } from '../../../lib/utils/formatDate';

interface AlertsFeedProps {
  alerts: Alert[];
  onResolve?: (id: string) => void;
}

const severityIcons = {
  critical: XCircle,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

const severityColors = {
  critical: 'text-semantic-danger',
  high: 'text-semantic-danger',
  medium: 'text-semantic-warning',
  low: 'text-semantic-info',
};

export function AlertsFeed({ alerts, onResolve }: AlertsFeedProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAlerts = alerts
    .filter((alert) => {
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesType = typeFilter === 'all' || alert.type === typeFilter;
      return matchesSeverity && matchesType && !alert.resolved;
    })
    .slice(0, 10);

  const getSeverityBadge = (severity: Alert['severity']) => {
    const variants = {
      critical: 'danger' as const,
      high: 'danger' as const,
      medium: 'warning' as const,
      low: 'info' as const,
    };
    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
          <div className="flex gap-3 w-full md:w-auto">
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full md:w-auto"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full md:w-auto"
            >
              <option value="all">All Types</option>
              <option value="covenant-breach">Covenant Breach</option>
              <option value="missing-document">Missing Document</option>
              <option value="esg-deviation">ESG Deviation</option>
              <option value="deadline-reminder">Deadline Reminder</option>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No active alerts found
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const Icon = severityIcons[alert.severity];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-gray-800 ${severityColors[alert.severity]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white truncate">{alert.title}</h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Loan: {alert.loanId}</span>
                      <span>{formatRelativeTime(alert.createdAt)}</span>
                    </div>
                  </div>
                  {onResolve && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResolve(alert.id)}
                      className="flex-shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
