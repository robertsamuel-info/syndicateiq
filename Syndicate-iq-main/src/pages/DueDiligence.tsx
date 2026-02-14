import { useState } from 'react';
import { Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import MetricCard from '@/components/ui/MetricCard';
import ComparisonCard from '@/components/features/ComparisonCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { type DueDiligenceCheck, type DueDiligenceReportGuide } from '@/types';
import { sampleLoans } from '@/lib/data/sampleData';
import { notificationService } from '@/lib/services/notificationService';

const currencies = [
  { code: "USD", name: "US Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "ZAR", name: "South African Rand" },
  { code: "KRW", name: "South Korean Won" },
  { code: "THB", name: "Thai Baht" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "BRL", name: "Brazilian Real" }
];

export function DueDiligence() {
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<DueDiligenceCheck[]>([]);
  const [report, setReport] = useState<DueDiligenceReportGuide | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const dueDiligenceChecks: Omit<DueDiligenceCheck, 'timestamp'>[] = [
    {
      checkName: 'Covenant Compliance',
      status: 'pending',
      details: 'Checking all financial covenants are met as of latest report'
    },
    {
      checkName: 'Security Perfection',
      status: 'pending',
      details: 'Confirming security interests are properly registered'
    },
    {
      checkName: 'Amendment History',
      status: 'pending',
      details: 'Reviewing all modifications and waivers'
    },
    {
      checkName: 'Documentation Review',
      status: 'pending',
      details: 'Verifying all required documents are present and valid'
    }
  ];

  const startDueDiligence = () => {
    if (!selectedLoan) return;

    // Log the trade details
    console.log("Selected Loan:", selectedLoan);
    console.log("Trade Amount:", amount);
    console.log("Currency:", currency);

    setRunning(true);
    setElapsedTime(0);
    setReport(null);

    // Initialize checks
    const initialChecks = dueDiligenceChecks.map(check => ({
      ...check,
      timestamp: new Date()
    }));
    setChecks(initialChecks);

    // Timer for elapsed time
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Simulate checks running
    let checkIndex = 0;
    const checkInterval = setInterval(() => {
      if (checkIndex >= dueDiligenceChecks.length) {
        clearInterval(checkInterval);
        clearInterval(timer);
        
        // Generate report
        const finalReport: DueDiligenceReportGuide = {
          tradeId: `TRADE-${Date.now()}`,
          loanId: selectedLoan,
          initiatedBy: 'Demo User',
          initiatedDate: new Date(),
          completionTime: 2,
          checks: initialChecks.map((check, idx) => ({
            ...check,
            status: 'complete',
            result: idx === 0 
              ? 'warning' as const  // Covenant Compliance - WARNING
              : 'pass' as const,  // All others - PASS
            details: idx === 0
              ? 'Covenant compliance verified - cushion narrowing, recommend monitoring'
              : check.details + ' - Verified',
            timestamp: new Date()
          })),
          summary: {
            overallRisk: 'medium',
            recommendation: 'Proceed with trade - minor covenant monitoring required',
            totalCostSaved: 20000,
            timeSaved: '12 days'
          }
        };

        setReport(finalReport);
        setRunning(false);
        
        // Add notification when due diligence completes
        const loan = sampleLoans.find(loan => loan.id === selectedLoan);
        const loanName = loan?.basicDetails.borrower || selectedLoan;
        notificationService.addDueDiligenceComplete(loanName);
        
        return;
      }

      // Update current check to processing
      setChecks(prev => prev.map((check, idx) => 
        idx === checkIndex 
          ? { ...check, status: 'processing' as const }
          : check
      ));

      // After 2 seconds, mark as complete
      setTimeout(() => {
        setChecks(prev => prev.map((check, idx) => 
          idx === checkIndex 
            ? { 
                ...check, 
                status: 'complete' as const,
                result: checkIndex === 0 
                  ? 'warning' as const  // Covenant Compliance - WARNING
                  : 'pass' as const,  // All others - PASS
                details: checkIndex === 0 
                  ? 'Covenant compliance verified - cushion narrowing, recommend monitoring'
                  : check.details + ' - Verified'
              }
            : check
        ));
      }, 2000);

      checkIndex++;
    }, 2500);
  };

  const getCheckIcon = (check: DueDiligenceCheck) => {
    if (check.status === 'complete') {
      if (check.result === 'pass') return <CheckCircle className="text-green-400" size={20} />;
      if (check.result === 'warning') return <AlertCircle className="text-amber-400" size={20} />;
      if (check.result === 'fail') return <AlertCircle className="text-red-400" size={20} />;
    }
    if (check.status === 'processing') {
      return <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400/30 border-t-cyan-400"></div>;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-white/30"></div>;
  };

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative">
            <h1 
              className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent animate-gradient mb-3"
              style={{
                backgroundImage: 'linear-gradient(to right, #7dd3fc, #ffffff, #5eead4, #fda4af, #67e8f9)',
              }}
            >
              Settlement Due Diligence Accelerator
            </h1>
            <p className="text-lg text-white/60">
              Automate pre-trade verification and accelerate settlement by 85%
            </p>
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <MetricCard
              title="Settlement Time"
              value="2 hours"
              subtitle="vs 10-14 days traditional"
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
              value="$20K"
              subtitle="per trade on average"
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
              title="LMA Priority"
              value="25%"
              subtitle="settlement improvement goal"
              color="slate"
            />
          </motion.div>
        </div>

        {/* Comparison Card */}
        <ComparisonCard
          traditional={{
            time: "10-14 days",
            cost: "$15,000-$25,000"
          }}
          syndicateiq={{
            time: "2 hours",
            cost: "$500"
          }}
          savings={{
            time: "85%",
            cost: "$19,500"
          }}
        />

        {/* Trade Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="p-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
                <CardTitle className="text-2xl font-bold text-white">Initiate Due Diligence</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Select
                    label="Select Loan for Trade"
                    value={selectedLoan}
                    onChange={(e) => setSelectedLoan(e.target.value)}
                    disabled={running}
                    className="text-white bg-white/5"
                  >
                    <option value="" className="bg-background text-white">Choose a loan...</option>
                    {sampleLoans.map(loan => (
                      <option key={loan.id} value={loan.id} className="bg-background text-white">
                        {loan.basicDetails.borrower} - {loan.basicDetails.currency} {loan.basicDetails.amount.toLocaleString()}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Trade Amount */}
                <div>
                  <Input
                    label="Enter Trade Amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={running}
                    className="text-white bg-white/5"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Currency Selector */}
                <div>
                  <Select
                    label="Select Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={running}
                    className="text-white bg-white/5"
                  >
                    {currencies.map((cur) => (
                      <option key={cur.code} value={cur.code} className="bg-background text-white">
                        {cur.code} — {cur.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Trade Preview */}
                {amount && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-sm p-6 rounded-xl border border-cyan-500/40 hover:border-cyan-500/50 transition-all"
                  >
                    <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">
                      Trade Preview
                    </p>
                    <p className="text-3xl font-bold text-cyan-400">
                      {currency} {Number(amount || 0).toLocaleString()}
                    </p>
                  </motion.div>
                )}

                <Button
                  onClick={startDueDiligence}
                  disabled={!selectedLoan || running}
                  variant="glass"
                  className="w-full py-5 text-lg font-semibold flex items-center justify-center gap-3 
                    bg-gradient-to-r from-cyan-600/40 via-cyan-500/50 to-teal-500/40 
                    border-2 border-cyan-400/50 
                    hover:from-cyan-500/50 hover:via-cyan-400/60 hover:to-teal-400/50 
                    hover:border-cyan-300/70 
                    hover:shadow-lg hover:shadow-cyan-500/30 
                    active:scale-[0.98]
                    disabled:from-slate-700/30 disabled:via-slate-700/30 disabled:to-slate-700/30 
                    disabled:border-slate-600/30 disabled:cursor-not-allowed disabled:opacity-50
                    transition-all duration-300 
                    relative overflow-hidden
                    group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-400/20 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {running ? (
                      <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-200/30 border-t-cyan-200"></div>
                      </div>
                    ) : (
                      <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 
                        group-hover:bg-white/20 group-hover:border-white/30 
                        transition-all duration-300">
                        <Play size={20} className="text-cyan-200 group-hover:text-white transition-colors" />
                      </div>
                    )}
                    <span className="text-white tracking-wide">
                      {running ? 'Running Verification...' : 'Start Automated Due Diligence'}
                    </span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Progress */}
        {checks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-white">Verification Progress</CardTitle>
                  <div className="text-sm text-white/60">
                    Elapsed Time: <span className="font-mono font-bold text-cyan-400">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checks.map((check, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`glass-sm p-4 rounded-xl border ${
                        check.status === 'processing' 
                          ? 'border-cyan-500/50 bg-cyan-500/10' 
                          : check.status === 'complete'
                          ? check.result === 'pass'
                            ? 'border-green-500/50 bg-green-500/10'
                            : check.result === 'warning'
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-red-500/50 bg-red-500/10'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getCheckIcon(check)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{check.checkName}</h3>
                          <p className="text-sm text-white/60 mt-1">{check.details}</p>
                        </div>
                        {check.status === 'complete' && check.result && (
                          <span className={`text-xs font-bold px-4 py-2 rounded-md border-2 ${
                            check.result === 'pass' 
                              ? 'bg-green-500/30 text-green-300 border-green-500/50 shadow-lg shadow-green-500/20'
                              : check.result === 'warning'
                              ? 'bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20'
                              : 'bg-red-500/30 text-red-300 border-red-500/50 shadow-lg shadow-red-500/20'
                          }`}>
                            {check.result === 'fail' ? 'CRITICAL' : check.result.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Final Report */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8">
              <CardHeader>
                <div>
                  <CardTitle className="text-2xl font-bold text-white mb-1">Due Diligence Report</CardTitle>
                  <p className="text-sm text-white/60">Generated in {report.completionTime} hours</p>
                </div>
              </CardHeader>
              <CardContent>
                {/* Executive Summary */}
                <div className="glass-lg p-6 mb-6 rounded-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">Overall Risk Assessment</p>
                      <span className={`inline-block px-4 py-2 rounded-full font-medium ${
                        report.summary.overallRisk === 'low'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : report.summary.overallRisk === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {report.summary.overallRisk.toUpperCase()} RISK
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">Recommendation</p>
                      <p className="font-medium text-white">{report.summary.recommendation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">Completion Time</p>
                      <p className="font-medium text-white text-lg">{report.completionTime} hours</p>
                      <p className="text-xs text-white/50 mt-1">vs. 10-14 days traditional</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">Cost Savings</p>
                      <p className="font-medium text-green-400 text-2xl">
                        ${report.summary.totalCostSaved.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Findings */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Detailed Findings</h3>
                  <div className="space-y-3">
                    {report.checks.map((check, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-4 p-4 glass-sm rounded-xl border border-white/15 hover:bg-white/8 hover:border-white/25 transition-all"
                      >
                        {check.result === 'pass' && (
                          <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                            <CheckCircle className="text-green-400" size={20} />
                          </div>
                        )}
                        {check.result === 'warning' && (
                          <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
                            <AlertCircle className="text-amber-400" size={20} />
                          </div>
                        )}
                        {check.result === 'fail' && (
                          <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                            <AlertCircle className="text-red-400" size={20} />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-white mb-1">{check.checkName}</p>
                          <p className="text-sm text-white/60">{check.details}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
