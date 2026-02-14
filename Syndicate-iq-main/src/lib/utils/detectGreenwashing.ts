import { ESGMetric, GreenwashingResult, GreenwashingRisk } from '../../types';

export function detectGreenwashing(metrics: ESGMetric[]): GreenwashingResult {
  const flags = {
    transparencyScore: calculateTransparencyScore(metrics),
    performanceDecline: detectPerformanceDecline(metrics),
    cherryPicking: detectCherryPicking(metrics),
    vagueTargets: detectVagueTargets(metrics),
  };

  const riskFactors: string[] = [];
  let riskLevel: GreenwashingRisk = 'low';

  if (flags.transparencyScore < 60) {
    riskFactors.push('Low transparency score - missing data points');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  if (flags.performanceDecline) {
    riskFactors.push('Performance decline detected - >20% drop in key metrics');
    riskLevel = riskLevel === 'low' ? 'medium' : 'high';
  }

  if (flags.cherryPicking) {
    riskFactors.push('Cherry-picking detected - only positive metrics reported');
    riskLevel = 'medium';
  }

  if (flags.vagueTargets) {
    riskFactors.push('Vague targets - no specific numbers or timelines');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  if (flags.transparencyScore < 40 || (flags.performanceDecline && flags.cherryPicking)) {
    riskLevel = 'high';
  }

  return {
    riskLevel,
    flags,
    riskFactors,
  };
}

function calculateTransparencyScore(metrics: ESGMetric[]): number {
  if (metrics.length === 0) return 0;

  // Check for missing categories
  const categories = new Set(metrics.map((m) => m.category));
  const categoryScore = (categories.size / 3) * 40; // Max 40 points

  // Check for targets (accountability)
  const withTargets = metrics.filter((m) => m.target !== undefined);
  const targetScore = (withTargets.length / metrics.length) * 30; // Max 30 points

  // Check for recent data (all quarters represented)
  const quarters = new Set(metrics.map((m) => `${m.year}-Q${m.quarter}`));
  const recencyScore = Math.min(quarters.size * 5, 30); // Max 30 points

  return Math.round(categoryScore + targetScore + recencyScore);
}

function detectPerformanceDecline(metrics: ESGMetric[]): boolean {
  if (metrics.length < 2) return false;

  // Group by metric name and check trends
  const metricGroups = new Map<string, ESGMetric[]>();
  metrics.forEach((m) => {
    if (!metricGroups.has(m.metric)) {
      metricGroups.set(m.metric, []);
    }
    metricGroups.get(m.metric)!.push(m);
  });

  for (const [, values] of metricGroups) {
    if (values.length < 2) continue;
    const sorted = values.sort((a, b) => {
      const aTime = `${a.year}-${a.quarter}`;
      const bTime = `${b.year}-${b.quarter}`;
      return aTime.localeCompare(bTime);
    });

    const latest = sorted[sorted.length - 1].value;
    const previous = sorted[sorted.length - 2].value;

    if (previous > 0 && (previous - latest) / previous > 0.2) {
      return true; // >20% decline
    }
  }

  return false;
}

function detectCherryPicking(metrics: ESGMetric[]): boolean {
  if (metrics.length < 3) return false;

  // Check if only positive trends are reported
  const metricGroups = new Map<string, ESGMetric[]>();
  metrics.forEach((m) => {
    if (!metricGroups.has(m.metric)) {
      metricGroups.set(m.metric, []);
    }
    metricGroups.get(m.metric)!.push(m);
  });

  let positiveCount = 0;
  let totalTrends = 0;

  for (const [, values] of metricGroups) {
    if (values.length < 2) continue;
    const sorted = values.sort((a, b) => {
      const aTime = `${a.year}-${b.quarter}`;
      const bTime = `${b.year}-${b.quarter}`;
      return aTime.localeCompare(bTime);
    });

    const latest = sorted[sorted.length - 1].value;
    const previous = sorted[sorted.length - 2].value;

    totalTrends++;
    if (latest > previous) {
      positiveCount++;
    }
  }

  // If >90% of trends are positive, likely cherry-picking
  return totalTrends > 0 && positiveCount / totalTrends > 0.9;
}

function detectVagueTargets(metrics: ESGMetric[]): boolean {
  // Check if targets are missing or too vague
  const metricsWithTargets = metrics.filter((m) => m.target !== undefined);
  
  if (metricsWithTargets.length === 0) return true;

  // If less than 30% have targets, consider it vague
  return metricsWithTargets.length / metrics.length < 0.3;
}
