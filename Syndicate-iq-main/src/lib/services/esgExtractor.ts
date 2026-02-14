/**
 * ESG Extraction Engine
 * Dynamically extracts ESG metrics from document text (NO DEFAULT DATA)
 * Handles missing data correctly - returns null/undefined instead of defaults
 */

export interface ESGChunk {
  section: string;
  content: string;
  confidence: number;
}

export interface ExtractedESGMetric {
  value: number | string | null;
  unit?: string;
  status: 'found' | 'missing' | 'partial';
  confidence: 'high' | 'medium' | 'low';
  source?: string; // Text snippet where found
  baselineYear?: number | null;
}

export interface ExtractedESGMetrics {
  // Emissions
  carbonEmissions: {
    scope1: ExtractedESGMetric | null;
    scope2: ExtractedESGMetric | null;
    scope3: ExtractedESGMetric | null;
    unit: string;
    baselineYear: number | null;
  };
  
  // Renewable Energy
  renewableEnergy: {
    percentage: ExtractedESGMetric | null;
    totalMWh: ExtractedESGMetric | null;
  };
  
  // Water
  waterUsage: {
    totalLiters: ExtractedESGMetric | null;
    recycledPercentage: ExtractedESGMetric | null;
  };
  
  // Waste
  wasteRecycling: {
    rate: ExtractedESGMetric | null;
  };
  
  // Diversity
  diversity: {
    womenInLeadership: ExtractedESGMetric | null;
    boardDiversity: ExtractedESGMetric | null;
  };
  
  // Safety
  safety: {
    incidents: ExtractedESGMetric | null;
    lostTimeRate: ExtractedESGMetric | null;
  };
  
  // Community
  community: {
    investment: ExtractedESGMetric | null;
    volunteerHours: ExtractedESGMetric | null;
  };
  
  // Claimed Improvements
  claimedImprovements: Array<{
    metric: string;
    claimed: string;
    baseline: string;
    source?: string;
  }>;
  
  // Metadata
  metadata: {
    companyName: string | null;
    reportingYear: number | null;
    geography: string | null;
    frameworkReferences: string[];
    documentType: string | null;
    completeness: number; // 0-100
  };
}

/**
 * Semantically chunks document text into ESG sections
 */
export function chunkESGSections(text: string): ESGChunk[] {
  const chunks: ESGChunk[] = [];
  const lowerText = text.toLowerCase();
  
  // Define ESG section patterns
  const sectionPatterns = [
    { name: 'Emissions', patterns: [/emissions?/i, /carbon/i, /co2/i, /greenhouse\s+gas/i, /ghg/i, /scope\s*[123]/i] },
    { name: 'Energy', patterns: [/renewable\s+energy/i, /energy\s+consumption/i, /solar/i, /wind/i, /power/i] },
    { name: 'Water', patterns: [/water\s+usage/i, /water\s+consumption/i, /water\s+management/i] },
    { name: 'Waste', patterns: [/waste/i, /recycling/i, /circular\s+economy/i] },
    { name: 'Governance', patterns: [/governance/i, /board/i, /ethics/i, /compliance/i, /audit/i] },
    { name: 'Diversity', patterns: [/diversity/i, /inclusion/i, /gender/i, /women/i] },
    { name: 'Safety', patterns: [/safety/i, /health\s+and\s+safety/i, /incident/i, /lost\s+time/i] },
    { name: 'Community', patterns: [/community/i, /social\s+investment/i, /volunteer/i] },
    { name: 'Certifications', patterns: [/certification/i, /iso/i, /audit/i, /verified/i] },
  ];
  
  // Extract sections by finding relevant paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  
  sectionPatterns.forEach(({ name, patterns }) => {
    const relevantParagraphs = paragraphs.filter(para => {
      const lowerPara = para.toLowerCase();
      return patterns.some(pattern => pattern.test(lowerPara));
    });
    
    if (relevantParagraphs.length > 0) {
      chunks.push({
        section: name,
        content: relevantParagraphs.join('\n\n'),
        confidence: Math.min(90, 50 + (relevantParagraphs.length * 10)),
      });
    }
  });
  
  return chunks;
}

/**
 * Extracts numeric value from text with unit
 */
