/**
 * AI Document Parser Service
 * Uses Claude AI to parse extracted PDF text into structured loan document data
 */

import Anthropic from '@anthropic-ai/sdk';
import { type LoanDocument } from '@/types';

// Initialize Claude client
// Note: In production, this should use an API key from environment variables
// For now, we'll check for VITE_ANTHROPIC_API_KEY
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

export interface ParseResult {
  success: boolean;
  data?: LoanDocument;
  error?: string;
  confidenceScore?: number;
}

/**
 * Validates that parsed data is not using fallback/hardcoded values
 */
function validateParsedData(data: any): { valid: boolean; reason?: string } {
  // Check for known hardcoded values
  const hardcodedBorrowers = ['Green Energy Corp', 'Green Energy'];
  const hardcodedAmounts = [250000000, 250_000_000];
  
  if (data.basicDetails?.borrower) {
    const borrower = data.basicDetails.borrower.toLowerCase();
    if (hardcodedBorrowers.some(h => borrower.includes(h.toLowerCase()))) {
      return { valid: false, reason: 'Detected hardcoded borrower name' };
    }
  }

  if (data.basicDetails?.amount) {
    if (hardcodedAmounts.includes(data.basicDetails.amount)) {
      return { valid: false, reason: 'Detected hardcoded loan amount' };
    }
  }

  return { valid: true };
}

/**
 * Calculates confidence score based on how many fields were found
 */
function calculateConfidenceScore(data: LoanDocument): number {
  let foundFields = 0;
  let totalFields = 0;

  // Basic details
  totalFields += 6;
  if (data.basicDetails.borrower && data.basicDetails.borrower !== 'Not found in document') foundFields++;
  if (data.basicDetails.amount && data.basicDetails.amount > 0) foundFields++;
  if (data.basicDetails.currency) foundFields++;
  if (data.basicDetails.interestRate && data.basicDetails.interestRate !== 'Not found in document') foundFields++;
  if (data.basicDetails.maturityDate) foundFields++;
  if (data.basicDetails.facilityType) foundFields++;

  // Covenants
  totalFields += 1;
  if (data.covenants.financial.length > 0) foundFields++;

  // ESG
  totalFields += 3;
  if (data.esgObligations.targets.length > 0) foundFields++;
  if (data.esgObligations.reportingFrequency) foundFields++;
  if (data.esgObligations.verificationRequired !== undefined) foundFields++;

  return Math.round((foundFields / totalFields) * 100);
}

/**
 * Parses extracted PDF text using Claude AI
 */
export async function parseDocumentWithAI(
  extractedText: string,
  fileName: string,
  isOCRText: boolean = false
): Promise<ParseResult> {
  if (!anthropic) {
    return {
      success: false,
      error: 'Anthropic API key not configured. Please set VITE_ANTHROPIC_API_KEY in your .env file.',
    };
  }

  if (!extractedText || extractedText.length < 100) {
    return {
      success: false,
      error: 'Insufficient text extracted from document. Cannot proceed with AI analysis.',
    };
  }

  try {
    const ocrWarning = isOCRText 
      ? `\n⚠️ IMPORTANT: This text was extracted using OCR (Optical Character Recognition) from a scanned document.
OCR text may contain errors, character misrecognitions, or formatting issues.
- Infer values carefully and account for potential OCR errors
- Do NOT hallucinate missing fields - return null if unclear
- Be tolerant of minor spelling variations that may be OCR errors
- If text quality is too poor to extract reliable data, return null values\n`
      : '';

    const prompt = `You are a financial document analysis AI specialized in syndicated loan agreements.

Extract the following fields ONLY from the document text below.
Do NOT assume values or use defaults.
If data is missing, return null or "Not found in document" for string fields, empty arrays for lists, and false for booleans.
${ocrWarning}
Document text:
"""
${extractedText.substring(0, 100000)} // Limit to 100k chars to avoid token limits
"""

Return a valid JSON object with this exact structure:
{
  "basicDetails": {
    "borrower": "string or null",
    "amount": number or null,
    "currency": "string (e.g., USD, EUR, GBP) or null",
    "interestRate": "string or null",
    "maturityDate": "YYYY-MM-DD format or null",
    "facilityType": "string or null"
  },
  "covenants": {
    "financial": [
      {
        "type": "string",
        "limit": "string",
        "frequency": "string"
      }
    ],
    "reporting": [
      {
        "type": "string",
        "frequency": "string",
        "deadline": "string"
      }
    ]
  },
  "esgObligations": {
    "targets": ["string"],
    "reportingFrequency": "string or null",
    "verificationRequired": boolean or null
  },
  "parties": {
    "lenders": ["string"],
    "agent": "string or null",
    "trustee": "string or null"
  }
}

IMPORTANT:
- Only extract information that is explicitly stated in the document text
- Do NOT use placeholder values like "Green Energy Corp" or "250000000"
- If a field is not found, use null, empty array, or "Not found in document" as appropriate
- Return ONLY valid JSON, no markdown formatting or explanations`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Try to extract JSON from markdown code blocks if present
    let jsonText = responseText.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    // Build LoanDocument structure
    const loanDocument: LoanDocument = {
      id: `LOAN-${Date.now()}`,
      fileName,
      uploadDate: new Date(),
      processingTime: 0, // Will be set by caller
      status: 'complete',
      basicDetails: {
        borrower: parsed.basicDetails?.borrower ?? 'Not found in document',
        amount: parsed.basicDetails?.amount ?? 0,
        currency: parsed.basicDetails?.currency ?? 'Not found in document',
        interestRate: parsed.basicDetails?.interestRate ?? 'Not found in document',
        maturityDate: parsed.basicDetails?.maturityDate ?? 'Not found in document',
        facilityType: parsed.basicDetails?.facilityType ?? 'Not found in document',
      },
      covenants: {
        financial: parsed.covenants?.financial ?? [],
        reporting: parsed.covenants?.reporting ?? [],
      },
      esgObligations: {
        targets: parsed.esgObligations?.targets ?? [],
        reportingFrequency: parsed.esgObligations?.reportingFrequency ?? 'Not found in document',
        verificationRequired: parsed.esgObligations?.verificationRequired ?? false,
      },
      parties: {
        lenders: parsed.parties?.lenders ?? [],
        agent: parsed.parties?.agent ?? 'Not found in document',
        trustee: parsed.parties?.trustee,
      },
    };

    // Validate against hardcoded values
    const validation = validateParsedData(loanDocument);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.reason}. The AI may have returned default values.`,
      };
    }

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(loanDocument);

    return {
      success: true,
      data: loanDocument,
      confidenceScore,
    };
  } catch (error) {
    console.error('AI parsing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse document with AI',
    };
  }
}
