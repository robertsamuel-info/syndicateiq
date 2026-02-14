/**
 * Local Document Parser
 * Extracts loan document data using pattern matching (no API required)
 * Works fully offline for hackathon/demo purposes
 */

import { type LoanDocument } from '@/types';

export interface ParseResult {
  success: boolean;
  data?: LoanDocument;
  error?: string;
  confidenceScore?: number;
}

/**
 * Extracts borrower name from text
 */
function extractBorrower(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Common patterns for borrower identification
  const patterns = [
    /borrower[:\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|PLC|AG|SA|Co|Company))/i,
    /borrower[:\s]+([A-Z][A-Za-z\s&,\.]+)/i,
    /(?:the\s+)?([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|PLC|AG|SA|Co|Company))\s+(?:herein|hereinafter|shall|agrees)/i,
    /party[:\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|PLC|AG|SA|Co|Company))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const borrower = match[1].trim();
      // Filter out common false positives
      if (!borrower.match(/^(this|that|the|agreement|loan|facility)$/i)) {
        return borrower;
      }
    }
  }

  return 'Not found in document';
}

/**
 * Extracts loan amount and currency
 */
function extractAmount(text: string): { amount: number; currency: string } {
  // Patterns for amounts: $250,000,000 or USD 250,000,000 or 250 million USD
  const patterns = [
    /(?:USD|US\$|\$)\s*([\d,]+(?:\.[\d]+)?)\s*(?:million|billion|M|B)?/i,
    /([\d,]+(?:\.[\d]+)?)\s*(?:million|billion|M|B)?\s*(?:USD|US\$|\$)/i,
    /principal\s+amount[:\s]+(?:USD|US\$|\$)?\s*([\d,]+(?:\.[\d]+)?)/i,
    /loan\s+amount[:\s]+(?:USD|US\$|\$)?\s*([\d,]+(?:\.[\d]+)?)/i,
    /facility\s+amount[:\s]+(?:USD|US\$|\$)?\s*([\d,]+(?:\.[\d]+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let amountStr = match[1].replace(/,/g, '');
      const multiplier = text.match(/(million|billion|M|B)/i)?.[1]?.toLowerCase();
      
      let amount = parseFloat(amountStr);
      if (multiplier === 'million' || multiplier === 'm') {
        amount *= 1_000_000;
      } else if (multiplier === 'billion' || multiplier === 'b') {
        amount *= 1_000_000_000;
      }

      // Determine currency
      const currencyMatch = text.match(/(USD|EUR|GBP|JPY|CHF|CAD|AUD)/i);
      const currency = currencyMatch ? currencyMatch[1].toUpperCase() : 'USD';

      if (amount > 0) {
        return { amount: Math.round(amount), currency };
      }
    }
  }

  return { amount: 0, currency: 'Not found in document' };
}

/**
 * Extracts interest rate
 */
function extractInterestRate(text: string): string {
  const patterns = [
    /interest\s+rate[:\s]+([^\n]+)/i,
    /rate[:\s]+(?:of\s+)?([^\n]+(?:SOFR|LIBOR|EURIBOR|base|prime)[^\n]+)/i,
    /(?:SOFR|LIBOR|EURIBOR)\s*[+\-]\s*[\d.]+%/i,
    /[\d.]+%\s*(?:per\s+)?annum/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const rate = match[1] || match[0];
      if (rate && rate.length < 100) {
        return rate.trim();
      }
    }
  }

  return 'Not found in document';
}

/**
 * Extracts maturity date
 */
