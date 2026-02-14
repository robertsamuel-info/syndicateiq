/**
 * PDF Text Extraction with OCR Fallback
 * Tries normal extraction first, falls back to OCR for scanned PDFs
 */

import pdfParse from 'pdf-parse';
import { fromBuffer } from 'pdf2pic';
import { createWorker } from 'tesseract.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Temporary directory for image storage
const TEMP_DIR = join(__dirname, '../tmp');
const MIN_TEXT_LENGTH = 100; // Minimum characters to consider as valid text

/**
 * Converts PDF pages to images
 */
async function pdfToImages(buffer) {
  // Ensure temp directory exists
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }

  const convert = fromBuffer(buffer, {
    density: 200, // DPI for image quality
    savePath: TEMP_DIR,
    format: 'png',
    width: 1654,
    height: 2339,
  });

  // Convert all pages (-1 means all pages)
  const images = await convert.bulk(-1);
  return images;
}

/**
 * Runs OCR on images using Tesseract
 */
async function ocrImages(images) {
  let fullText = '';
  const worker = await createWorker('eng');

  try {
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      console.log(`Processing page ${i + 1}/${images.length} with OCR...`);

      const result = await worker.recognize(img.path);
      fullText += '\n\n' + result.data.text;

      // Log progress
      if (result.data.confidence) {
        console.log(`Page ${i + 1} OCR confidence: ${result.data.confidence.toFixed(1)}%`);
      }
    }
  } finally {
    await worker.terminate();
  }

  return fullText.trim();
}

/**
 * Main extraction function with OCR fallback
 */
export async function extractTextWithOCR(buffer) {
  // Step 1: Try normal text extraction
  console.log('Attempting normal PDF text extraction...');
  
  try {
    const parsed = await pdfParse(buffer);
    const extractedText = parsed.text || '';
    const textLength = extractedText.trim().length;

    console.log(`Extracted ${textLength} characters from PDF`);

    // Check if we have enough text (not a scanned PDF)
    if (textLength >= MIN_TEXT_LENGTH) {
      console.log('✅ Digital PDF detected - using extracted text');
      return {
        text: extractedText.trim(),
        source: 'digital',
        pageCount: parsed.numpages || 1,
      };
    }

    console.log(`⚠️  Insufficient text (${textLength} chars) - treating as scanned PDF`);
  } catch (error) {
    console.log('⚠️  Normal extraction failed, trying OCR fallback:', error.message);
  }

  // Step 2: OCR fallback for scanned PDFs
  console.log('🔄 Running OCR on scanned PDF...');
  
  try {
    // Convert PDF to images
    const images = await pdfToImages(buffer);
    
    if (!images || images.length === 0) {
      throw new Error('Failed to convert PDF to images');
    }

    console.log(`Converted ${images.length} page(s) to images`);

    // Run OCR on all pages
    const ocrText = await ocrImages(images);

    // Safety check: reject unreadable OCR
    if (ocrText.trim().length < MIN_TEXT_LENGTH) {
      throw new Error(
        `Unable to extract sufficient text from scanned document. ` +
        `Only ${ocrText.trim().length} characters extracted. ` +
        `The document may be too low quality or corrupted.`
      );
    }

    console.log(`✅ OCR completed - extracted ${ocrText.trim().length} characters`);

    // Clean up temporary image files
    try {
      for (const img of images) {
        if (existsSync(img.path)) {
          await unlink(img.path);
        }
      }
      console.log('Cleaned up temporary image files');
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError.message);
    }

    return {
      text: ocrText.trim(),
      source: 'ocr',
      pageCount: images.length,
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error(
      `OCR processing failed: ${error.message}. ` +
      `Please ensure the PDF is readable and not corrupted.`
    );
  }
}
