import { useState, useEffect } from 'react';
import { Leaf, AlertTriangle, CheckCircle, XCircle, Shield, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MetricCard from '@/components/ui/MetricCard';
import AlertBadge from '@/components/ui/AlertBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { sampleESGData } from '@/lib/data/sampleData';
import { type ESGMetrics } from '@/types';
import {
  computeESGMonitoringCalculations,
  calculateDiscrepancy,
} from '@/lib/services/esgMonitoringService';
import {
  setupAutomatedUpdates,
  getLastUpdateTimestamp,
  saveLastUpdateTimestamp,
  type UpdateResult,
} from '@/lib/services/automatedUpdatesService';
import {
  ESGHistoricalDataService,
  type MonthlyAggregatedMetrics,
} from '@/lib/services/esgHistoricalDataService';

export function ESGMonitoring() {
  const [selectedLoan, setSelectedLoan] = useState<ESGMetrics>(sampleESGData[1]); // Greenwashing case
  const [lastUpdate, setLastUpdate] = useState<Date | null>(getLastUpdateTimestamp());
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<Array<{
    month: string;
    reported: number;
    verified: number;
    transparencyScore: number;
    complianceScore: number;
    fullMonth: string;
  }>>([]);

  // Calculate all metrics using the service
  const calculations = computeESGMonitoringCalculations(selectedLoan);

  // Initialize and load historical data
  useEffect(() => {
    // Initialize seed data for demo (only if no data exists)
    sampleESGData.forEach(loan => {
      ESGHistoricalDataService.initializeSeedData(loan.loanId, loan.borrowerName);
    });
    
    // Load historical data for selected loan
    loadHistoricalData();
  }, [selectedLoan.loanId]);

  // Load historical aggregated data for charts
  const loadHistoricalData = () => {
    const aggregated = ESGHistoricalDataService.getMonthlyAggregated(selectedLoan.loanId, 6);
    
    // Transform to chart format with month labels
    const chartData = aggregated.map(item => ({
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      reported: item.reportedReduction ?? 0,
      verified: item.verifiedReduction ?? 0,
      transparencyScore: item.transparencyScore,
      complianceScore: item.complianceScore,
      fullMonth: item.month,
    }));
    
    setHistoricalData(chartData);
  };

  // Save current month's metrics
  const saveCurrentMonthMetrics = () => {
    const currentMonth = ESGHistoricalDataService.getCurrentMonth();
    
    // Calculate reported and verified reductions from loan data
    const reportedReduction = selectedLoan.emissions.reported ?? null;
    const verifiedReduction = selectedLoan.emissions.verified ?? null;
    const transparencyScore = calculations.transparencyScore;
    const complianceScore = calculations.complianceStatus === 'compliant' ? 100 : 
                           calculations.unmetRequirements === 1 ? 67 : 
                           calculations.unmetRequirements === 2 ? 33 : 0;
    const riskScore = selectedLoan.greenwashingRisk.transparencyScore;
    
    // Get verified by sources
    const verifiedBy: string[] = [];
    if (selectedLoan.emissions.verificationDate) {
      verifiedBy.push('CDP');
    }
    if (selectedLoan.reporting.lastSubmitted) {
      verifiedBy.push('GRI');
    }
    
    // Validate data before saving
    const validation = ESGHistoricalDataService.validateMetricData({
      loanId: selectedLoan.loanId,
      loanName: selectedLoan.borrowerName,
      month: currentMonth,
      reportedReduction,
      verifiedReduction,
      transparencyScore,
      complianceScore,
      riskScore,
      verifiedBy,
      dataQuality: verifiedReduction !== null ? 'verified' : 'unverified',
      completeness: calculations.reportingCompleteness,
    });
    
    if (validation.valid) {
      ESGHistoricalDataService.saveMonthlySnapshot(validation.cleaned as any);
      loadHistoricalData(); // Refresh chart data
    }
  };

  // Set up automated daily updates (every 24 hours)
  useEffect(() => {
    const cleanup = setupAutomatedUpdates(
      sampleESGData,
      {
        intervalHours: 24,
        enabled: true,
      },
      (result: UpdateResult) => {
        setLastUpdate(result.timestamp);
        saveLastUpdateTimestamp(result.timestamp);
        setUpdateStatus(
          `Updated ${result.loansUpdated} loans, generated ${result.alertsGenerated} alerts`
        );
        setTimeout(() => setUpdateStatus(null), 5000);
      }
    );

    // Initial update on mount
    const lastUpdateTime = getLastUpdateTimestamp();
    if (!lastUpdateTime || Date.now() - lastUpdateTime.getTime() > 24 * 60 * 60 * 1000) {
      // If no update in last 24 hours, trigger one
      setIsUpdating(true);
      setTimeout(() => {
        const now = new Date();
        setLastUpdate(now);
        saveLastUpdateTimestamp(now);
        setIsUpdating(false);
        setUpdateStatus('Daily automated update completed');
        setTimeout(() => setUpdateStatus(null), 5000);
      }, 1000);
    }

    return cleanup;
  }, []);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    setUpdateStatus('Updating ESG metrics...');
    
    // Simulate update process
    setTimeout(() => {
      // Save current month's metrics
      saveCurrentMonthMetrics();
      
      const now = new Date();
      setLastUpdate(now);
      saveLastUpdateTimestamp(now);
      setIsUpdating(false);
      setUpdateStatus('Update completed successfully. Historical data updated.');
      setTimeout(() => setUpdateStatus(null), 3000);
    }, 1500);
  };
  
  // Auto-save metrics on loan selection change (if current month data doesn't exist)
  useEffect(() => {
    const currentMonth = ESGHistoricalDataService.getCurrentMonth();
    const hasCurrentData = ESGHistoricalDataService.getLoanSnapshots(selectedLoan.loanId)
      .some(s => s.month === currentMonth);
    
    if (!hasCurrentData) {
      // Save current metrics for this month
      setTimeout(() => saveCurrentMonthMetrics(), 500);
    } else {
      // Reload historical data when loan changes
      loadHistoricalData();
    }
  }, [selectedLoan.loanId]);

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="text-green-400" size={20} />
    ) : (
      <XCircle className="text-red-400" size={20} />
    );
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Calculate alerts based on calculations
  const alerts = [];
  
  // Alert for data discrepancy (using calculated discrepancy)
  if (calculations.discrepancyPercentage > 10) {
    alerts.push({
      severity: 'critical' as const,
      message: `Major data discrepancy detected: ${calculations.discrepancyPercentage.toFixed(1)}% variance between reported and verified emissions. Immediate verification required.`,
      timestamp: new Date(),
    });
  }

  // Alert for missed reports
  if (selectedLoan.reporting.missedReports > 0) {
    alerts.push({
      severity: 'warning' as const,
      message: `${selectedLoan.reporting.missedReports} report(s) overdue. Immediate submission required to maintain LMA compliance.`,
      timestamp: new Date(),
    });
  }

  // Alert for high risk
  if (selectedLoan.greenwashingRisk.riskLevel === 'high') {
    alerts.push({
      severity: 'critical' as const,
      message: `High greenwashing risk detected (Transparency Score: ${calculations.transparencyScore}/100). ${selectedLoan.greenwashingRisk.flags.length} risk flag(s) identified. Escalate to compliance committee.`,
      timestamp: new Date(),
    });
  }

  // Alert for non-compliance
  if (calculations.complianceStatus === 'non-compliant') {
    alerts.push({
      severity: 'warning' as const,
      message: `LMA compliance issues detected. ${calculations.unmetRequirements} compliance requirement(s) not met. Action required.`,
      timestamp: new Date(),
    });
  }

  // Alert for low completeness
  if (calculations.reportingCompleteness < 70) {
    alerts.push({
      severity: 'warning' as const,
      message: `Low reporting completeness (${calculations.reportingCompleteness}%). Request complete ESG documentation.`,
      timestamp: new Date(),
    });
  }

  // Calculate discrepancy for display
  const discrepancyValue = Math.abs(
    (selectedLoan.emissions.reported || 0) - (selectedLoan.emissions.verified || 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white">
      {/* Header with Auto-Update Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Shield className="text-emerald-400" size={32} />
            <h1 
              className="text-4xl font-bold bg-clip-text text-transparent animate-gradient"
              style={{
                backgroundImage: 'linear-gradient(to right, #7dd3fc, #ffffff, #5eead4, #fda4af, #67e8f9)',
              }}
            >
              ESG Veritas Platform
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock size={16} />
                <span>Last updated: {lastUpdate.toLocaleString()}</span>
              </div>
            )}
            <motion.button
              onClick={handleManualUpdate}
              disabled={isUpdating}
              whileHover={!isUpdating ? { scale: 1.05 } : {}}
              whileTap={!isUpdating ? { scale: 0.95 } : {}}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isUpdating 
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)',
                }}
                animate={isUpdating ? {
                  background: [
                    'linear-gradient(135deg, rgba(6, 182, 212, 0.4) 0%, rgba(16, 185, 129, 0.4) 100%)',
                    'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%)',
                    'linear-gradient(135deg, rgba(6, 182, 212, 0.4) 0%, rgba(16, 185, 129, 0.4) 100%)',
                  ],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: isUpdating ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Shimmer effect */}
              {!isUpdating && (
                <motion.div
                  className="absolute inset-0 -translate-x-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  }}
                  animate={{
                    x: ['0%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Pulsing glow effect */}
              {isUpdating && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                      '0 0 30px rgba(16, 185, 129, 0.6)',
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Icon with enhanced animation */}
              <motion.div
                className="relative z-10"
                animate={isUpdating ? {
                  rotate: 360,
                } : {}}
                transition={{
                  duration: 1,
                  repeat: isUpdating ? Infinity : 0,
                  ease: 'linear',
                }}
              >
                <RefreshCw 
                  size={16} 
                  className={isUpdating ? 'text-cyan-400' : 'text-cyan-300 group-hover:text-cyan-200'} 
                />
              </motion.div>

              {/* Text with smooth transition */}
              <motion.span
                className="relative z-10 font-semibold"
                style={{
                  color: isUpdating ? 'rgb(34, 211, 238)' : 'rgb(165, 243, 252)',
                }}
                animate={isUpdating ? {
                  opacity: [1, 0.7, 1],
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: isUpdating ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                {isUpdating ? 'Updating...' : 'Update Now'}
              </motion.span>

              {/* Progress indicator dots */}
              {isUpdating && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}
            </motion.button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-lg text-white/60">
            Track ESG performance and detect greenwashing aligned with LMA Green Loan Terms
          </p>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">24/7 Monitoring Active</span>
          </div>
        </div>
        {updateStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 glass-sm p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10"
          >
            <p className="text-sm text-cyan-400">{updateStatus}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Green Loans"
          value="47"
          subtitle="in portfolio"
          icon={Leaf}
          color="green"
        />
        <MetricCard
          title="Compliance Rate"
          value="89%"
          subtitle="LMA aligned"
          color="blue"
        />
        <MetricCard
          title="High Risk"
          value="3"
          subtitle="greenwashing flags"
          color="red"
        />
        <MetricCard
          title="Reporting"
          value="96%"
          subtitle="time reduction"
          color="green"
        />
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-3"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={24} />
            Active Alerts
          </h2>
          {alerts.map((alert, idx) => (
            <AlertBadge
              key={idx}
              severity={alert.severity}
              message={alert.message}
              timestamp={alert.timestamp}
            />
          ))}
        </motion.div>
      )}

      {/* LMA Green Loan Terms Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-sm border-2 border-emerald-500/30 bg-emerald-500/10 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg">
            <Leaf className="text-emerald-400" size={28} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg mb-1">LMA Green Loan Terms (Published Jan 9, 2025)</h3>
            <p className="text-sm text-white/70">
              This platform ensures compliance with the latest LMA Green Loan Principles and standardized reporting requirements
            </p>
          </div>
        </div>
      </motion.div>

      {/* Loan Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <label className="block text-sm font-medium text-white/80 mb-4">
          Select Green Loan
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleESGData.map((loan) => (
            <motion.button
              key={loan.loanId}
              onClick={() => setSelectedLoan(loan)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`glass-sm p-5 rounded-xl border-2 text-left transition-all ${
                selectedLoan.loanId === loan.loanId
                  ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white text-lg">{loan.borrowerName}</h3>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  getRiskBadgeColor(loan.greenwashingRisk.riskLevel)
                }`}>
                  {loan.greenwashingRisk.riskLevel.toUpperCase()} RISK
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className={`flex items-center gap-1.5 ${
                  loan.greenLoanStatus ? 'text-emerald-400' : 'text-white/50'
                }`}>
                  {loan.greenLoanStatus ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  Green Status
                </span>
                <span className="text-white/60">
                  Score: <span className="text-white font-semibold">{calculations.transparencyScore}/100</span>
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main ESG Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Emissions Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">Emissions Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-sm p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-sm text-white/60 mb-2">Reported Reduction</p>
                    <p className={`text-3xl font-bold ${
                      selectedLoan.emissions.reported >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {selectedLoan.emissions.reported > 0 ? '+' : ''}{selectedLoan.emissions.reported}%
                    </p>
                  </div>
                  <div className="glass-sm p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                    <p className="text-sm text-white/60 mb-2">Verified Reduction</p>
                    <p className={`text-3xl font-bold ${
                      selectedLoan.emissions.verified >= 0 ? 'text-cyan-400' : 'text-red-400'
                    }`}>
                      {selectedLoan.emissions.verified > 0 ? '+' : ''}{selectedLoan.emissions.verified}%
                    </p>
                  </div>
                </div>

                {/* Discrepancy Calculation Display */}
                {discrepancyValue > 0 && (
                  <div className="glass-sm p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-white/60">Discrepancy</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        calculations.discrepancyPercentage > 10
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {calculations.discrepancyPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {discrepancyValue.toFixed(1)}% variance
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      Formula: |Reported - Verified| / Target × 100
                    </p>
                  </div>
                )}

                {/* Discrepancy Warning */}
                {calculations.discrepancyPercentage > 10 && (
                  <AlertBadge
                    severity="critical"
                    message={`Data discrepancy exceeds threshold (${calculations.discrepancyPercentage.toFixed(1)}% > 10%). Immediate verification required.`}
                  />
                )}

                <div className="pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/60 mb-1">Target Reduction</p>
                      <p className="font-semibold text-white">{selectedLoan.emissions.targetReduction}%</p>
                    </div>
                    <div>
                      <p className="text-white/60 mb-1">Baseline Year</p>
                      <p className="font-semibold text-white">{selectedLoan.emissions.baselineYear}</p>
                    </div>
                    <div>
                      <p className="text-white/60 mb-1">Verified</p>
                      <div className="flex items-center gap-2">
                        {selectedLoan.emissions.verificationDate ? (
                          <>
                            <CheckCircle className="text-emerald-400" size={16} />
                            <span className="font-semibold text-emerald-400">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="text-red-400" size={16} />
                            <span className="font-semibold text-red-400">No</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 mb-1">Last Verified</p>
                      <p className="font-semibold text-white">
                        {selectedLoan.emissions.verificationDate?.toLocaleDateString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Greenwashing Risk Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">Greenwashing Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/80">Transparency Score</span>
                    <span className="text-2xl font-bold text-white">
                      {calculations.transparencyScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        calculations.transparencyScore >= 70
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : calculations.transparencyScore >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                      }`}
                      style={{ width: `${calculations.transparencyScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Calculated: (Verified Data Points / Total Required) × 100
                  </p>
                </div>

                <div>
                  <span className={`inline-block px-4 py-2.5 rounded-full font-bold text-lg border-2 ${
                    getRiskBadgeColor(selectedLoan.greenwashingRisk.riskLevel)
                  }`}>
                    {selectedLoan.greenwashingRisk.riskLevel.toUpperCase()} RISK
                  </span>
                </div>

                {selectedLoan.greenwashingRisk.flags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white text-sm mb-2">Risk Flags:</h4>
                    {selectedLoan.greenwashingRisk.flags.map((flag, idx) => (
                      <div key={idx} className="glass-sm p-3 rounded-lg border border-red-500/20 bg-red-500/5 flex items-start gap-3">
                        <AlertTriangle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-white/90 text-sm">{flag}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedLoan.greenwashingRisk.riskLevel === 'high' && calculations.recommendedActions.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-red-400 text-sm mb-3">Recommended Actions:</h4>
                    <ul className="text-sm text-white/80 space-y-2 list-disc list-inside">
                      {calculations.recommendedActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Historical Trend Chart - Live Monthly Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <TrendingUp className="text-cyan-400" size={24} />
                6-Month Historical Trend (Live Verified Data)
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>Updated monthly with verified data</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {historicalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.6)"
                    tick={{ fill: 'rgba(255,255,255,0.8)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.6)"
                    tick={{ fill: 'rgba(255,255,255,0.8)' }}
                    label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.8)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '0.75rem',
                      color: '#fff'
                    }}
                    formatter={(value: number | undefined, name: string | undefined) => {
                      if (value === undefined) return '';
                      if (!name) return '';
                      if (name === 'transparencyScore' || name === 'complianceScore') {
                        return [`${value}/100`, name];
                      }
                      return [`${value}%`, name];
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reported" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Reported Reduction (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="verified" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    name="Verified Reduction (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="transparencyScore" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#f59e0b', r: 4 }}
                    name="Transparency Score (/100)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="complianceScore" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    name="Compliance Score (/100)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/60">
                <div className="text-center">
                  <TrendingUp className="mx-auto mb-4 text-white/40" size={48} />
                  <p>No historical data available yet.</p>
                  <p className="text-sm mt-2">Data will appear after monthly updates.</p>
                </div>
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-emerald-500 rounded" />
                <span className="text-white/80">Reported Reduction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-cyan-500 rounded" />
                <span className="text-white/80">Verified Reduction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-500 rounded border-dashed border border-amber-500" />
                <span className="text-white/80">Transparency Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-purple-500 rounded border-dashed border border-purple-500" />
                <span className="text-white/80">Compliance Score</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reporting Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-white text-xl">Reporting Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-sm text-white/60 mb-2">Frequency</p>
                <p className="font-semibold text-white text-lg">{selectedLoan.reporting.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-2">Last Submitted</p>
                <p className="font-semibold text-white text-lg">
                  {selectedLoan.reporting.lastSubmitted?.toLocaleDateString() || 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-2">Missed Reports</p>
                <p className={`font-bold text-2xl ${
                  selectedLoan.reporting.missedReports === 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {selectedLoan.reporting.missedReports}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-2">Completeness</p>
                <p className="font-semibold text-white text-lg">{calculations.reportingCompleteness}%</p>
              </div>
            </div>

            {selectedLoan.reporting.missedReports > 0 && (
              <AlertBadge
                severity="warning"
                message={`${selectedLoan.reporting.missedReports} report(s) overdue. Immediate submission required to maintain LMA compliance.`}
              />
            )}

            {calculations.reportingCompleteness < 70 && (
              <div className="mt-4">
                <AlertBadge
                  severity="warning"
                  message={`Low reporting completeness (${calculations.reportingCompleteness}%). Request complete ESG documentation to meet LMA standards.`}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* LMA Compliance Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-white text-xl">LMA Green Loan Principles Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="glass-sm flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <span className="font-medium text-white">Green Loan Principles Framework</span>
                {getComplianceIcon(selectedLoan.lmaCompliance.greenLoanPrinciples)}
              </div>
              <div className="glass-sm flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <span className="font-medium text-white">Sustainability Coordinator Appointed</span>
                {getComplianceIcon(selectedLoan.lmaCompliance.sustainabilityCoordinator)}
              </div>
              <div className="glass-sm flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <span className="font-medium text-white">Reporting Aligned with Standards</span>
                {getComplianceIcon(selectedLoan.lmaCompliance.reportingAligned)}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/80">
                  <strong className="text-white">Overall Compliance Status:</strong>
                </p>
                {calculations.complianceStatus === 'compliant' ? (
                  <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    ✓ Fully Compliant
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                    ✗ Non-Compliant - Action Required
                  </span>
                )}
              </div>

              {calculations.complianceStatus === 'non-compliant' && (
                <div className="mt-4">
                  <AlertBadge
                    severity="warning"
                    message={`${calculations.unmetRequirements} compliance requirement(s) not met. Review and address to maintain green loan status.`}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
