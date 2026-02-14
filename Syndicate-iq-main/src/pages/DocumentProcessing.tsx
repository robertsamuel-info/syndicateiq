import { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, CheckCircle2, XCircle, Leaf, Shield, TrendingUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import MetricCard from '@/components/ui/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { type LoanDocument } from '@/types';
import { extractPdfText } from '@/lib/utils/pdfExtractor';
import { parseDocumentLocally } from '@/lib/services/localDocumentParser';
import { analyzeESG, type ESGResult } from '@/lib/utils/esgAnalyzer';
import { notificationService } from '@/lib/services/notificationService';

export function DocumentProcessing() {
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<LoanDocument | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [extractedTextPreview, setExtractedTextPreview] = useState<string>('');
  const [esgData, setEsgData] = useState<ESGResult | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      console.warn('No files accepted');
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Safety check: Validate file exists
    if (!file) {
      setError('No file selected. Please upload a valid PDF document.');
      return;
    }
    
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file type. Please upload a PDF file.');
      return;
    }
    
    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit. Please upload a smaller file.');
      return;
    }
    
    // Validate file is not empty
    if (file.size === 0) {
      setError('File is empty. Please upload a valid PDF document.');
      return;
    }
    
    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    setProcessing(true);
    setProcessingTime(0);
    setError(null);
    setExtractedData(null);
    setConfidenceScore(null);
    setExtractedTextPreview('');
    setEsgData(null);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    try {
      // STEP 1: Extract text from PDF (with OCR fallback)
      setProcessingStage('Extracting text from PDF...');
      const extractionResult = await extractPdfText(file);
      
      // Update stage message if OCR was used (for user feedback)
      if (extractionResult.source === 'ocr') {
        setProcessingStage('OCR processing completed. Analyzing extracted text...');
      }

      if (!extractionResult.success) {
        clearInterval(timer);
        setProcessing(false);
        setError(extractionResult.error || 'Failed to extract text from PDF');
        return;
      }

      // Store preview of extracted text (first 500 chars)
      setExtractedTextPreview(extractionResult.text.substring(0, 500));

      // STEP 2: Analyze ESG signals
      setProcessingStage('Analyzing ESG signals...');
      const esgResult = analyzeESG(extractionResult.text);
      setEsgData(esgResult);

      // STEP 3: Parse document locally (no API required)
      setProcessingStage('Analyzing document with local parser...');
      const parseResult = parseDocumentLocally(extractionResult.text, file.name);

      clearInterval(timer);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);

      if (!parseResult.success) {
        setProcessing(false);
        setError(parseResult.error || 'Failed to parse document');
        return;
      }

      if (!parseResult.data) {
        setProcessing(false);
        setError('AI parsing returned no data');
        return;
      }

      // Set processing time
      parseResult.data.processingTime = totalTime;
      parseResult.data.status = 'complete';
      
      // Store extraction source for UI display
      (parseResult.data as any).extractionSource = extractionResult.source || 'digital';

      // Set confidence score
      if (parseResult.confidenceScore !== undefined) {
        setConfidenceScore(parseResult.confidenceScore);
      }

      setExtractedData(parseResult.data);
      setProcessing(false);
      setProcessingStage('');
      
      // Add notification when document processing completes
      notificationService.addDocumentProcessingComplete(file.name);
    } catch (err) {
      clearInterval(timer);
      setProcessing(false);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setProcessingStage('');
    }
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (rejectedFiles) => {
      const rejection = rejectedFiles[0];
      if (rejection) {
        if (rejection.errors.some(e => e.code === 'file-too-large')) {
          setError('File size exceeds 50MB limit. Please upload a smaller file.');
        } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
          setError('Invalid file type. Please upload a PDF file.');
        } else if (rejection.errors.some(e => e.code === 'too-many-files')) {
          setError('Please upload only one file at a time.');
        } else {
          setError(`File rejected: ${rejection.errors.map(e => e.message).join(', ')}`);
        }
      }
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 
          className="text-4xl font-bold bg-clip-text text-transparent animate-gradient mb-3"
          style={{
            backgroundImage: 'linear-gradient(to right, #7dd3fc, #ffffff, #5eead4, #fda4af, #67e8f9)',
          }}
        >
          Document Intelligence Engine
        </h1>
        <p className="text-lg text-white/60">
          Upload loan agreements for instant AI-powered extraction (99% faster than manual review)
        </p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <MetricCard
            title="Processing Time"
            value="90 sec"
            subtitle="vs 3-5 days traditional"
            icon={Clock}
            color="blue"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <MetricCard
            title="Cost Savings"
            value="$8K-$15K"
            subtitle="per loan document"
            icon={CheckCircle}
            color="green"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <MetricCard
            title="Accuracy Rate"
            value="95%+"
            subtitle="extraction accuracy"
            icon={FileText}
            color="slate"
          />
        </motion.div>
      </div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div
          {...getRootProps()}
          className={`
            glass border-2 border-dashed p-12 text-center cursor-pointer 
            transition-all duration-300
            ${isDragActive
              ? 'border-cyan-400/50 bg-cyan-500/10 scale-[1.02]'
              : 'border-white/20 hover:border-cyan-400/50 hover:bg-white/5'
            }
            ${processing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          `}
        >
          <input 
            {...getInputProps({
              disabled: processing,
              accept: 'application/pdf',
            })} 
          />
          <motion.div
            animate={isDragActive ? { y: -4 } : { y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="mx-auto text-cyan-400 mb-4" size={64} strokeWidth={1.5} />
          </motion.div>
          <p className="text-xl font-semibold text-white mb-2">
            {processing 
              ? 'Processing...' 
              : isDragActive 
                ? 'Drop PDF here...' 
                : 'Drag & drop loan agreement PDF'}
          </p>
          <p className="text-sm text-white/60">
            {processing ? 'Please wait...' : 'or click to browse (max 50MB)'}
          </p>
        </div>
        
        {/* File rejection errors */}
        {fileRejections.length > 0 && !processing && (
          <div className="mt-4 glass-sm p-4 rounded-xl border border-red-500/40 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400 text-sm mb-1">Upload Error</p>
                {fileRejections.map(({ file, errors }, idx) => (
                  <div key={idx}>
                    <p className="text-xs text-white/80 mb-1">{file.name}</p>
                    <ul className="list-disc list-inside text-xs text-white/60">
                      {errors.map((error, errIdx) => (
                        <li key={errIdx}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Error State */}
      {error && !processing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-sm p-6 rounded-xl border border-red-500/40 bg-red-500/10"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-400 text-lg mb-1">Processing Error</p>
              <p className="text-sm text-white/80">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing State */}
      {processing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-sm p-6 rounded-xl border border-cyan-500/40 hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400/30 border-t-cyan-400"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-lg">{processingStage || 'Processing document...'}</p>
              <p className="text-sm text-white/60">Elapsed: {processingTime} seconds</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Extracted Data */}
      {extractedData && !processing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Extracted Data</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Processed locally (no API required)
                </span>
                {extractedData && (extractedData as any).extractionSource === 'ocr' && (
                  <span className="text-xs px-2 py-1 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    OCR used (scanned document)
                  </span>
                )}
                {confidenceScore !== null && (
                  <span className="text-xs px-2 py-1 rounded bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                    Confidence: {confidenceScore}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="glass" 
                className="text-white"
                onClick={() => {
                  const dataStr = JSON.stringify(extractedData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${extractedData.fileName.replace('.pdf', '')}_extracted.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                Export CSV
              </Button>
            </div>
          </div>

          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Basic Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-white/60 mb-1 uppercase tracking-wider">Borrower</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-lg">{extractedData.basicDetails.borrower}</p>
                    {extractedData.basicDetails.borrower === 'Not found in document' ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Not found
                      </span>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1 uppercase tracking-wider">Loan Amount</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-lg">
                      {extractedData.basicDetails.amount > 0 
                        ? `${extractedData.basicDetails.currency} ${extractedData.basicDetails.amount.toLocaleString()}`
                        : 'Not found in document'
                      }
                    </p>
                    {extractedData.basicDetails.amount > 0 && (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1 uppercase tracking-wider">Interest Rate</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-lg">{extractedData.basicDetails.interestRate}</p>
                    {extractedData.basicDetails.interestRate !== 'Not found in document' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
                        Not found
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1 uppercase tracking-wider">Maturity Date</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-lg">{extractedData.basicDetails.maturityDate}</p>
                    {extractedData.basicDetails.maturityDate !== 'Not found in document' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
                        Not found
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Covenants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Financial Covenants</CardTitle>
            </CardHeader>
            <CardContent>
              {extractedData.covenants.financial.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 text-sm font-semibold text-white/60 uppercase tracking-wider">Type</th>
                        <th className="text-left py-3 text-sm font-semibold text-white/60 uppercase tracking-wider">Limit</th>
                        <th className="text-left py-3 text-sm font-semibold text-white/60 uppercase tracking-wider">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedData.covenants.financial.map((covenant, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 text-white font-medium">{covenant.type}</td>
                          <td className="py-3 text-cyan-400 font-semibold">{covenant.limit}</td>
                          <td className="py-3 text-white/80">{covenant.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60 mb-2">No financial covenants found in document</p>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
                    Not found in document
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ESG Obligations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">ESG Obligations</CardTitle>
            </CardHeader>
            <CardContent>
              {extractedData.esgObligations.targets.length > 0 ? (
                <ul className="list-disc list-inside space-y-3 mb-6">
                  {extractedData.esgObligations.targets.map((target, idx) => (
                    <li key={idx} className="text-white/90">{target}</li>
                  ))}
                </ul>
              ) : (
                <div className="mb-6">
                  <p className="text-white/60 mb-2">No ESG targets found in document</p>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
                    Not found in document
                  </span>
                </div>
              )}
              <div className="pt-6 border-t border-white/10 flex gap-8">
                <div>
                  <p className="text-sm text-white/60 mb-1 uppercase tracking-wider">Reporting Frequency</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{extractedData.esgObligations.reportingFrequency}</p>
                    {extractedData.esgObligations.reportingFrequency !== 'Not found in document' && (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1 uppercase tracking-wider">Verification Required</p>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${extractedData.esgObligations.verificationRequired ? 'text-green-400' : 'text-white'}`}>
                      {extractedData.esgObligations.verificationRequired ? 'Yes' : 'No'}
                    </p>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ESG Analysis Results */}
          {esgData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-cyan-500/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Leaf className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">ESG Analysis Result</CardTitle>
                      <p className="text-sm text-white/60 mt-1">Automated ESG signal detection from document</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ESG Scores Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="glass-sm p-4 rounded-xl border border-green-500/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="h-4 w-4 text-green-400" />
                        <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">Environmental</p>
                      </div>
                      <p className="text-3xl font-bold text-green-400">{esgData.environmental}</p>
                      <p className="text-xs text-white/50 mt-1">out of 100</p>
                      {esgData.detectedSignals.environmental.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-white/60 mb-1">Signals detected:</p>
                          <div className="flex flex-wrap gap-1">
                            {esgData.detectedSignals.environmental.slice(0, 3).map((signal, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="glass-sm p-4 rounded-xl border border-blue-500/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">Social</p>
                      </div>
                      <p className="text-3xl font-bold text-blue-400">{esgData.social}</p>
                      <p className="text-xs text-white/50 mt-1">out of 100</p>
                      {esgData.detectedSignals.social.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-white/60 mb-1">Signals detected:</p>
                          <div className="flex flex-wrap gap-1">
                            {esgData.detectedSignals.social.slice(0, 3).map((signal, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="glass-sm p-4 rounded-xl border border-purple-500/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">Governance</p>
                      </div>
                      <p className="text-3xl font-bold text-purple-400">{esgData.governance}</p>
                      <p className="text-xs text-white/50 mt-1">out of 100</p>
                      {esgData.detectedSignals.governance.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-white/60 mb-1">Signals detected:</p>
                          <div className="flex flex-wrap gap-1">
                            {esgData.detectedSignals.governance.slice(0, 3).map((signal, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Risk Level */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Risk Level</p>
                        <div className="flex items-center gap-3">
                          <span
                            className={`
                              text-2xl font-bold px-4 py-2 rounded-lg border
                              ${
                                esgData.riskLevel === 'LOW'
                                  ? 'text-green-400 bg-green-500/20 border-green-500/30'
                                  : esgData.riskLevel === 'MEDIUM'
                                  ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                                  : 'text-red-400 bg-red-500/20 border-red-500/30'
                              }
                            `}
                          >
                            {esgData.riskLevel}
                          </span>
                          <div>
                            <p className="text-sm text-white/80">Total Score</p>
                            <p className="text-lg font-bold text-white">{esgData.totalScore} / 300</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insights */}
                  {esgData.insights.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Key Insights</p>
                      <ul className="space-y-2">
                        {esgData.insights.map((insight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                            <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Debug: Extracted Text Preview (Collapsible) */}
          {extractedTextPreview && (
            <Card>
              <CardHeader>
                <details className="cursor-pointer">
                  <summary className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
                    View extracted text preview (first 500 characters)
                  </summary>
                </details>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-white/70 bg-black/20 p-4 rounded overflow-auto max-h-64 font-mono">
                  {extractedTextPreview}...
                </pre>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
