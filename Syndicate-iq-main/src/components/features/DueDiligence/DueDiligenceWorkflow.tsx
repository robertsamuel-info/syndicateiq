import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Database,
  Shield,
  CheckCircle2,
  FileCheck,
  Download,
  Upload,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { extractPdfText } from '@/lib/utils/pdfExtractor';
import { generatePDFReport } from '@/lib/utils/pdfGenerator';

const steps = [
  {
    id: 1,
    title: 'Document Intake',
    description: 'Upload and validate loan documents',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Data Extraction',
    description: 'AI-powered extraction of key terms',
    icon: Database,
  },
  {
    id: 3,
    title: 'Risk & ESG Analysis',
    description: 'Automated risk scoring and ESG assessment',
    icon: Shield,
  },
  {
    id: 4,
    title: 'Compliance Validation',
    description: 'Verify regulatory and covenant compliance',
    icon: CheckCircle2,
  },
  {
    id: 5,
    title: 'Final Approval',
    description: 'Generate report and recommendations',
    icon: FileCheck,
  },
];

export default function DueDiligenceWorkflow() {
  const [activeStep, setActiveStep] = useState(1);
  const [auditLog, setAuditLog] = useState<Array<{ time: string; message: string }>>([]);
  const [approvalStatus, setApprovalStatus] = useState<string>('Pending');
  const [liveMode, setLiveMode] = useState(false);
  const [esgMetrics, setEsgMetrics] = useState([
    { name: 'Carbon Reduction', value: 72 },
    { name: 'Renewable Usage', value: 65 },
    { name: 'Water Savings', value: 58 },
    { name: 'Safety Compliance', value: 82 },
    { name: 'Board Independence', value: 76 },
  ]);
  const [riskScore, setRiskScore] = useState(0);
  const [borrower, setBorrower] = useState({
    name: '',
    creditScore: 0,
    annualRevenue: 0,
    debt: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate credit risk score
  const calculateCreditRisk = (borrowerData: typeof borrower) => {
    const debtRatio = borrowerData.debt / borrowerData.annualRevenue;
    let score = borrowerData.creditScore;

    if (debtRatio > 0.6) score -= 120;
    else if (debtRatio > 0.4) score -= 60;
    else if (debtRatio > 0.3) score -= 30;

    return Math.max(300, Math.min(900, score));
  };

  // Calculate risk score based on ESG metrics
  const calculateRiskScore = (metrics: typeof esgMetrics) => {
    const average = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
    const score = Math.round(100 - average);
    setRiskScore(score);
    return score;
  };

  // Initialize risk score on mount
  useEffect(() => {
    calculateRiskScore(esgMetrics);
    logEvent('Workflow initialized - ESG metrics loaded');
  }, []);

  // Compliance badge logic
  const complianceBadge = () => {
    if (riskScore < 30)
      return { label: 'GREEN', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (riskScore < 60)
      return { label: 'AMBER', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { label: 'RED', class: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  // Audit log function
  const logEvent = (message: string) => {
    setAuditLog((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), message },
    ]);
  };

  // Extract financial data from PDF text
  const extractFinancialsFromPDF = (text: string) => {
    const lowerText = text.toLowerCase();
    let extractedName = borrower.name;
    let extractedCreditScore = borrower.creditScore;
    let extractedRevenue = borrower.annualRevenue;
    let extractedDebt = borrower.debt;

    // Extract borrower name
    const namePatterns = [
      /borrower[:\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|PLC|AG|SA|Co|Company))/i,
      /(?:the\s+)?([A-Z][A-Za-z\s&,\.]+(?:Inc|Corp|Ltd|LLC|PLC|AG|SA|Co|Company))\s+(?:herein|hereinafter|shall|agrees)/i,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedName = match[1].trim();
        break;
      }
    }

    // Extract credit score
    const creditScoreMatch = text.match(/(?:credit\s+score|fico|credit\s+rating)[:\s]+(\d{3,4})/i);
    if (creditScoreMatch && creditScoreMatch[1]) {
      extractedCreditScore = Number(creditScoreMatch[1]);
    }

    // Extract annual revenue
    const revenuePatterns = [
      /(?:annual\s+)?revenue[:\s]+(?:USD|US\$|\$|₹)?\s*([\d,]+(?:\.[\d]+)?)\s*(?:million|billion|M|B)?/i,
      /revenue[:\s]+(?:USD|US\$|\$|₹)?\s*([\d,]+(?:\.[\d]+)?)\s*(?:million|billion|M|B)?/i,
      /total\s+revenue[:\s]+(?:USD|US\$|\$|₹)?\s*([\d,]+(?:\.[\d]+)?)/i,
    ];
    for (const pattern of revenuePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let revenueStr = match[1].replace(/,/g, '');
        const multiplier = text.match(/(million|billion|M|B)/i)?.[1]?.toLowerCase();
        let revenue = parseFloat(revenueStr);
        if (multiplier === 'million' || multiplier === 'm') {
          revenue *= 1_000_000;
        } else if (multiplier === 'billion' || multiplier === 'b') {
          revenue *= 1_000_000_000;
        }
        if (revenue > 0) {
          extractedRevenue = Math.round(revenue);
          break;
        }
      }
    }

    // Extract debt
    const debtPatterns = [
      /(?:total\s+)?debt[:\s]+(?:USD|US\$|\$|₹)?\s*([\d,]+(?:\.[\d]+)?)\s*(?:million|billion|M|B)?/i,
      /outstanding\s+debt[:\s]+(?:USD|US\$|\$|₹)?\s*([\d,]+(?:\.[\d]+)?)/i,
      /debt\s+obligations[:\s]+(?:USD|US\$|\$|₹)?\s*([\d,]+(?:\.[\d]+)?)/i,
    ];
    for (const pattern of debtPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let debtStr = match[1].replace(/,/g, '');
        const multiplier = text.match(/(million|billion|M|B)/i)?.[1]?.toLowerCase();
        let debt = parseFloat(debtStr);
        if (multiplier === 'million' || multiplier === 'm') {
          debt *= 1_000_000;
        } else if (multiplier === 'billion' || multiplier === 'b') {
          debt *= 1_000_000_000;
        }
        if (debt > 0) {
          extractedDebt = Math.round(debt);
          break;
        }
      }
    }

    return {
      name: extractedName || borrower.name,
      creditScore: extractedCreditScore || borrower.creditScore,
      annualRevenue: extractedRevenue || borrower.annualRevenue,
      debt: extractedDebt || borrower.debt,
    };
  };

  // Handle PDF upload and extraction
  const handlePDFUpload = async (file: File) => {
    setSelectedFile(file);
    setLoading(true);
    logEvent(`PDF uploaded: ${file.name}`);

    try {
      const extractionResult = await extractPdfText(file);
      
      if (extractionResult.success && extractionResult.text) {
        const financials = extractFinancialsFromPDF(extractionResult.text);
        setBorrower(financials);
        logEvent(`Financial data extracted from PDF: ${financials.name || 'Name not found'}, Revenue: ${financials.annualRevenue > 0 ? '₹' + financials.annualRevenue.toLocaleString() : 'Not found'}, Debt: ${financials.debt > 0 ? '₹' + financials.debt.toLocaleString() : 'Not found'}, Credit Score: ${financials.creditScore > 0 ? financials.creditScore : 'Not found'}`);
      } else {
        logEvent('PDF text extraction failed - please enter data manually');
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
      logEvent('Error processing PDF - please enter data manually');
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      handlePDFUpload(file);
    } else if (file) {
      logEvent('Invalid file type. Please upload a PDF file.');
    }
  };

  // Live API simulation for ESG metrics
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      setEsgMetrics((prevMetrics) => {
        const simulated = prevMetrics.map((m) => ({
          ...m,
          value: Math.min(100, Math.max(40, m.value + (Math.random() * 10 - 5))),
        }));

        calculateRiskScore(simulated);
        logEvent('Live API simulated ESG update received');
        return simulated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [liveMode]);

  // Live API simulation for credit risk data
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      setBorrower((prev) => {
        const updated = {
          ...prev,
          creditScore: Math.max(300, Math.min(900, prev.creditScore + Math.floor(Math.random() * 40 - 20))),
          debt: Math.max(0, prev.debt + Math.floor(Math.random() * 200000 - 100000)),
        };
        logEvent('Live API simulated credit risk update received');
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [liveMode]);

  // Approval functions
  const approveDeal = () => {
    setApprovalStatus('Approved');
    logEvent('Deal approved by Credit Committee');
  };

  const rejectDeal = () => {
    setApprovalStatus('Rejected');
    logEvent('Deal rejected by Risk Officer');
  };

  // Download ESG & Credit Risk Report (Professional PDF)
  const downloadReport = () => {
    if (!borrower.name || borrower.creditScore === 0 || borrower.annualRevenue === 0) {
      logEvent('Cannot download report: Borrower financial data incomplete');
      alert('Please complete Steps 1-2 to enter borrower financial data before downloading the report.');
      return;
    }

    try {
      generatePDFReport({
        title: 'ESG & Credit Risk Assessment Report',
        generatedAt: new Date().toLocaleString(),
        esgMetrics,
        riskScore,
        complianceStatus: complianceBadge().label,
        borrower,
        approvalStatus,
        auditLog,
      });
      
      logEvent('ESG & Credit Risk Report generated (PDF)');
    } catch (error) {
      console.error('PDF generation error:', error);
      logEvent('Error generating PDF report');
      alert('Error generating PDF report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 text-white">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent"
        >
          SyndicateIQ – Due Diligence Workflow
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-400"
        >
          Comprehensive ESG & Credit Risk Assessment Platform
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;

          return (
            <motion.div
              key={step.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveStep(step.id)}
            >
              <Card
                className={`cursor-pointer rounded-2xl border transition-all backdrop-blur-xl bg-white/5 ${
                  isActive
                    ? 'border-emerald-400 shadow-xl'
                    : 'border-white/10'
                }`}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <Icon className="h-10 w-10 text-emerald-400" />
                  <h2 className="font-semibold text-lg">{step.title}</h2>
                  <p className="text-sm text-slate-300">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10"
      >
        <Card className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-3">
              {steps[activeStep - 1].title}
            </h3>
            <p className="text-slate-300 mb-6">
              {steps[activeStep - 1].description}
            </p>

            {/* Step 1: PDF Upload */}
            {activeStep === 1 && (
              <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Upload ESG & Financial PDF</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer hover:bg-emerald-500/30 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Choose PDF File</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {selectedFile && (
                        <span className="text-sm text-slate-300">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>
                    {loading && (
                      <p className="text-sm text-slate-300">Processing PDF...</p>
                    )}
                    {selectedFile && !loading && (
                      <p className="text-sm text-emerald-400">
                        ✓ PDF processed. Financial data extracted (if available). You can override values in Step 2.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Borrower Manual Input */}
            {activeStep === 2 && (
              <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Enter Borrower Financials {selectedFile && '(Override PDF)'}</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Borrower Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Borrower Name"
                        value={borrower.name}
                        onChange={(e) => setBorrower({ ...borrower, name: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Credit Score
                      </label>
                      <Input
                        type="number"
                        placeholder="Credit Score (300-900)"
                        value={borrower.creditScore || ''}
                        onChange={(e) => setBorrower({ ...borrower, creditScore: Number(e.target.value) || 0 })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                        min="300"
                        max="900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Annual Revenue (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder="Annual Revenue"
                        value={borrower.annualRevenue || ''}
                        onChange={(e) => setBorrower({ ...borrower, annualRevenue: Number(e.target.value) || 0 })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Outstanding Debt (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder="Debt"
                        value={borrower.debt || ''}
                        onChange={(e) => setBorrower({ ...borrower, debt: Number(e.target.value) || 0 })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                        min="0"
                      />
                    </div>
                    {borrower.name && borrower.creditScore > 0 && borrower.annualRevenue > 0 && (
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-sm text-emerald-400">
                          ✓ Borrower data ready for credit risk analysis
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Risk & ESG Analysis */}
            {activeStep === 3 && (
              <>
                {/* Compliance Badge and Live API Toggle */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm text-slate-300">Compliance:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${complianceBadge().class}`}
                  >
                    {complianceBadge().label}
                  </span>
                  <Button
                    size="sm"
                    variant={liveMode ? 'destructive' : 'secondary'}
                    onClick={() => {
                      setLiveMode(!liveMode);
                      logEvent(liveMode ? 'Live API simulation stopped' : 'Live API simulation started');
                    }}
                  >
                    {liveMode ? 'Stop Live API' : 'Start Live API'}
                  </Button>
                </div>

                {/* ESG Metrics Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="rounded-2xl bg-white/5 border border-white/10">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 text-white">ESG Performance Trend</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={esgMetrics}>
                            <XAxis
                              dataKey="name"
                              tick={{ fill: '#94a3b8', fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ fill: '#10b981', r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 gap-4">
                    {esgMetrics.map((metric) => (
                      <Card
                        key={metric.name}
                        className="rounded-xl bg-white/5 border border-white/10"
                      >
                        <CardContent className="p-4 flex justify-between items-center">
                          <span className="text-sm text-slate-300">{metric.name}</span>
                          <span className="font-bold text-lg text-emerald-400">{metric.value}%</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Risk Score Display */}
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white mb-1">Calculated ESG Risk Score</p>
                  <p className="text-3xl font-bold mt-1 text-cyan-400">{riskScore}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Lower score indicates lower risk
                  </p>
                </div>

                {/* Credit Risk Assessment Panel */}
                <Card className="mb-6 rounded-xl bg-white/5 border border-white/10">
                  <CardContent className="p-5">
                    <h4 className="font-semibold mb-2 text-white">Credit Risk Assessment</h4>
                    {!borrower.name || borrower.creditScore === 0 || borrower.annualRevenue === 0 ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-amber-400">
                          ⚠️ Please complete Steps 1-2 to enter borrower financial data before viewing credit risk assessment.
                        </p>
                        <p className="text-slate-400 text-xs">
                          Go to Step 1 to upload a PDF or Step 2 to enter data manually.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-300">
                          Borrower: <b className="text-white">{borrower.name}</b>
                        </p>
                        <p className="text-slate-300">
                          Credit Score: <b className="text-white">{borrower.creditScore}</b>
                        </p>
                        <p className="text-slate-300">
                          Annual Revenue: <b className="text-white">₹{borrower.annualRevenue.toLocaleString()}</b>
                        </p>
                        <p className="text-slate-300">
                          Outstanding Debt: <b className="text-white">₹{borrower.debt.toLocaleString()}</b>
                        </p>
                        <p className="text-slate-300">
                          Debt-to-Income Ratio: <b className="text-white">
                            {borrower.annualRevenue > 0 ? ((borrower.debt / borrower.annualRevenue) * 100).toFixed(1) : '0'}%
                          </b>
                        </p>
                        <p className="mt-3 font-bold text-lg">
                          Risk Level:{' '}
                          {borrower.creditScore > 700 ? (
                            <span className="text-emerald-400">🟢 Low Risk</span>
                          ) : borrower.creditScore > 600 ? (
                            <span className="text-yellow-400">🟡 Medium Risk</span>
                          ) : borrower.creditScore > 0 ? (
                            <span className="text-red-400">🔴 High Risk</span>
                          ) : (
                            <span className="text-slate-400">Not Available</span>
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Navigation and Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="outline"
                disabled={activeStep === 1}
                onClick={() => setActiveStep((s) => s - 1)}
              >
                Previous
              </Button>
              <Button
                variant="default"
                disabled={activeStep === steps.length}
                onClick={() => setActiveStep((s) => s + 1)}
              >
                Next
              </Button>
              {activeStep === 5 && (
                <>
                  <Button
                    variant="secondary"
                    onClick={approveDeal}
                    disabled={approvalStatus === 'Approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={rejectDeal}
                    disabled={approvalStatus === 'Rejected'}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    onClick={downloadReport}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Download Professional PDF Report
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Audit Trail Panel */}
      <Card className="mt-10 rounded-2xl bg-white/5 border border-white/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Audit Trail</h3>
            <span className="text-sm text-slate-300">
              Status: <span className="font-bold text-cyan-400">{approvalStatus}</span>
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-auto text-sm">
            {auditLog.length === 0 && (
              <p className="text-slate-400">No events yet.</p>
            )}

            {auditLog.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex justify-between border-b border-white/10 pb-2"
              >
                <span className="text-slate-300">{log.message}</span>
                <span className="text-slate-400">{log.time}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
