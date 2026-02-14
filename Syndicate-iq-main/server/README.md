# SyndicateIQ Backend Server

Backend server for PDF processing with OCR fallback support.

## Features

- ✅ **Digital PDF Processing** - Fast text extraction from digital PDFs
- ✅ **OCR Fallback** - Automatic OCR for scanned/image-based PDFs
- ✅ **Smart Detection** - Automatically detects scanned PDFs (< 100 chars extracted)
- ✅ **Multi-page Support** - Processes all pages in a document
- ✅ **Error Handling** - Comprehensive error handling and validation

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 3. Environment Variables (Optional)

Create a `.env` file if you need to customize:

```env
PORT=3001
```

## API Endpoints

### POST `/api/pdf/extract`

Extracts text from a PDF file with OCR fallback.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `pdf` (file field)

**Response:**
```json
{
  "success": true,
  "text": "Extracted text content...",
  "source": "digital" | "ocr",
  "pageCount": 5
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## How It Works

1. **Normal Extraction** - Tries `pdf-parse` first (fast, ~1-3 seconds)
2. **Detection** - If extracted text < 100 characters, treats as scanned PDF
3. **OCR Fallback** - Converts PDF pages to images, runs Tesseract OCR (~10-30 seconds)
4. **Validation** - Rejects OCR results with < 100 characters (unreadable)

## Performance

| PDF Type | Processing Time |
|----------|----------------|
| Digital PDF | 1-3 seconds |
| Scanned PDF (OCR) | 10-25 seconds |
| Large scanned PDF | 30-60 seconds |

## Dependencies

- `express` - Web server
- `multer` - File upload handling
- `pdf-parse` - PDF text extraction
- `pdf2pic` - PDF to image conversion
- `tesseract.js` - OCR engine
- `canvas` - Image processing

## Troubleshooting

### "Unable to extract sufficient text"
- PDF may be too low quality
- Try a higher resolution scan
- Ensure PDF is not corrupted

### OCR is slow
- This is normal for scanned documents
- Large PDFs will take longer
- Consider increasing DPI for better quality (in `pdfProcessor.js`)

### Backend not starting
- Ensure Node.js 18+ is installed
- Check that port 3001 is available
- Verify all dependencies are installed
