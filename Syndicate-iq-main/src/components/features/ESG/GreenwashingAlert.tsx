import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert } from '../../ui/Alert';
import { Badge } from '../../ui/Badge';
import { GreenwashingResult } from '../../../types';

interface GreenwashingAlertProps {
  result: GreenwashingResult;
}

export function GreenwashingAlert({ result }: GreenwashingAlertProps) {
  const getAlertVariant = () => {
    if (result.riskLevel === 'high') return 'error';
    if (result.riskLevel === 'medium') return 'warning';
    return 'success';
  };

  const getIcon = () => {
    if (result.riskLevel === 'high') return <AlertTriangle className="h-5 w-5" />;
    if (result.riskLevel === 'medium') return <AlertCircle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      <Alert variant={getAlertVariant()} title={`Greenwashing Risk: ${result.riskLevel.toUpperCase()}`}>
        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-3">
            <Badge variant={result.riskLevel === 'high' ? 'danger' : result.riskLevel === 'medium' ? 'warning' : 'success'}>
              {result.riskLevel.toUpperCase()} RISK
            </Badge>
            <span className="text-sm text-gray-300">
              Transparency Score: {result.flags.transparencyScore}/100
            </span>
          </div>

          {result.riskFactors.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Risk Factors:</p>
              <ul className="space-y-1">
                {result.riskFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-semantic-warning mt-1">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-700">
            <div>
              <p className="text-xs text-gray-400 mb-1">Transparency</p>
              <p className="text-sm font-medium text-white">{result.flags.transparencyScore}/100</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Performance Decline</p>
              <p className={`text-sm font-medium ${result.flags.performanceDecline ? 'text-semantic-danger' : 'text-semantic-success'}`}>
                {result.flags.performanceDecline ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Cherry-Picking</p>
              <p className={`text-sm font-medium ${result.flags.cherryPicking ? 'text-semantic-warning' : 'text-semantic-success'}`}>
                {result.flags.cherryPicking ? 'Detected' : 'None'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Vague Targets</p>
              <p className={`text-sm font-medium ${result.flags.vagueTargets ? 'text-semantic-warning' : 'text-semantic-success'}`}>
                {result.flags.vagueTargets ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
}