function extractMaturityDate(text: string): string {
  const patterns = [
    /maturity\s+date[:\s]+(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
    /maturity[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
    /due\s+date[:\s]+(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
    /expir(?:y|ation)[:\s]+(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return 'Not found in document';
}

/**
 * Extracts facility type
 */
function extractFacilityType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('revolving') || lowerText.includes('revolver')) {
    return 'Revolving Credit Facility';
  }
  if (lowerText.includes('term loan')) {
    return 'Term Loan';
  }
  if (lowerText.includes('bridge loan')) {
    return 'Bridge Loan';
  }
  if (lowerText.includes('working capital')) {
    return 'Working Capital Facility';
  }
  if (lowerText.includes('credit facility')) {
    return 'Credit Facility';
  }

  return 'Not found in document';
}

/**
 * Extracts financial covenants
 */
function extractFinancialCovenants(text: string) {
  const covenants = [];
  const lowerText = text.toLowerCase();

  // Debt/EBITDA
  if (lowerText.includes('debt') && lowerText.includes('ebitda')) {
    const match = text.match(/debt[\/\s]*ebitda[:\s]+([<>≤≥=]\s*[\d.]+x?)/i);
    if (match) {
      covenants.push({
        type: 'Debt/EBITDA',
        limit: match[1].trim(),
        frequency: 'Quarterly',
      });
    }
  }

  // Interest Coverage
  if (lowerText.includes('interest coverage')) {
    const match = text.match(/interest\s+coverage[:\s]+([<>≤≥=]\s*[\d.]+x?)/i);
    if (match) {
      covenants.push({
        type: 'Interest Coverage',
        limit: match[1].trim(),
        frequency: 'Quarterly',
      });
    }
  }

  // Current Ratio
  if (lowerText.includes('current ratio')) {
    const match = text.match(/current\s+ratio[:\s]+([<>≤≥=]\s*[\d.]+x?)/i);
    if (match) {
      covenants.push({
        type: 'Current Ratio',
        limit: match[1].trim(),
        frequency: 'Quarterly',
      });
    }
  }

  return covenants;
}

/**
 * Extracts ESG obligations
 */
function extractESGObligations(text: string) {
  const lowerText = text.toLowerCase();
  const targets: string[] = [];

  // Look for ESG-related targets
  const esgPatterns = [
    /carbon\s+reduction[:\s]+([^\n]+)/i,
    /renewable\s+energy[:\s]+([^\n]+)/i,
    /emission\s+reduction[:\s]+([^\n]+)/i,
    /sustainability[:\s]+([^\n]+)/i,
  ];

  for (const pattern of esgPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const target = match[1].trim().substring(0, 100);
      if (target.length > 10) {
        targets.push(target);
      }
    }
  }

  // Determine reporting frequency
  let reportingFrequency = 'Not found in document';
  if (lowerText.includes('annual') && lowerText.includes('esg')) {
    reportingFrequency = 'Annual';
  } else if (lowerText.includes('quarterly') && lowerText.includes('esg')) {
    reportingFrequency = 'Quarterly';
  }

  // Check if verification is required
  const verificationRequired = lowerText.includes('verification') && 
                               (lowerText.includes('esg') || lowerText.includes('sustainability'));

  return {
    targets,
    reportingFrequency,
    verificationRequired,
  };
}

/**
 * Extracts parties (lenders, agent, trustee)
 */
function extractParties(text: string) {
  const lenders: string[] = [];
  const lowerText = text.toLowerCase();

  // Look for lender patterns
  const lenderPatterns = [
    /lender[s]?[:\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|Bank|Banking))/gi,
    /(?:the\s+)?([A-Z][A-Za-z\s&,\.]+(?:Bank|Banking|Ltd|Inc|Corp))\s+(?:as\s+)?lender/gi,
  ];

  for (const pattern of lenderPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const lender = match[1]?.trim();
      if (lender && lender.length > 3 && !lenders.includes(lender)) {
        lenders.push(lender);
      }
    }
  }

  // Extract agent
  let agent = 'Not found in document';
  const agentMatch = text.match(/(?:administrative\s+)?agent[:\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|Bank|Banking))/i);
  if (agentMatch) {
    agent = agentMatch[1].trim();
  }

  // Extract trustee (optional)
  let trustee: string | undefined;
  const trusteeMatch = text.match(/trustee[:\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|Bank|Banking))/i);
  if (trusteeMatch) {
    trustee = trusteeMatch[1].trim();
  }

  return { lenders, agent, trustee };
}

/**
 * Calculates confidence score based on extracted fields
 */
function calculateConfidenceScore(data: LoanDocument): number {
  let foundFields = 0;
  let totalFields = 0;

  // Basic details (6 fields)
  totalFields += 6;
  if (data.basicDetails.borrower !== 'Not found in document') foundFields++;
  if (data.basicDetails.amount > 0) foundFields++;
  if (data.basicDetails.currency !== 'Not found in document') foundFields++;
  if (data.basicDetails.interestRate !== 'Not found in document') foundFields++;
  if (data.basicDetails.maturityDate !== 'Not found in document') foundFields++;
  if (data.basicDetails.facilityType !== 'Not found in document') foundFields++;

  // Covenants (1 field)
  totalFields += 1;
  if (data.covenants.financial.length > 0) foundFields++;

  // ESG (3 fields)
  totalFields += 3;
  if (data.esgObligations.targets.length > 0) foundFields++;
  if (data.esgObligations.reportingFrequency !== 'Not found in document') foundFields++;
  if (data.esgObligations.verificationRequired !== undefined) foundFields++;

  return Math.round((foundFields / totalFields) * 100);
}

/**
 * Parses extracted PDF text using local pattern matching
 * No API required - works fully offline
 */
export function parseDocumentLocally(
  extractedText: string,
  fileName: string
): ParseResult {
  if (!extractedText || extractedText.length < 100) {
    return {
      success: false,
      error: 'Insufficient text extracted from document. Cannot proceed with analysis.',
    };
  }

  try {
    // Extract all fields
    const borrower = extractBorrower(extractedText);
    const { amount, currency } = extractAmount(extractedText);
    const interestRate = extractInterestRate(extractedText);
    const maturityDate = extractMaturityDate(extractedText);
    const facilityType = extractFacilityType(extractedText);
    const financialCovenants = extractFinancialCovenants(extractedText);
    const esgObligations = extractESGObligations(extractedText);
    const parties = extractParties(extractedText);

    // Build LoanDocument structure
    const loanDocument: LoanDocument = {
      id: `LOAN-${Date.now()}`,
      fileName,
      uploadDate: new Date(),
      processingTime: 0, // Will be set by caller
      status: 'complete',
      basicDetails: {
        borrower,
        amount,
        currency,
        interestRate,
        maturityDate,
        facilityType,
      },
      covenants: {
        financial: financialCovenants,
        reporting: [], // Could be enhanced with pattern matching
      },
      esgObligations: {
        targets: esgObligations.targets,
        reportingFrequency: esgObligations.reportingFrequency,
        verificationRequired: esgObligations.verificationRequired,
      },
      parties: {
        lenders: parties.lenders,
        agent: parties.agent,
        trustee: parties.trustee,
      },
    };

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(loanDocument);

    return {
      success: true,
      data: loanDocument,
      confidenceScore,
    };
  } catch (error) {
    console.error('Local parsing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse document locally',
    };
  }
}
