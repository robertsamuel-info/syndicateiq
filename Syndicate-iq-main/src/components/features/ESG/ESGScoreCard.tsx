import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Leaf, Droplets, Users, Shield } from 'lucide-react';

interface ESGScoreCardProps {
  overall: number;
  environmental: number;
  social: number;
  governance: number;
}

export function ESGScoreCard({ overall, environmental, social, governance }: ESGScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-semantic-success';
    if (score >= 60) return 'text-semantic-warning';
    return 'text-semantic-danger';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-semantic-success/20 rounded-lg">
              <Leaf className="h-5 w-5 text-semantic-success" />
            </div>
            <Badge variant={getScoreBadge(overall)}>Overall</Badge>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{overall}</p>
            <p className="text-sm text-gray-400">ESG Score</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-semantic-success/20 rounded-lg">
              <Droplets className="h-5 w-5 text-semantic-success" />
            </div>
            <Badge variant={getScoreBadge(environmental)}>E</Badge>
          </div>
          <div>
            <p className={`text-3xl font-bold mb-1 ${getScoreColor(environmental)}`}>
              {environmental}
            </p>
            <p className="text-sm text-gray-400">Environmental (40%)</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-semantic-info/20 rounded-lg">
              <Users className="h-5 w-5 text-semantic-info" />
            </div>
            <Badge variant={getScoreBadge(social)}>S</Badge>
          </div>
          <div>
            <p className={`text-3xl font-bold mb-1 ${getScoreColor(social)}`}>{social}</p>
            <p className="text-sm text-gray-400">Social (30%)</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-accent-gold/20 rounded-lg">
              <Shield className="h-5 w-5 text-accent-gold" />
            </div>
            <Badge variant={getScoreBadge(governance)}>G</Badge>
          </div>
          <div>
            <p className={`text-3xl font-bold mb-1 ${getScoreColor(governance)}`}>{governance}</p>
            <p className="text-sm text-gray-400">Governance (30%)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
