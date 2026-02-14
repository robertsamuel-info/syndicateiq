import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../../lib/utils/formatDate';

interface CovenantSummaryProps {
  upcomingTests: number;
  atRiskCount: number;
  breachedCount: number;
}

export function CovenantSummary({ upcomingTests, atRiskCount, breachedCount }: CovenantSummaryProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-6">Covenant Monitoring</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-semantic-info/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-semantic-info" />
            </div>
            <Badge variant="info">{upcomingTests}</Badge>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{upcomingTests}</p>
          <p className="text-sm text-gray-400">Upcoming Tests (30 days)</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-semantic-warning/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-semantic-warning" />
            </div>
            <Badge variant="warning">{atRiskCount}</Badge>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{atRiskCount}</p>
          <p className="text-sm text-gray-400">At-Risk Covenants</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-semantic-danger/20 rounded-lg">
              <XCircle className="h-5 w-5 text-semantic-danger" />
            </div>
            <Badge variant="danger">{breachedCount}</Badge>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{breachedCount}</p>
          <p className="text-sm text-gray-400">Breached Covenants</p>
        </div>
      </div>
    </Card>
  );
}
