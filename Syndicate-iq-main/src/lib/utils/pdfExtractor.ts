/**
 * PDF Text Extraction Utility
 * Extracts raw text from PDF files using backend API with OCR fallback
 * Falls back to frontend extraction if backend is unavailable
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

// Set up the worker for pdfjs (Vite-compatible)
// Use static import - Vite will bundle the worker correctly
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractionResult {
  text: string;
  pageCount: number;
  success: boolean;
  error?: string;
  source?: 'digital' | 'ocr' | 'frontend'; // Source of extraction
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Extracts text from a PDF file using backend API with OCR fallback
 * Falls back to frontend extraction if backend is unavailable
 * @param file - The PDF file to extract text from
 * @returns Extracted text and metadata
 */
export async function extractPdfText(file: File): Promise<ExtractionResult> {
  // Try backend first (with OCR fallback)
  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${BACKEND_URL}/api/pdf/extract`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return {
          text: data.text,
          pageCount: data.pageCount || 1,
          success: true,
          source: data.source || 'digital',
        };
      } else {
        throw new Error(data.error || 'Backend extraction failed');
      }
    } else {
      throw new Error(`Backend returned status ${response.status}`);
    }
  } catch (error) {
    console.warn('Backend extraction failed, falling back to frontend:', error);
    
    // Fallback to frontend extraction (for development or if backend is down)
    return await extractPdfTextFrontend(file);
  }
}

/**
 * Frontend-only PDF extraction (fallback)
 * Used when backend is unavailable
 */
async function extractPdfTextFrontend(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;

    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }

    // Validate extraction
    if (fullText.trim().length < 100) {
      return {
        text: '',
        pageCount,
        success: false,
        source: 'frontend',
        error: 'Unable to read document text. The PDF may be image-based (scanned). Please ensure the backend server is running for OCR support.',
      };
    }

    return {
      text: fullText.trim(),
      pageCount,
      success: true,
      source: 'frontend',
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      text: '',
      pageCount: 0,
      success: false,
      source: 'frontend',
      error: error instanceof Error ? error.message : 'Failed to extract text from PDF',
    };
  }
}