function extractNumericValue(text: string, patterns: RegExp[]): {
  value: number | null;
  unit?: string;
  source?: string;
} | null {
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      // Try to extract number
      const numberMatch = matches[0].match(/[\d,]+\.?\d*/);
      if (numberMatch) {
        const value = parseFloat(numberMatch[0].replace(/,/g, ''));
        if (!isNaN(value)) {
          // Extract unit
          const unitMatch = matches[0].match(/(%|tco2e|mwh|liters?|tons?|kg|g|million|billion|m|b)/i);
          const unit = unitMatch ? unitMatch[1] : undefined;
          
          return {
            value,
            unit,
            source: matches[0].substring(0, 100),
          };
        }
      }
    }
  }
  return null;
}

/**
 * Extracts Scope 1, 2, 3 emissions
 */
function extractEmissions(text: string): {
  scope1: ExtractedESGMetric | null;
  scope2: ExtractedESGMetric | null;
  scope3: ExtractedESGMetric | null;
  unit: string;
  baselineYear: number | null;
} {
  const lowerText = text.toLowerCase();
  
  // Scope 1 patterns
  const scope1Patterns = [
    /scope\s*1[:\s]+([\d,]+\.?\d*)/i,
    /scope\s*1\s+emissions[:\s]+([\d,]+\.?\d*)/i,
    /direct\s+emissions[:\s]+([\d,]+\.?\d*)/i,
  ];
  
  // Scope 2 patterns
  const scope2Patterns = [
    /scope\s*2[:\s]+([\d,]+\.?\d*)/i,
    /scope\s*2\s+emissions[:\s]+([\d,]+\.?\d*)/i,
    /indirect\s+emissions[:\s]+([\d,]+\.?\d*)/i,
  ];
  
  // Scope 3 patterns
  const scope3Patterns = [
    /scope\s*3[:\s]+([\d,]+\.?\d*)/i,
    /scope\s*3\s+emissions[:\s]+([\d,]+\.?\d*)/i,
    /value\s+chain\s+emissions[:\s]+([\d,]+\.?\d*)/i,
  ];
  
  const scope1 = extractNumericValue(text, scope1Patterns);
  const scope2 = extractNumericValue(text, scope2Patterns);
  const scope3 = extractNumericValue(text, scope3Patterns);
  
  // Check for section mentions even without values
  const hasCarbonEmissionsSection = /carbon\s+emissions?\s+(?:reduction|reporting|data|metrics?)/i.test(text) || 
                                     /emissions?\s+(?:reduction|reporting|data|metrics?)/i.test(text);
  const hasScope1Mention = /scope\s*1/i.test(text) || /direct\s+emissions?/i.test(text);
  const hasScope2Mention = /scope\s*2/i.test(text) || /indirect\s+emissions?/i.test(text);
  const hasScope3Mention = /scope\s*3/i.test(text) || /value\s+chain\s+emissions?/i.test(text);
  
  // Extract unit (default to tCO2e)
  const unitMatch = text.match(/(tco2e|t\s*co2e|tons?|mt\s*co2e)/i);
  const unit = unitMatch ? unitMatch[1] : 'tCO2e';
  
  // Extract baseline year
  const baselineMatch = text.match(/baseline\s+year[:\s]+(\d{4})/i) || text.match(/(\d{4})\s+baseline/i);
  const baselineYear = baselineMatch ? parseInt(baselineMatch[1]) : null;
  
  return {
    scope1: scope1 ? {
      value: scope1.value,
      unit: scope1.unit || unit,
      status: 'found',
      confidence: 'high',
      source: scope1.source,
    } : (hasScope1Mention || hasCarbonEmissionsSection ? {
      value: 'Present',
      unit: unit,
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
    scope2: scope2 ? {
      value: scope2.value,
      unit: scope2.unit || unit,
      status: 'found',
      confidence: 'high',
      source: scope2.source,
    } : (hasScope2Mention || hasCarbonEmissionsSection ? {
      value: 'Present',
      unit: unit,
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
    scope3: scope3 ? {
      value: scope3.value,
      unit: scope3.unit || unit,
      status: 'found',
      confidence: 'high',
      source: scope3.source,
    } : (hasScope3Mention || hasCarbonEmissionsSection ? {
      value: 'Present',
      unit: unit,
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
    unit,
    baselineYear,
  };
}

/**
 * Extracts renewable energy percentage
 */
function extractRenewableEnergy(text: string): {
  percentage: ExtractedESGMetric | null;
  totalMWh: ExtractedESGMetric | null;
} {
  // Percentage patterns
  const percentagePatterns = [
    /renewable\s+energy[:\s]+([\d,]+\.?\d*)\s*%/i,
    /([\d,]+\.?\d*)\s*%\s+renewable/i,
    /renewable[:\s]+([\d,]+\.?\d*)\s*%/i,
  ];
  
  // Total MWh patterns
  const mwhPatterns = [
    /renewable\s+energy[:\s]+([\d,]+\.?\d*)\s*mwh/i,
    /([\d,]+\.?\d*)\s*mwh\s+renewable/i,
  ];
  
  const percentage = extractNumericValue(text, percentagePatterns);
  const totalMWh = extractNumericValue(text, mwhPatterns);
  
  // Check for section mentions even without values
  const hasRenewableEnergySection = /renewable\s+energy\s+(?:usage|consumption|reporting|data|metrics?)/i.test(text) ||
                                     /renewable\s+energy/i.test(text);
  
  return {
    percentage: percentage ? {
      value: percentage.value,
      unit: '%',
      status: 'found',
      confidence: 'high',
      source: percentage.source,
    } : (hasRenewableEnergySection ? {
      value: 'Present',
      unit: '%',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
    totalMWh: totalMWh ? {
      value: totalMWh.value,
      unit: 'MWh',
      status: 'found',
      confidence: 'high',
      source: totalMWh.source,
    } : (hasRenewableEnergySection ? {
      value: 'Present',
      unit: 'MWh',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
  };
}

/**
 * Extracts water usage metrics
 */
function extractWaterUsage(text: string): {
  totalLiters: ExtractedESGMetric | null;
  recycledPercentage: ExtractedESGMetric | null;
} {
  const totalPatterns = [
    /water\s+usage[:\s]+([\d,]+\.?\d*)\s*(liters?|m³|m3|million\s+liters?)/i,
    /water\s+consumption[:\s]+([\d,]+\.?\d*)/i,
  ];
  
  const recycledPatterns = [
    /water\s+recycled[:\s]+([\d,]+\.?\d*)\s*%/i,
    /([\d,]+\.?\d*)\s*%\s+water\s+recycled/i,
  ];
  
  const total = extractNumericValue(text, totalPatterns);
  const recycled = extractNumericValue(text, recycledPatterns);
  
  // Check for section mentions even without values
  const hasWaterSection = /water\s+(?:usage|consumption|reduction|management|reporting|data|metrics?)/i.test(text) ||
                          /water\s+reduction/i.test(text);
  
  // Convert to liters if needed
  let totalValue = total?.value || null;
  if (total && total.unit && (total.unit.includes('million') || total.unit.includes('m'))) {
    totalValue = (total.value || 0) * 1000000;
  }
  
  return {
    totalLiters: totalValue !== null ? {
      value: totalValue,
      unit: 'liters',
      status: 'found',
      confidence: 'high',
      source: total?.source,
    } : (hasWaterSection ? {
      value: 'Present',
      unit: 'liters',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
    recycledPercentage: recycled ? {
      value: recycled.value,
      unit: '%',
      status: 'found',
      confidence: 'high',
      source: recycled.source,
    } : (hasWaterSection ? {
      value: 'Present',
      unit: '%',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
  };
}

/**
 * Extracts waste recycling rate
 */
function extractWasteRecycling(text: string): {
  rate: ExtractedESGMetric | null;
} {
  const patterns = [
    /waste\s+recycling[:\s]+([\d,]+\.?\d*)\s*%/i,
    /recycling\s+rate[:\s]+([\d,]+\.?\d*)\s*%/i,
    /([\d,]+\.?\d*)\s*%\s+waste\s+recycled/i,
  ];
  
  const result = extractNumericValue(text, patterns);
  
  // Check for section mentions even without values
  const hasWasteSection = /waste\s+(?:recycling|reduction|management|reporting|data|metrics?)/i.test(text) ||
                          /waste\s+recycling/i.test(text);
  
  return {
    rate: result ? {
      value: result.value,
      unit: '%',
      status: 'found',
      confidence: 'high',
      source: result.source,
    } : (hasWasteSection ? {
      value: 'Present',
      unit: '%',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
  };
}

/**
 * Extracts diversity metrics
 */
function extractDiversity(text: string): {
  womenInLeadership: ExtractedESGMetric | null;
  boardDiversity: ExtractedESGMetric | null;
} {
  const womenPatterns = [
    /women\s+in\s+leadership[:\s]+([\d,]+\.?\d*)\s*%/i,
    /([\d,]+\.?\d*)\s*%\s+women\s+in\s+(leadership|management)/i,
    /gender\s+diversity[:\s]+([\d,]+\.?\d*)\s*%/i,
  ];
  
  const boardPatterns = [
    /board\s+diversity[:\s]+([\d,]+\.?\d*)\s*%/i,
    /([\d,]+\.?\d*)\s*%\s+board\s+diversity/i,
  ];
  
  const women = extractNumericValue(text, womenPatterns);
  const board = extractNumericValue(text, boardPatterns);
  
  // Check for section mentions even without values
  const hasDiversitySection = /(?:gender\s+)?diversity/i.test(text) ||
                              /women\s+in\s+leadership/i.test(text) ||
                              /gender\s+diversity/i.test(text);
  
  return {
    womenInLeadership: women ? {
      value: women.value,
      unit: '%',
      status: 'found',
      confidence: 'high',
      source: women.source,
    } : (hasDiversitySection ? {
      value: 'Present',
      unit: '%',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
    boardDiversity: board ? {
      value: board.value,
      unit: '%',
      status: 'found',
      confidence: 'high',
      source: board.source,
    } : (hasDiversitySection ? {
      value: 'Present',
      unit: '%',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
  };
}

/**
 * Extracts safety metrics
 */
function extractSafety(text: string): {
  incidents: ExtractedESGMetric | null;
  lostTimeRate: ExtractedESGMetric | null;
} {
  const incidentPatterns = [
    /safety\s+incidents[:\s]+([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s+incidents/i,
  ];
  
  const ltrPatterns = [
    /lost\s+time\s+rate[:\s]+([\d,]+\.?\d*)/i,
    /ltr[:\s]+([\d,]+\.?\d*)/i,
  ];
  
  const incidents = extractNumericValue(text, incidentPatterns);
  const ltr = extractNumericValue(text, ltrPatterns);
  
  // Check for section mentions even without values
  const hasSafetySection = /safety\s+(?:incidents?|reporting|data|metrics?)/i.test(text) ||
                           /safety\s+incidents/i.test(text);
  
  return {
    incidents: incidents ? {
      value: incidents.value,
      unit: 'count',
      status: 'found',
      confidence: 'high',
      source: incidents.source,
    } : (hasSafetySection ? {
      value: 'Present',
      unit: 'count',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
    lostTimeRate: ltr ? {
      value: ltr.value,
      unit: 'per 200k hours',
      status: 'found',
      confidence: 'high',
      source: ltr.source,
    } : (hasSafetySection ? {
      value: 'Present',
      unit: 'per 200k hours',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
  };
}

/**
 * Extracts community investment metrics
 */
function extractCommunity(text: string): {
  investment: ExtractedESGMetric | null;
  volunteerHours: ExtractedESGMetric | null;
} {
  const investmentPatterns = [
    /community\s+investment[:\s]+([\d,]+\.?\d*)/i,
    /social\s+investment[:\s]+([\d,]+\.?\d*)/i,
  ];
  
  const volunteerPatterns = [
    /volunteer\s+hours[:\s]+([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s+volunteer\s+hours/i,
  ];
  
  const investment = extractNumericValue(text, investmentPatterns);
  const volunteer = extractNumericValue(text, volunteerPatterns);
  
  // Check for section mentions even without values
  const hasCommunitySection = /community\s+(?:investment|reporting|data|metrics?)/i.test(text) ||
                              /community\s+investment/i.test(text);
  
  return {
    investment: investment ? {
      value: investment.value,
      unit: investment.unit || 'USD',
      status: 'found',
      confidence: 'high',
      source: investment.source,
    } : (hasCommunitySection ? {
      value: 'Present',
      unit: 'USD',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
    volunteerHours: volunteer ? {
      value: volunteer.value,
      unit: 'hours',
      status: 'found',
      confidence: 'high',
      source: volunteer.source,
    } : (hasCommunitySection ? {
      value: 'Present',
      unit: 'hours',
      status: 'partial',
      confidence: 'medium',
      source: 'Section mentioned in document',
    } : null),
  };
}

/**
 * Extracts claimed improvements
 */
function extractClaimedImprovements(text: string): Array<{
  metric: string;
  claimed: string;
  baseline: string;
  source?: string;
}> {
  const improvements: Array<{ metric: string; claimed: string; baseline: string; source?: string }> = [];
  
  // Pattern: "achieved X% reduction" or "reduced by X%"
  const reductionPatterns = [
    /(?:achieved|reduced|decreased)\s+([\d,]+\.?\d*)\s*%\s+(?:reduction|decrease|in\s+(?:carbon|emissions|energy|water|waste))/i,
    /(?:carbon|emission|energy|water|waste)\s+reduction[:\s]+([\d,]+\.?\d*)\s*%/i,
  ];
  
  reductionPatterns.forEach(pattern => {
    const matches = text.matchAll(new RegExp(pattern.source, 'gi'));
    for (const match of matches) {
      const claimed = `${match[1]}%`;
      const baselineMatch = text.substring(Math.max(0, match.index! - 200), match.index! + 200).match(/(\d{4})/);
      improvements.push({
        metric: 'Carbon Reduction',
        claimed,
        baseline: baselineMatch ? baselineMatch[1] : 'Unknown',
        source: match[0].substring(0, 100),
      });
    }
  });
  
  return improvements;
}

/**
 * Extracts document metadata
 */
function extractMetadata(text: string): ExtractedESGMetrics['metadata'] {
  // Company name - enhanced patterns
  const companyPatterns = [
    /(?:company|borrower|organization)[:\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|PLC|AG|SA|Co|Company|Limited))/i,
    /company[:\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|PLC|AG|SA|Co|Company|Limited))/i,
  ];
  let companyName: string | null = null;
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      companyName = match[1].trim();
      break;
    }
  }
  
  // Reporting year - enhanced patterns including "Period: FY 2025" format
  const yearPatterns = [
    /(?:reporting|fiscal|year|period)[:\s]+(?:fy\s*)?(\d{4})/i,
    /(?:reporting|fiscal|year)[:\s]+(\d{4})/i,
    /period[:\s]+(?:fy\s*)?(\d{4})/i,
  ];
  let reportingYear: number | null = null;
  for (const pattern of yearPatterns) {
    const yearMatch = text.match(pattern);
    if (yearMatch) {
      reportingYear = parseInt(yearMatch[1]);
      break;
    }
  }
  
  // Geography
  const geoPatterns = [/country[:\s]+([A-Z][a-z]+)/i, /location[:\s]+([A-Z][a-z]+)/i];
  let geography: string | null = null;
  for (const pattern of geoPatterns) {
    const match = text.match(pattern);
    if (match) {
      geography = match[1];
      break;
    }
  }
  
  // Framework references
  const frameworks: string[] = [];
  if (/lma/i.test(text)) frameworks.push('LMA');
  if (/gri/i.test(text)) frameworks.push('GRI');
  if (/eu\s+taxonomy/i.test(text)) frameworks.push('EU Taxonomy');
  if (/tcfd/i.test(text)) frameworks.push('TCFD');
  if (/sasb/i.test(text)) frameworks.push('SASB');
  
  // Document type
  let documentType: string | null = null;
  if (/esg\s+report/i.test(text)) documentType = 'ESG Report';
  else if (/green\s+loan/i.test(text)) documentType = 'Green Loan Agreement';
  else if (/sustainability/i.test(text)) documentType = 'Sustainability Report';
  else if (/impact\s+report/i.test(text)) documentType = 'Impact Report';
  
  // Calculate completeness (count found metrics)
  const foundMetrics = [
    companyName, reportingYear, geography,
    /scope\s*[123]/i.test(text),
    /renewable/i.test(text),
    /water/i.test(text),
    /waste/i.test(text),
    /diversity/i.test(text),
  ].filter(Boolean).length;
  
  const completeness = Math.round((foundMetrics / 8) * 100);
  
  return {
    companyName,
    reportingYear,
    geography,
    frameworkReferences: frameworks,
    documentType,
    completeness,
  };
}

/**
 * Main extraction function - extracts all ESG metrics from document text
 * Returns null/undefined for missing data (NO DEFAULT VALUES)
 */
export function extractESGMetrics(text: string): ExtractedESGMetrics {
  // Extract all metrics
  const emissions = extractEmissions(text);
  const renewableEnergy = extractRenewableEnergy(text);
  const waterUsage = extractWaterUsage(text);
  const wasteRecycling = extractWasteRecycling(text);
  const diversity = extractDiversity(text);
  const safety = extractSafety(text);
  const community = extractCommunity(text);
  const claimedImprovements = extractClaimedImprovements(text);
  const metadata = extractMetadata(text);
  
  return {
    carbonEmissions: emissions,
    renewableEnergy,
    waterUsage,
    wasteRecycling,
    diversity,
    safety,
    community,
    claimedImprovements,
    metadata,
  };
}
