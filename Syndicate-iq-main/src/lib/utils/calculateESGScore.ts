import { ESGMetric } from '../../types';

export function calculateESGScore(metrics: ESGMetric[]): {
  overall: number;
  environmental: number;
  social: number;
  governance: number;
} {
  const environmental = metrics.filter((m) => m.category === 'environmental');
  const social = metrics.filter((m) => m.category === 'social');
  const governance = metrics.filter((m) => m.category === 'governance');

  const envScore =
    environmental.length > 0
      ? environmental.reduce((sum, m) => sum + m.value, 0) / environmental.length
      : 0;
  const socScore =
    social.length > 0 ? social.reduce((sum, m) => sum + m.value, 0) / social.length : 0;
  const govScore =
    governance.length > 0
      ? governance.reduce((sum, m) => sum + m.value, 0) / governance.length
      : 0;

  // Weighted: E 40%, S 30%, G 30%
  const overall = envScore * 0.4 + socScore * 0.3 + govScore * 0.3;

  return {
    overall: Math.round(overall),
    environmental: Math.round(envScore),
    social: Math.round(socScore),
    governance: Math.round(govScore),
  };
}
