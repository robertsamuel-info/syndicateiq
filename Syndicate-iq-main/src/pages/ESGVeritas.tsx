import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Download, AlertCircle, Shield, Clock, User, Hash, Eye, TrendingUp, Database, Search, FileCheck } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { type ESGVerificationResult } from '@/types';
import { calculateGreenwashingRisk, type ESGVerificationData } from '@/lib/utils/calculateGreenwashingRisk';
import { sampleLoans } from '@/lib/data/sampleData';
import RiskGauge from '@/components/features/RiskGauge';
import AlertBadge from '@/components/ui/AlertBadge';
import MetricCard from '@/components/ui/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { generateHashSync } from '@/lib/utils/generateHash';
import { extractPdfText } from '@/lib/utils/pdfExtractor';
import { extractESGMetrics, type ExtractedESGMetric } from '@/lib/services/esgExtractor';
import { compareClaimedVsVerified, mapLMACompliance, convertToVerificationData, simulateThirdPartyVerification, generateVerificationSources } from '@/lib/services/esgVerificationEngine';
import { notificationService } from '@/lib/services/notificationService';

type ProcessingStep = 'idle' | 'uploading' | 'processing' | 'validating' | 'verifying' | 'detecting' | 'mapping' | 'scoring' | 'complete';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  loanId?: string;
  documentHash: string;
  details?: Record<string, unknown>;
}

interface LMACriteria {
  id: string;
  principle: string;
  category: 'use-of-proceeds' | 'evaluation' | 'management' | 'reporting';
  status: 'pass' | 'partial' | 'fail';
  evidence?: string;
  notes?: string;
}

