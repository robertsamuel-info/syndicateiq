/**
 * SyndicateIQ Backend Server
 * Handles PDF processing with OCR fallback for scanned documents
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { extractTextWithOCR } from './services/pdfProcessor.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'syndicateiq-backend' });
});

// PDF extraction endpoint with OCR fallback
app.post('/api/pdf/extract', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file provided',
      });
    }

    console.log(`Processing PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    // Extract text with OCR fallback
    const result = await extractTextWithOCR(req.file.buffer);

    res.json({
      success: true,
      text: result.text,
      source: result.source, // 'digital' or 'ocr'
      pageCount: result.pageCount || 1,
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract text from PDF',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SyndicateIQ Backend Server running on http://localhost:${PORT}`);
  console.log(`📄 PDF extraction endpoint: POST /api/pdf/extract`);
});
