import { CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { LMAComplianceItem } from '../../../types';

interface ComplianceChecklistProps {
  items: LMAComplianceItem[];
  score: number;
}

const categoryLabels: Record<LMAComplianceItem['category'], string> = {
  'use-of-proceeds': 'Use of Proceeds',
  evaluation: 'Evaluation Process',
  management: 'Management',
  reporting: 'Reporting',
};

export function ComplianceChecklist({ items, score }: ComplianceChecklistProps) {
  const itemsByCategory = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<LMAComplianceItem['category'], LMAComplianceItem[]>
  );

  const getScoreColor = () => {
    if (score >= 80) return 'text-semantic-success';
    if (score >= 60) return 'text-semantic-warning';
    return 'text-semantic-danger';
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">LMA Green Loan Terms Compliance</h3>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}</span>
            <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}>
              {score}/100
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {(Object.keys(categoryLabels) as Array<LMAComplianceItem['category']>).map((category) => {
            const categoryItems = itemsByCategory[category] || [];
            if (categoryItems.length === 0) return null;

            const compliantCount = categoryItems.filter((item) => item.compliant).length;

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-300">{categoryLabels[category]}</h4>
                  <span className="text-sm text-gray-400">
                    {compliantCount}/{categoryItems.length} compliant
                  </span>
                </div>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        item.compliant ? 'bg-semantic-success/10 border border-semantic-success/30' : 'bg-semantic-danger/10 border border-semantic-danger/30'
                      }`}
                    >
                      {item.compliant ? (
                        <CheckCircle className="h-5 w-5 text-semantic-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-semantic-danger flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${item.compliant ? 'text-gray-300' : 'text-gray-400'}`}>
                          {item.requirement}
                        </p>
                        {item.evidence && (
                          <p className="text-xs text-gray-500 mt-1">Evidence: {item.evidence}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
