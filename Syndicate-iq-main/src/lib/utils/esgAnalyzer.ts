/**
 * ESG Analyzer Engine
 * Analyzes extracted PDF text for ESG signals and calculates risk scores
 */

export interface ESGResult {
  environmental: number;
  social: number;
  governance: number;
  totalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  insights: string[];
  detectedSignals: {
    environmental: string[];
    social: string[];
    governance: string[];
  };
}

/**
 * Analyzes text for ESG signals and calculates risk scores
 * @param text - Extracted text from PDF
 * @returns ESG analysis result with scores and insights
 */
export function analyzeESG(text: string): ESGResult {
  const lowerText = text.toLowerCase();
  const insights: string[] = [];
  const detectedSignals = {
    environmental: [] as string[],
    social: [] as string[],
    governance: [] as string[],
  };

  let environmental = 0;
  let social = 0;
  let governance = 0;

  // 🌱 Environmental Signals
  const envKeywords = [
    { word: 'renewable', score: 25, signal: 'Renewable energy' },
    { word: 'solar', score: 20, signal: 'Solar energy' },
    { word: 'wind', score: 20, signal: 'Wind energy' },
    { word: 'co2', score: 20, signal: 'CO2 emissions' },
    { word: 'carbon', score: 20, signal: 'Carbon footprint' },
    { word: 'emission', score: 15, signal: 'Emission reduction' },
    { word: 'greenhouse', score: 15, signal: 'Greenhouse gas' },
    { word: 'sustainability', score: 15, signal: 'Sustainability' },
    { word: 'water', score: 10, signal: 'Water management' },
    { word: 'waste', score: 10, signal: 'Waste management' },
    { word: 'recycling', score: 10, signal: 'Recycling' },
    { word: 'biodiversity', score: 15, signal: 'Biodiversity' },
    { word: 'climate', score: 15, signal: 'Climate action' },
    { word: 'environmental', score: 10, signal: 'Environmental' },
  ];

  envKeywords.forEach(({ word, score, signal }) => {
    if (lowerText.includes(word)) {
      environmental += score;
      if (!detectedSignals.environmental.includes(signal)) {
        detectedSignals.environmental.push(signal);
      }
    }
  });

  if (environmental > 0) {
    insights.push(`Environmental initiatives detected (${detectedSignals.environmental.length} signals)`);
  }

  // 👥 Social Signals
  const socialKeywords = [
    { word: 'employee', score: 15, signal: 'Employee relations' },
    { word: 'training', score: 15, signal: 'Employee training' },
    { word: 'diversity', score: 20, signal: 'Diversity & inclusion' },
    { word: 'inclusion', score: 20, signal: 'Inclusion' },
    { word: 'safety', score: 20, signal: 'Safety standards' },
    { word: 'health', score: 15, signal: 'Health & safety' },
    { word: 'compliance', score: 15, signal: 'Compliance' },
    { word: 'community', score: 15, signal: 'Community engagement' },
    { word: 'human rights', score: 25, signal: 'Human rights' },
    { word: 'labor', score: 15, signal: 'Labor practices' },
    { word: 'workplace', score: 10, signal: 'Workplace standards' },
    { word: 'stakeholder', score: 10, signal: 'Stakeholder engagement' },
  ];

  socialKeywords.forEach(({ word, score, signal }) => {
    if (lowerText.includes(word)) {
      social += score;
      if (!detectedSignals.social.includes(signal)) {
        detectedSignals.social.push(signal);
      }
    }
  });

  if (social > 0) {
    insights.push(`Social responsibility measures found (${detectedSignals.social.length} signals)`);
  }

  // 🏛 Governance Signals
  const govKeywords = [
    { word: 'audit', score: 25, signal: 'Audit oversight' },
    { word: 'board', score: 20, signal: 'Board governance' },
    { word: 'risk management', score: 25, signal: 'Risk management' },
    { word: 'policy', score: 15, signal: 'Policy framework' },
    { word: 'ethics', score: 20, signal: 'Ethics' },
    { word: 'transparency', score: 20, signal: 'Transparency' },
    { word: 'accountability', score: 20, signal: 'Accountability' },
    { word: 'compliance', score: 15, signal: 'Compliance framework' },
    { word: 'oversight', score: 15, signal: 'Oversight' },
    { word: 'governance', score: 15, signal: 'Governance structure' },
    { word: 'internal control', score: 20, signal: 'Internal controls' },
    { word: 'regulatory', score: 15, signal: 'Regulatory compliance' },
  ];

  govKeywords.forEach(({ word, score, signal }) => {
    if (lowerText.includes(word)) {
      governance += score;
      if (!detectedSignals.governance.includes(signal)) {
        detectedSignals.governance.push(signal);
      }
    }
  });

  if (governance > 0) {
    insights.push(`Governance framework detected (${detectedSignals.governance.length} signals)`);
  }

  // Calculate total score (capped at 100 per category)
  environmental = Math.min(environmental, 100);
  social = Math.min(social, 100);
  governance = Math.min(governance, 100);

  const totalScore = environmental + social + governance;
  const maxPossibleScore = 300;

  // Determine risk level based on total score
  let riskLevel: ESGResult['riskLevel'] = 'HIGH';
  const scorePercentage = (totalScore / maxPossibleScore) * 100;

  if (scorePercentage >= 60) {
    riskLevel = 'LOW';
  } else if (scorePercentage >= 30) {
    riskLevel = 'MEDIUM';
  }

  // Add overall insight
  if (totalScore === 0) {
    insights.push('No ESG signals detected in document');
  } else {
    insights.push(`Overall ESG score: ${Math.round(scorePercentage)}% (${totalScore}/${maxPossibleScore})`);
  }

  return {
    environmental,
    social,
    governance,
    totalScore,
    riskLevel,
    insights,
    detectedSignals,
  };
}