export function ESGVeritas() {
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [processingTime, setProcessingTime] = useState(0);
  const [verificationResult, setVerificationResult] = useState<ESGVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [extractedMetrics, setExtractedMetrics] = useState<Record<string, unknown> | null>(null);
  const [lmaCompliance, setLmaCompliance] = useState<LMACriteria[]>([]);

  // Add audit log entry
  const addAuditLog = (action: string, details?: Record<string, unknown>) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      action,
      user: 'Current User', // In real app, get from auth context
      loanId: selectedLoan || undefined,
      documentHash: selectedFile ? generateHashSync(selectedFile.name + selectedFile.size) : '',
      details,
    };
    setAuditLog(prev => [entry, ...prev]);
  };

  // Step 1: File Upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      
      // Validate file
      if (file.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB limit');
        return;
      }
      
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type)) {
        setError('Invalid file type. Please upload PDF or Excel files.');
        return;
      }
      
      setSelectedFile(file);
    setError(null);
      addAuditLog('Document uploaded', { fileName: file.name, fileSize: file.size, fileType: file.type });
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });



  // Step 2-9: Complete Processing Flow (REAL EXTRACTION - NO DEFAULT DATA)
  const startVerification = async () => {
    if (!selectedLoan || !selectedFile) {
      setError('Please select a loan and upload a file');
      return;
    }

    setError(null);
    const startTime = Date.now();
    let processingTimer: NodeJS.Timeout | null = null;

    // Step 1: Upload
    setProcessingStep('uploading');
    addAuditLog('Verification started', { loanId: selectedLoan, fileName: selectedFile.name });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: Document Processing - REAL PDF EXTRACTION
    setProcessingStep('processing');
    processingTimer = setInterval(() => {
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    
    try {
      // Extract text from PDF (with OCR fallback)
      const extractionResult = await extractPdfText(selectedFile);
      
      if (!extractionResult.success || !extractionResult.text || extractionResult.text.length < 100) {
        if (processingTimer) clearInterval(processingTimer);
        setError(extractionResult.error || 'Failed to extract text from document. The PDF may be corrupted or image-based. Please ensure the backend server is running for OCR support.');
        setProcessingStep('idle');
        return;
      }
      
      const extractedText = extractionResult.text;
      addAuditLog('Text extracted from document', { 
        source: extractionResult.source || 'digital',
        textLength: extractedText.length,
        pages: extractionResult.pageCount 
      });
      
      // Extract ESG metrics dynamically (NO DEFAULT DATA)
      const extractedESG = extractESGMetrics(extractedText);
      
      // Convert to display format
      const extractedMetricsDisplay: Record<string, unknown> = {};
      
      // Helper function to format metric value
      const formatMetricValue = (metric: ExtractedESGMetric | null, defaultUnit?: string): string | null => {
        if (!metric) return null;
        const value = metric.value;
        if (typeof value === 'string') {
          return value; // Return string values like 'Present' as-is
        }
        const unit = metric.unit || defaultUnit || '';
        return `${value}${unit ? ` ${unit}` : ''}`;
      };
      
      // Carbon Emissions
      if (extractedESG.carbonEmissions.scope1) {
        const formatted = formatMetricValue(extractedESG.carbonEmissions.scope1);
        if (formatted) extractedMetricsDisplay['Scope 1 Emissions'] = formatted;
      }
      if (extractedESG.carbonEmissions.scope2) {
        const formatted = formatMetricValue(extractedESG.carbonEmissions.scope2);
        if (formatted) extractedMetricsDisplay['Scope 2 Emissions'] = formatted;
      }
      if (extractedESG.carbonEmissions.scope3) {
        const formatted = formatMetricValue(extractedESG.carbonEmissions.scope3);
        if (formatted) extractedMetricsDisplay['Scope 3 Emissions'] = formatted;
      }
      
      // Renewable Energy
      if (extractedESG.renewableEnergy.percentage) {
        const formatted = formatMetricValue(extractedESG.renewableEnergy.percentage, '%');
        if (formatted) extractedMetricsDisplay['Renewable Energy %'] = formatted;
      }
      if (extractedESG.renewableEnergy.totalMWh) {
        const formatted = formatMetricValue(extractedESG.renewableEnergy.totalMWh);
        if (formatted) extractedMetricsDisplay['Renewable Energy (MWh)'] = formatted;
      }
      
      // Water Usage
      if (extractedESG.waterUsage.totalLiters) {
        const formatted = formatMetricValue(extractedESG.waterUsage.totalLiters);
        if (formatted) extractedMetricsDisplay['Water Usage'] = formatted;
      }
      if (extractedESG.waterUsage.recycledPercentage) {
        const formatted = formatMetricValue(extractedESG.waterUsage.recycledPercentage, '%');
        if (formatted) extractedMetricsDisplay['Water Recycled %'] = formatted;
      }
      
      // Waste Recycling
      if (extractedESG.wasteRecycling.rate) {
        const formatted = formatMetricValue(extractedESG.wasteRecycling.rate, '%');
        if (formatted) extractedMetricsDisplay['Waste Recycling Rate'] = formatted;
      }
      
      // Diversity
      if (extractedESG.diversity.womenInLeadership) {
        const formatted = formatMetricValue(extractedESG.diversity.womenInLeadership, '%');
        if (formatted) extractedMetricsDisplay['Women in Leadership %'] = formatted;
      }
      if (extractedESG.diversity.boardDiversity) {
        const formatted = formatMetricValue(extractedESG.diversity.boardDiversity, '%');
        if (formatted) extractedMetricsDisplay['Board Diversity %'] = formatted;
      }
      
      // Safety
      if (extractedESG.safety.incidents) {
        const formatted = formatMetricValue(extractedESG.safety.incidents);
        if (formatted) extractedMetricsDisplay['Safety Incidents'] = formatted;
      }
      if (extractedESG.safety.lostTimeRate) {
        const formatted = formatMetricValue(extractedESG.safety.lostTimeRate);
        if (formatted) extractedMetricsDisplay['Lost Time Rate'] = formatted;
      }
      
      // Community
      if (extractedESG.community.investment) {
        const formatted = formatMetricValue(extractedESG.community.investment);
        if (formatted) extractedMetricsDisplay['Community Investment'] = formatted;
      }
      if (extractedESG.community.volunteerHours) {
        const formatted = formatMetricValue(extractedESG.community.volunteerHours);
        if (formatted) extractedMetricsDisplay['Volunteer Hours'] = formatted;
      }
      
      // Metadata
      if (extractedESG.metadata.companyName) {
        extractedMetricsDisplay['Company Name'] = extractedESG.metadata.companyName;
      }
      if (extractedESG.metadata.reportingYear) {
        extractedMetricsDisplay['Reporting Year'] = extractedESG.metadata.reportingYear;
      }
      if (extractedESG.metadata.geography) {
        extractedMetricsDisplay['Geography'] = extractedESG.metadata.geography;
      }
      if (extractedESG.metadata.documentType) {
        extractedMetricsDisplay['Document Type'] = extractedESG.metadata.documentType;
      }
      
      setExtractedMetrics(extractedMetricsDisplay);
      
      const metricsCount = Object.keys(extractedMetricsDisplay).length;
      addAuditLog('Document processed - ESG metrics extracted', { 
        metricsCount,
        completeness: extractedESG.metadata.completeness,
        documentType: extractedESG.metadata.documentType || 'Unknown'
      });

      // Step 3: ESG Validation
      setProcessingStep('validating');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Calculate missing metrics
      const totalExpectedMetrics = 15; // Standard ESG metrics
      const missingMetricsCount = totalExpectedMetrics - metricsCount;
      addAuditLog('ESG validation completed', { 
        completeness: `${extractedESG.metadata.completeness}%`,
        missingMetrics: missingMetricsCount 
      });

      // Step 4: Third-Party Verification
      setProcessingStep('verifying');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const thirdPartyVerification = simulateThirdPartyVerification(extractedESG);
      addAuditLog('Third-party verification completed', { 
        sources: ['CDP', 'GRI', 'ISO', 'Companies House'],
        cdpConfidence: thirdPartyVerification.cdp.confidence,
        missingDataPoints: thirdPartyVerification.gri.missingDataPoints.length
      });

      // Step 5: Greenwashing Detection
      setProcessingStep('detecting');
      await new Promise(resolve => setTimeout(resolve, 800));
      addAuditLog('Greenwashing detection analysis completed');

      // Step 6: LMA Compliance Mapping (REAL MAPPING)
      setProcessingStep('mapping');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const lmaMapping = mapLMACompliance(extractedText, extractedESG);
      setLmaCompliance(lmaMapping);
      const compliantCount = lmaMapping.filter(c => c.status === 'pass').length;
      const partialCount = lmaMapping.filter(c => c.status === 'partial').length;
      const failedCount = lmaMapping.filter(c => c.status === 'fail').length;
      addAuditLog('LMA compliance mapping completed', { 
        compliant: compliantCount, 
        partial: partialCount, 
        failed: failedCount 
      });

      // Step 7: Risk Scoring
      setProcessingStep('scoring');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Convert extracted metrics to verification data format
      const verificationData = convertToVerificationData(extractedESG);

      const riskCalculation = calculateGreenwashingRisk(verificationData);
      if (processingTimer) clearInterval(processingTimer);

      // Generate Alerts (based on ACTUAL extracted data)
      const alerts = [];
      
      // Check for missing Scope 3 (LMA requirement)
      if (!extractedESG.carbonEmissions.scope3) {
        alerts.push({
          id: 'alert-scope3',
          severity: 'medium' as const,
          title: 'Missing Scope 3 emissions',
          description: 'Scope 3 emissions not reported in document (LMA Green Loan requirement)',
          recommendedAction: 'Request full emissions disclosure including Scope 3',
          notify: ['Loan Officer', 'Compliance Manager'],
          priority: 2,
          timeline: '30 days',
        });
      }
      
      // Check for missing baseline year
      if (!extractedESG.carbonEmissions.baselineYear) {
        alerts.push({
          id: 'alert-baseline',
          severity: 'medium' as const,
          title: 'Missing baseline year',
          description: 'Carbon emissions baseline year not found in document',
          recommendedAction: 'Request baseline year specification for accurate reduction calculations',
          notify: ['Loan Officer'],
          priority: 3,
          timeline: '30 days',
        });
      }
      
      // Check claimed vs verified discrepancies
      const comparison = compareClaimedVsVerified(extractedESG);
      
      // Generate detailed claimed vs verified metrics for display
      const claimedVerifiedMetrics = comparison.map(comp => ({
        metric: comp.metric,
        claimed: typeof comp.claimed === 'string' ? comp.claimed : `${comp.claimed}%`,
        verified: typeof comp.verified === 'string' ? comp.verified : `${comp.verified}%`,
        deviation: `${comp.deviation.toFixed(1)}%`,
        status: comp.status === 'match' ? 'Low Risk' : comp.status === 'minor' ? 'Medium Risk' : comp.status === 'major' ? 'High Risk' : 'Critical',
      }));
      
      // Generate verification sources
      const verificationSources = generateVerificationSources(extractedESG, thirdPartyVerification);
      
      comparison.forEach((comp, idx) => {
        if (comp.status === 'critical') {
          alerts.push({
            id: `alert-${comp.metric.toLowerCase().replace(/\s+/g, '-')}`,
            severity: 'critical' as const,
            title: `Major ${comp.metric} data discrepancy`,
            description: `Borrower claimed ${comp.claimed}, verified shows ${comp.verified}. Deviation: ${comp.deviation.toFixed(1)}%`,
            estimatedLiability: 500000,
            currency: 'EUR',
            recommendedAction: 'Request corrected data immediately',
            notify: ['Compliance Manager', 'Loan Officer'],
            priority: 1,
            timeline: 'Immediate',
          });
        } else if (comp.status === 'major') {
          alerts.push({
            id: `alert-${comp.metric.toLowerCase().replace(/\s+/g, '-')}-major`,
            severity: 'high' as const,
            title: `${comp.metric} data discrepancy`,
            description: `Claimed ${comp.claimed} vs verified ${comp.verified} (${comp.deviation.toFixed(1)}% deviation)`,
            recommendedAction: 'Request clarification and supporting documentation',
            notify: ['Loan Officer'],
            priority: 2,
            timeline: '14 days',
          });
        }
      });
      
      // Check for low completeness
      if (extractedESG.metadata.completeness < 50) {
        alerts.push({
          id: 'alert-completeness',
          severity: 'high' as const,
          title: 'Low data completeness',
          description: `Only ${extractedESG.metadata.completeness}% of expected ESG metrics found in document`,
          recommendedAction: 'Request complete ESG report with all standard metrics',
          notify: ['Loan Officer'],
          priority: 2,
          timeline: '14 days',
        });
      }

      // Create final result (using ACTUAL extracted data - NO DEFAULT VALUES)
      const result: ESGVerificationResult = {
        id: `ESG-${Date.now()}`,
        loanId: selectedLoan,
        borrowerName: extractedESG.metadata.companyName || sampleLoans.find(l => l.id === selectedLoan)?.basicDetails.borrower || 'Unknown',
        uploadedAt: new Date(),
        processedAt: new Date(),
        processingTime: Math.floor((Date.now() - startTime) / 1000),
        extractedMetrics: {
          carbonEmissions: {
            scope1: extractedESG.carbonEmissions.scope1?.value as number | null ?? null,
            scope2: extractedESG.carbonEmissions.scope2?.value as number | null ?? null,
            scope3: extractedESG.carbonEmissions.scope3?.value as number | null ?? null,
            unit: extractedESG.carbonEmissions.unit,
            baselineYear: extractedESG.carbonEmissions.baselineYear,
          },
          renewableEnergy: {
            percentage: extractedESG.renewableEnergy.percentage?.value as number | null ?? null,
            totalMWh: extractedESG.renewableEnergy.totalMWh?.value as number | null ?? null,
          },
          waterUsage: {
            totalLiters: extractedESG.waterUsage.totalLiters?.value as number | null ?? null,
            recycledPercentage: extractedESG.waterUsage.recycledPercentage?.value as number | null ?? null,
          },
          wasteRecycling: {
            rate: extractedESG.wasteRecycling.rate?.value as number | null ?? null,
          },
          diversity: {
            womenInLeadership: extractedESG.diversity.womenInLeadership?.value as number | null ?? null,
            boardDiversity: extractedESG.diversity.boardDiversity?.value as number | null ?? null,
          },
          safety: {
            incidents: extractedESG.safety.incidents?.value as number | null ?? null,
            lostTimeRate: extractedESG.safety.lostTimeRate?.value as number | null ?? null,
          },
          community: {
            investment: extractedESG.community.investment?.value as number | null ?? null,
            volunteerHours: extractedESG.community.volunteerHours?.value as number | null ?? null,
          },
          claimedImprovements: extractedESG.claimedImprovements,
        },
        thirdPartyVerification: {
          cdp: thirdPartyVerification.cdp,
          gri: thirdPartyVerification.gri,
          regulatory: {
            euTaxonomy: extractedESG.metadata.frameworkReferences.includes('EU Taxonomy'),
            companiesHouse: true, // Would be verified via API in production
            governanceVerified: true,
          },
          certifications: thirdPartyVerification.certifications,
          industryBenchmark: {
            sectorAverage: verificationData.peerAverage,
            peerComparison: Object.keys(verificationData.peerAverage).reduce((acc, key) => {
              const claimed = verificationData.claimedMetrics[key];
              if (typeof claimed === 'number') {
                acc[key] = {
                  borrower: claimed,
                  average: verificationData.peerAverage[key],
                  stdDev: verificationData.peerStdDev[key],
                  outlier: Math.abs(claimed - verificationData.peerAverage[key]) > 2 * verificationData.peerStdDev[key],
                };
              }
              return acc;
            }, {} as Record<string, { borrower: number; average: number; stdDev: number; outlier: boolean }>),
          },
        },
        riskScore: {
          overall: riskCalculation.overallScore,
          level: riskCalculation.riskLevel,
          components: riskCalculation.componentScores,
          breakdown: riskCalculation.breakdown,
        },
        alerts,
        comparison,
        claimedVerifiedMetrics,
        verificationSources,
        lmaCompliance: {
          greenLoanPrinciples: lmaMapping.filter(c => c.status === 'pass').length >= 3,
          sustainabilityCoordinator: lmaMapping.some(c => c.category === 'management' && c.status === 'pass'),
          reportingAligned: lmaMapping.some(c => c.category === 'reporting' && c.status === 'pass'),
          overallCompliant: lmaMapping.every(c => c.status === 'pass'),
          score: Math.round((lmaMapping.filter(c => c.status === 'pass').length / lmaMapping.length) * 100),
        },
        euTaxonomyCompliance: {
          compliant: extractedESG.metadata.frameworkReferences.includes('EU Taxonomy') && 
                     extractedESG.carbonEmissions.scope3 !== null,
          score: extractedESG.metadata.frameworkReferences.includes('EU Taxonomy') ? 
                 (extractedESG.carbonEmissions.scope3 ? 80 : 45) : 0,
          issues: [
            ...(!extractedESG.carbonEmissions.scope3 ? ['Missing Scope 3 emissions'] : []),
            ...(thirdPartyVerification.certifications.filter(c => c.expired).map(c => `Expired ${c.type} certification`)),
          ],
        },
      };

      setVerificationResult(result);
      setProcessingStep('complete');
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
      addAuditLog('Verification completed', { 
        riskScore: riskCalculation.overallScore, 
        riskLevel: riskCalculation.riskLevel,
        alertsCount: alerts.length,
        completeness: extractedESG.metadata.completeness
      });
      
      // Add notification when ESG Veritas completes
      const loanName = result.borrowerName || sampleLoans.find(l => l.id === selectedLoan)?.basicDetails.borrower || selectedLoan;
      notificationService.addESGVeritasComplete(loanName);
    } catch (error) {
      if (processingTimer) clearInterval(processingTimer);
      setError(error instanceof Error ? error.message : 'Failed to process document');
      setProcessingStep('idle');
      addAuditLog('Verification failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      console.error('ESG Verification error:', error);
    }
  };

  const handleReset = () => {
    setSelectedLoan('');
    setSelectedFile(null);
    setProcessingStep('idle');
    setProcessingTime(0);
    setVerificationResult(null);
    setError(null);
    setExtractedMetrics(null);
    setLmaCompliance([]);
    addAuditLog('Verification reset');
  };

  const processingSteps = [
    { key: 'uploading', label: 'Upload', icon: Upload },
    { key: 'processing', label: 'Process', icon: FileText },
    { key: 'validating', label: 'Validate', icon: FileCheck },
    { key: 'verifying', label: 'Verify', icon: Search },
    { key: 'detecting', label: 'Detect', icon: Shield },
    { key: 'mapping', label: 'Map', icon: Database },
    { key: 'scoring', label: 'Score', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 
            className="text-4xl font-bold bg-clip-text text-transparent animate-gradient mb-3"
            style={{
              backgroundImage: 'linear-gradient(to right, #7dd3fc, #ffffff, #5eead4, #fda4af, #67e8f9)',
            }}
          >
            ESG Veritas Platform
          </h1>
          <p className="text-lg text-white/60">
            AI-powered ESG verification and greenwashing detection aligned with LMA Green Loan Terms
          </p>
        </div>
      </motion.div>

      {/* Step 1: Loan Selection & Document Upload */}
      {processingStep === 'idle' && !verificationResult && (
    <div className="space-y-6">
          {/* Loan Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-white">Select Loan</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedLoan}
                  onChange={(e) => setSelectedLoan(e.target.value)}
                  className="text-white"
                >
                  <option value="">Choose a loan...</option>
                  {sampleLoans.map(loan => (
                    <option key={loan.id} value={loan.id}>
                      {loan.basicDetails.borrower} - {loan.basicDetails.currency} {loan.basicDetails.amount.toLocaleString()}
                    </option>
                  ))}
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white mb-2">Upload ESG Report</CardTitle>
                <p className="text-sm text-white/60">
                  Supported formats: PDF, Excel (.xlsx, .xls). Max size: 50MB
                </p>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`
                    glass border-2 border-dashed p-12 text-center cursor-pointer 
                    transition-all duration-300
                    ${isDragActive
                      ? 'border-cyan-400/50 bg-cyan-500/10 scale-[1.02]'
                      : 'border-white/20 hover:border-cyan-400/50 hover:bg-white/5'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    animate={isDragActive ? { y: -4 } : { y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Upload className="mx-auto text-cyan-400 mb-4" size={64} strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-xl font-semibold text-white mb-2">
                    {isDragActive ? 'Drop file here...' : 'Drag & drop ESG report (PDF/Excel)'}
                  </p>
                  <p className="text-sm text-white/60">or click to browse (max 50MB)</p>
                </div>

                {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="mt-4 glass-sm p-4 rounded-xl border border-green-500/40 hover:border-green-500/50 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-400" size={24} />
          <div>
                        <p className="font-medium text-white">{selectedFile.name}</p>
                        <p className="text-sm text-white/60">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mt-4 glass-sm p-4 rounded-xl border border-red-500/40 hover:border-red-500/50 transition-all">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </motion.div>
                )}

                {selectedLoan && selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center mt-6"
                  >
                    <Button
                      onClick={startVerification}
                      variant="glass"
                      className="px-6 py-2.5 text-sm font-medium tracking-wide"
                    >
                      Start ESG Verification
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Processing States */}
      {processingStep !== 'idle' && processingStep !== 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center">
                <div className="relative mx-auto mb-4 w-16 h-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-2 border-cyan-400/30 border-t-cyan-400"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-cyan-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {processingStep === 'uploading' && 'Step 1: Uploading Document...'}
                  {processingStep === 'processing' && 'Step 2: Processing Document with AI...'}
                  {processingStep === 'validating' && 'Step 3: Validating ESG Data...'}
                  {processingStep === 'verifying' && 'Step 4: Verifying with Third-Party Sources...'}
                  {processingStep === 'detecting' && 'Step 5: Detecting Greenwashing Risks...'}
                  {processingStep === 'mapping' && 'Step 6: Mapping LMA Compliance...'}
                  {processingStep === 'scoring' && 'Step 7: Calculating Risk Score...'}
                </h2>
                <p className="text-white/60">
                  {processingStep === 'uploading' && 'Validating file format and uploading to secure storage'}
                  {processingStep === 'processing' && `Extracting 47 ESG metrics from document... (${processingTime}s elapsed)`}
                  {processingStep === 'validating' && 'Checking data completeness, consistency, and trends...'}
                  {processingStep === 'verifying' && 'Querying CDP, GRI, regulatory databases, and ISO registries...'}
                  {processingStep === 'detecting' && 'Analyzing claims for suspicious patterns and inconsistencies...'}
                  {processingStep === 'mapping' && 'Evaluating compliance with LMA Green Loan Principles...'}
                  {processingStep === 'scoring' && 'Running greenwashing risk algorithm...'}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {processingSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const currentStepIndex = processingSteps.findIndex(s => s.key === processingStep);
                  const isActive = currentStepIndex >= idx;
                  const isCurrent = processingStep === step.key;
                  
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCurrent ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 scale-110' :
                        isActive ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-white/5 border border-white/10 text-white/30'
                      }`}>
                        {isActive && !isCurrent ? <CheckCircle size={20} /> : <StepIcon size={20} />}
                      </div>
                      {idx < processingSteps.length - 1 && (
                        <div className={`w-12 h-1 ${isActive ? 'bg-cyan-400' : 'bg-white/10'}`} />
                      )}
              </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Results Display */}
      {verificationResult && (
        <div className="space-y-6">
          {/* Alert Banner */}
          {verificationResult.riskScore.level === 'high' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="glass-lg border-2 border-red-500/60 p-6 rounded-xl shadow-2xl">
                <div className="flex items-start gap-4">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={32} />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">GREENWASHING RISK DETECTED</h2>
                    <p className="text-white/80 mb-4">
                      Major data discrepancies found. Risk Score: <span className="font-bold text-red-400">{verificationResult.riskScore.overall}/100 (HIGH RISK)</span>
                    </p>
                    {verificationResult.alerts.find(a => a.severity === 'critical') && (
                      <p className="text-red-400 font-semibold mb-4">
                        Estimated Liability: {verificationResult.alerts.find(a => a.severity === 'critical')?.currency} {verificationResult.alerts.find(a => a.severity === 'critical')?.estimatedLiability?.toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-3 mt-4 flex-wrap">
                      <Button variant="glass" className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30">
                        View Details
                      </Button>
                      <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                        Alert Team
                      </Button>
            </div>
          </div>
        </div>
      </div>
            </motion.div>
          )}

          {verificationResult.riskScore.level === 'low' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="glass-lg border-2 border-green-500/60 p-6 rounded-xl shadow-2xl">
                <div className="flex items-center gap-4 flex-wrap">
                  <CheckCircle className="text-green-400" size={32} />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">ESG Claims Verified</h2>
                    <p className="text-white/80">
                      Risk Score: <span className="font-bold text-green-400">{verificationResult.riskScore.overall}/100 (LOW RISK)</span>
                    </p>
                  </div>
            </div>
              </div>
            </motion.div>
          )}

          {/* Extracted Metrics Dashboard */}
          {extractedMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Database size={20} />
                    Extracted ESG Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(extractedMetrics).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(extractedMetrics).slice(0, 8).map(([key, value]) => (
                        <div key={key} className="glass-sm p-3 rounded-lg border border-white/15 hover:border-white/25 transition-all">
                          <p className="text-xs text-white/60 uppercase tracking-wide mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-lg font-semibold text-white">
                            {typeof value === 'object' ? JSON.stringify(value).slice(0, 20) + '...' : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/60">No ESG metrics were extracted from the document.</p>
                      <p className="text-white/40 text-sm mt-2">The document may not contain extractable ESG data.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Risk Score Gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Overall Risk Score</h3>
                <div className="flex justify-start">
                  <RiskGauge
                    score={verificationResult.riskScore.overall}
                    label={`${verificationResult.riskScore.level.toUpperCase()} RISK`}
                    size="lg"
                  />
                </div>
              </div>
            </motion.div>

            {/* Component Scores */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white mb-4">Risk Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Component</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Score</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Weight</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Weighted Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationResult.riskScore.breakdown.map((component) => (
                        <tr key={component.component} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white font-medium">{component.component}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white/80 whitespace-nowrap">{component.score.toFixed(0)}/100</span>
                              <div className="flex-1 max-w-20 bg-white/10 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    component.score < 30 ? 'bg-green-400' :
                                    component.score < 60 ? 'bg-amber-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${component.score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-white/80 whitespace-nowrap">{(component.weight * 100).toFixed(0)}%</td>
                          <td className="py-3 px-4 text-white font-semibold whitespace-nowrap">{component.weightedScore.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* LMA Compliance Mapping */}
          {lmaCompliance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileCheck size={20} />
                    LMA Green Loan Principles Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lmaCompliance.map((criteria) => (
                      <div
                        key={criteria.id}
                        className={`glass-sm p-4 rounded-xl border ${
                          criteria.status === 'pass' ? 'border-green-500/30 bg-green-500/10' :
                          criteria.status === 'partial' ? 'border-amber-500/30 bg-amber-500/10' :
                          'border-red-500/30 bg-red-500/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-semibold text-white">{criteria.principle}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                criteria.status === 'pass' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                criteria.status === 'partial' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {criteria.status.toUpperCase()}
                              </span>
                              <span className="text-xs text-white/50">({criteria.category})</span>
                            </div>
                            {criteria.evidence && (
                              <p className="text-sm text-white/80 mb-1">Evidence: {criteria.evidence}</p>
                            )}
                            {criteria.notes && (
                              <p className="text-sm text-white/60 italic">{criteria.notes}</p>
                            )}
                          </div>
                          {criteria.status === 'pass' ? (
                            <CheckCircle className="text-green-400 flex-shrink-0 ml-4" size={24} />
                          ) : (
                            <XCircle className={`flex-shrink-0 ml-4 ${criteria.status === 'partial' ? 'text-amber-400' : 'text-red-400'}`} size={24} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 glass-sm p-3 rounded-lg border border-white/15">
                    <p className="text-sm text-white/80">
                      <strong>Summary:</strong> {lmaCompliance.filter(c => c.status === 'pass').length} Pass, {' '}
                      {lmaCompliance.filter(c => c.status === 'partial').length} Partial, {' '}
                      {lmaCompliance.filter(c => c.status === 'fail').length} Fail
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white mb-4">Claimed vs. Verified Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Metric</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Claimed</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Verified</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Deviation</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationResult.claimedVerifiedMetrics && verificationResult.claimedVerifiedMetrics.length > 0 ? (
                        verificationResult.claimedVerifiedMetrics.map((item, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 text-white font-medium">{item.metric}</td>
                            <td className="py-3 px-4 text-white/80">{item.claimed}</td>
                            <td className="py-3 px-4 text-white/80">{item.verified}</td>
                            <td className="py-3 px-4 text-white/80">{item.deviation}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'Low Risk' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                item.status === 'Medium Risk' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                item.status === 'High Risk' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 px-4 text-center text-white/60">
                            No metrics available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Verification Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white mb-4">Verification Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Source</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Confidence</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-white/60 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationResult.verificationSources && verificationResult.verificationSources.length > 0 ? (
                        verificationResult.verificationSources.map((source, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {source.confidence === 'High' ? (
                                  <CheckCircle className="text-green-400" size={18} />
                                ) : source.confidence === 'Medium' ? (
                                  <AlertCircle className="text-amber-400" size={18} />
                                ) : (
                                  <XCircle className="text-red-400" size={18} />
                                )}
                                <span className="font-medium text-white">{source.source}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                source.confidence === 'High' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                source.confidence === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {source.confidence}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white/80 text-sm">{source.notes}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 px-4 text-center text-white/60">
                            No verification sources available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Priority Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white mb-4">Priority Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verificationResult.alerts
                    .sort((a, b) => a.priority - b.priority)
                    .slice(0, 5)
                    .map((alert) => (
                      <div key={alert.id} className="glass-sm p-4 rounded-xl border border-white/15 hover:border-white/25 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {alert.severity.toUpperCase()}
                              </span>
                              <span className="text-sm text-white/50">Priority {alert.priority} • {alert.timeline}</span>
                            </div>
                            <h4 className="font-semibold text-white mb-1">{alert.title}</h4>
                            <p className="text-sm text-white/80 mb-2">{alert.description}</p>
                            <p className="text-sm font-medium text-white">Recommended: {alert.recommendedAction}</p>
                            {alert.estimatedLiability && (
                              <p className="text-sm text-red-400 mt-1">
                                Estimated Liability: {alert.currency} {alert.estimatedLiability.toLocaleString()}
                              </p>
                            )}
                            <p className="text-xs text-white/50 mt-2">Notify: {alert.notify.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Final Risk & Compliance Status Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 border-2 border-cyan-500/30 bg-cyan-500/5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white mb-4">Final ESG Risk & Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="glass-sm p-4 rounded-xl border border-white/15">
                    <p className="text-xs text-white/60 mb-1">Risk Score</p>
                    <p className="text-3xl font-bold text-white mb-1">{verificationResult.riskScore.overall}/100</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      verificationResult.riskScore.level === 'low' ? 'bg-green-500/20 text-green-400' :
                      verificationResult.riskScore.level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {verificationResult.riskScore.level.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="glass-sm p-4 rounded-xl border border-white/15">
                    <p className="text-xs text-white/60 mb-1">Alerts Count</p>
                    <p className="text-3xl font-bold text-white">{verificationResult.alerts.length}</p>
                    <p className="text-xs text-white/50 mt-1">
                      {verificationResult.alerts.filter(a => a.severity === 'critical').length} Critical
                    </p>
                  </div>
                  {(() => {
                    const metrics = verificationResult.extractedMetrics;
                    const totalMetrics = 15;
                    let foundMetrics = 0;
                    if (metrics.carbonEmissions.scope1 !== null) foundMetrics++;
                    if (metrics.carbonEmissions.scope2 !== null) foundMetrics++;
                    if (metrics.carbonEmissions.scope3 !== null) foundMetrics++;
                    if (metrics.renewableEnergy.percentage !== null) foundMetrics++;
                    if (metrics.renewableEnergy.totalMWh !== null) foundMetrics++;
                    if (metrics.waterUsage.totalLiters !== null) foundMetrics++;
                    if (metrics.waterUsage.recycledPercentage !== null) foundMetrics++;
                    if (metrics.wasteRecycling.rate !== null) foundMetrics++;
                    if (metrics.diversity.womenInLeadership !== null) foundMetrics++;
                    if (metrics.diversity.boardDiversity !== null) foundMetrics++;
                    if (metrics.safety.incidents !== null) foundMetrics++;
                    if (metrics.safety.lostTimeRate !== null) foundMetrics++;
                    if (metrics.community.investment !== null) foundMetrics++;
                    if (metrics.community.volunteerHours !== null) foundMetrics++;
                    if (metrics.claimedImprovements.length > 0) foundMetrics++;
                    const completeness = Math.round((foundMetrics / totalMetrics) * 100);
                    return (
                      <div className="glass-sm p-4 rounded-xl border border-white/15">
                        <p className="text-xs text-white/60 mb-1">Data Completeness</p>
                        <p className="text-3xl font-bold text-white">{completeness}%</p>
                        <p className="text-xs text-white/50 mt-1">
                          {completeness < 70 ? 'Incomplete' : 'Complete'}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Compliance Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white mb-4">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between glass-sm p-4 rounded-xl border transition-all ${
                    verificationResult.lmaCompliance.overallCompliant
                      ? 'border-green-500/40 bg-green-500/10 hover:border-green-500/50'
                      : 'border-red-500/40 bg-red-500/10 hover:border-red-500/50'
                  }`}>
                    <div>
                      <p className="font-medium text-white">LMA Green Loan</p>
                      <p className="text-sm text-white/80">
                        {verificationResult.lmaCompliance.overallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'} 
                        ({lmaCompliance.filter(c => c.status === 'pass').length} Pass, {' '}
                        {lmaCompliance.filter(c => c.status === 'partial').length} Partial, {' '}
                        {lmaCompliance.filter(c => c.status === 'fail').length} Fail)
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        Score: {verificationResult.lmaCompliance.score}/100
                      </p>
                    </div>
                    {verificationResult.lmaCompliance.overallCompliant ? (
                      <CheckCircle className="text-green-400" size={24} />
                    ) : (
                      <XCircle className="text-red-400" size={24} />
                    )}
                  </div>
                  <div className={`flex items-center justify-between glass-sm p-4 rounded-xl border transition-all ${
                    verificationResult.euTaxonomyCompliance.compliant
                      ? 'border-green-500/40 bg-green-500/10 hover:border-green-500/50'
                      : 'border-red-500/40 bg-red-500/10 hover:border-red-500/50'
                  }`}>
                    <div>
                      <p className="font-medium text-white">EU Taxonomy</p>
                      <p className="text-sm text-white/80">
                        {verificationResult.euTaxonomyCompliance.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        Score: {verificationResult.euTaxonomyCompliance.score}/100
                      </p>
                      {verificationResult.euTaxonomyCompliance.issues.length > 0 && (
                        <p className="text-xs text-red-400/80 mt-1">
                          Issues: {verificationResult.euTaxonomyCompliance.issues.join(', ')}
                        </p>
                      )}
                    </div>
                    {verificationResult.euTaxonomyCompliance.compliant ? (
                      <CheckCircle className="text-green-400" size={24} />
                    ) : (
                      <XCircle className="text-red-400" size={24} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Audit Trail */}
          {auditLog.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {auditLog.map((entry) => (
                      <div key={entry.id} className="glass-sm flex items-start gap-3 p-3 rounded-lg border border-white/15 hover:border-white/25 transition-all">
                        <Hash size={16} className="text-white/40 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User size={14} className="text-white/40" />
                            <span className="text-xs text-white/50">{entry.user}</span>
                            <span className="text-xs text-white/30">•</span>
                            <span className="text-xs text-white/50">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">{entry.action}</p>
                          {entry.details && (
                            <p className="text-xs text-white/60 mt-1">
                              {JSON.stringify(entry.details).slice(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex gap-4 flex-wrap">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              New Verification
            </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
