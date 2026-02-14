import { Card } from '../../ui/Card';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';

interface ComparisonItemProps {
  icon: React.ReactNode;
  label: string;
  traditional: string;
  syndicateiq: string;
  improvement: string;
}

function ComparisonItem({ icon, label, traditional, syndicateiq, improvement }: ComparisonItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
      <div className="p-2 bg-accent-gold/20 rounded-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-300 mb-1">{label}</p>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500">Traditional: </span>
            <span className="text-gray-400 line-through">{traditional}</span>
          </div>
          <span className="text-gray-600">→</span>
          <div>
            <span className="text-gray-500">SyndicateIQ: </span>
            <span className="text-accent-gold font-semibold">{syndicateiq}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 mb-1">Improvement</p>
        <p className="text-sm font-bold text-semantic-success">{improvement}</p>
      </div>
    </div>
  );
}

export function ComparisonCard() {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-6">Before & After Comparison</h3>
      <div className="space-y-3">
        <ComparisonItem
          icon={<Clock className="h-5 w-5 text-accent-gold" />}
          label="Processing Time"
          traditional="14 days"
          syndicateiq="2 hours"
          improvement="85% faster"
        />
        <ComparisonItem
          icon={<DollarSign className="h-5 w-5 text-accent-gold" />}
          label="Cost per Analysis"
          traditional="$20,000"
          syndicateiq="$500"
          improvement="97.5% reduction"
        />
        <ComparisonItem
          icon={<CheckCircle className="h-5 w-5 text-accent-gold" />}
          label="Accuracy Rate"
          traditional="~75%"
          syndicateiq="~95%"
          improvement="+20% improvement"
        />
      </div>
    </Card>
  );
}
