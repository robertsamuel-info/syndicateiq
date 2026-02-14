import { useState } from 'react';
import { Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import MetricCard from '@/components/ui/MetricCard';
import RiskGauge from '@/components/features/RiskGauge';
import AlertBadge from '@/components/ui/AlertBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { sampleCovenantMonitoring } from '@/lib/data/sampleData';

export function CovenantMonitoring() {
  const [selectedLoan, setSelectedLoan] = useState(sampleCovenantMonitoring[1]); // High risk one

  // Historical data for trend chart
  const historicalData = [
    { month: 'Jul', ratio: 2.8 },
    { month: 'Aug', ratio: 2.9 },
    { month: 'Sep', ratio: 3.0 },
    { month: 'Oct', ratio: 3.1 },
    { month: 'Nov', ratio: 3.15 },
    { month: 'Dec', ratio: 3.2 },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="text-green-400" size={20} />;
    if (trend === 'deteriorating') return <TrendingDown className="text-red-400" size={20} />;
    return <div className="w-5 h-5 bg-white/30 rounded-full" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Shield className="text-cyan-400" size={32} />
          <h1 
            className="text-4xl font-bold bg-clip-text text-transparent animate-gradient"
            style={{
              backgroundImage: 'linear-gradient(to right, #7dd3fc, #ffffff, #5eead4, #fda4af, #67e8f9)',
            }}
          >
            Covenant Guardian
          </h1>
        </div>
        <p className="text-lg text-white/60">
          Real-time covenant monitoring with 60-90 day breach prediction
        </p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Portfolio Loans"
          value="247"
          subtitle="actively monitored"
          icon={Shield}
          color="slate"
        />
        <MetricCard
          title="High Risk"
          value="12"
          subtitle="requiring attention"
          color="red"
        />
        <MetricCard
          title="Predicted Breaches"
          value="5"
          subtitle="in next 90 days"
          color="amber"
        />
        <MetricCard
          title="Time Saved"
          value="70%"
          subtitle="vs manual monitoring"
          color="green"
        />
      </div>

      {/* Loan Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <label className="block text-sm font-medium text-white/80 mb-4">
          Select Loan to Monitor
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleCovenantMonitoring.map((loan: typeof sampleCovenantMonitoring[0]) => (
            <motion.button
              key={loan.loanId}
              onClick={() => setSelectedLoan(loan)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`glass-sm p-4 rounded-xl border-2 text-left transition-all ${
                selectedLoan.loanId === loan.loanId
                  ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-lg">{loan.borrowerName}</h3>
                  <p className="text-sm text-white/60">ID: {loan.loanId}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  loan.riskScore < 30
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : loan.riskScore < 60
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  Risk: {loan.riskScore}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Monitoring Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-stretch">
        {/* Risk Gauge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full h-full flex items-center justify-center"
        >
          <RiskGauge
            score={selectedLoan.riskScore}
            label="Overall Risk Score"
            size="md"
          />
        </motion.div>

        {/* Breach Prediction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-white text-lg">Breach Prediction</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/60 mb-3">Probability</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      {/* Background track */}
                      <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-white/10">
                        {/* Animated multicolor progress bar */}
                        <motion.div
                          className="h-4 rounded-full relative overflow-hidden"
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedLoan.breachProbability}%` }}
                          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                        >
                          {/* Base gradient */}
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: selectedLoan.breachProbability > 50
                                ? 'linear-gradient(90deg, #EF4444 0%, #F87171 50%, #DC2626 100%)'
                                : 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)',
                            }}
                            animate={{
                              background: selectedLoan.breachProbability > 50
                                ? [
                                    'linear-gradient(90deg, #EF4444 0%, #F87171 50%, #DC2626 100%)',
                                    'linear-gradient(90deg, #DC2626 0%, #EF4444 50%, #F87171 100%)',
                                    'linear-gradient(90deg, #F87171 0%, #DC2626 50%, #EF4444 100%)',
                                    'linear-gradient(90deg, #EF4444 0%, #F87171 50%, #DC2626 100%)',
                                  ]
                                : [
                                    'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)',
                                    'linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)',
                                    'linear-gradient(90deg, #FBBF24 0%, #D97706 50%, #F59E0B 100%)',
                                    'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)',
                                  ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />

                          {/* Animated shimmer overlay */}
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                              backgroundSize: '200% 100%',
                            }}
                            animate={{
                              backgroundPosition: ['-200%', '200%'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />

                          {/* Multicolor animated gradient overlay */}
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.8) 0%, rgba(139, 92, 246, 0.8) 25%, rgba(236, 72, 153, 0.8) 50%, rgba(6, 182, 212, 0.8) 75%, rgba(239, 68, 68, 0.8) 100%)',
                              backgroundSize: '200% 100%',
                              mixBlendMode: 'screen',
                            }}
                            animate={{
                              backgroundPosition: ['0%', '200%'],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />

                          {/* Glowing edge effect */}
                          <motion.div
                            className="absolute right-0 top-0 bottom-0 w-8"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 100%)',
                              filter: 'blur(8px)',
                            }}
                            animate={{
                              opacity: [0.3, 0.7, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        </motion.div>

                        {/* Pulsing glow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            boxShadow: selectedLoan.breachProbability > 50
                              ? '0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.2)'
                              : '0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(245, 158, 11, 0.2)',
                          }}
                          animate={{
                            boxShadow: selectedLoan.breachProbability > 50
                              ? [
                                  '0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.2)',
                                  '0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 25px rgba(239, 68, 68, 0.3)',
                                  '0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.2)',
                                ]
                              : [
                                  '0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(245, 158, 11, 0.2)',
                                  '0 0 30px rgba(245, 158, 11, 0.6), inset 0 0 25px rgba(245, 158, 11, 0.3)',
                                  '0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(245, 158, 11, 0.2)',
                                ],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      </div>
                    </div>
                    <motion.span
                      className="text-2xl font-bold text-white min-w-[60px] text-right"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                    >
                      {selectedLoan.breachProbability}%
                    </motion.span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-2">Forecast Period</p>
                  <p className="text-xl font-semibold text-white">{selectedLoan.forecastPeriod} days</p>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-2">Recommended Action</p>
                  <p className="text-sm text-white/90">
                    {selectedLoan.riskScore > 60 
                      ? 'Schedule immediate intervention meeting with borrower'
                      : 'Continue standard monitoring'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loss Prevention */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="h-full"
        >
          <Card className="border-2 border-green-500/30 bg-green-500/10 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-green-400 text-lg">Loss Prevention</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-green-300/80 mb-1">Potential Loss Avoided</p>
                  <p className="text-3xl font-bold text-green-400">$5M-$10M</p>
                  <p className="text-xs text-green-300/60 mt-1">per prevented default</p>
                </div>
                <div className="pt-3 border-t border-green-500/20">
                  <p className="text-sm text-green-300/80 mb-1">Early Warning Benefit</p>
                  <p className="text-sm text-green-300/90">
                    60-90 day advance notice enables proactive negotiation and restructuring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Covenant Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-white text-lg">Covenant Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedLoan.covenants.map((covenant: typeof selectedLoan.covenants[0], idx: number) => (
                <div key={idx} className="glass-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{covenant.type}</h4>
                      {getTrendIcon(covenant.trend)}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                      covenant.cushion > 20
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : covenant.cushion > 10
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {covenant.cushion.toFixed(1)}% cushion
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-white/60">Current Value</p>
                      <p className="text-lg font-semibold text-white">{covenant.currentValue.toFixed(2)}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Covenant Limit</p>
                      <p className="text-lg font-semibold text-white">{covenant.limit.toFixed(2)}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Trend</p>
                      <p className={`text-sm font-medium ${
                        covenant.trend === 'improving' 
                          ? 'text-green-400' 
                          : covenant.trend === 'deteriorating' 
                          ? 'text-red-400' 
                          : 'text-white/60'
                      }`}>
                        {covenant.trend.charAt(0).toUpperCase() + covenant.trend.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          covenant.cushion > 20
                            ? 'bg-green-500'
                            : covenant.cushion > 10
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(covenant.currentValue / covenant.limit) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Historical Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-white text-lg">6-Month Trend: Debt/EBITDA</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.8)' }}
                />
                <YAxis 
                  domain={[0, 4]} 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.8)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.75rem',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ratio" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', r: 6 }}
                />
                {/* Covenant limit line */}
                <Line 
                  type="monotone" 
                  dataKey={() => 3.5} 
                  stroke="#94A3B8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500 rounded" />
                <span className="text-white/80">Actual Ratio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-slate-400 rounded border-dashed border border-slate-400" />
                <span className="text-white/80">Covenant Limit (3.5x)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Alerts */}
      {selectedLoan.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
          {selectedLoan.alerts.map((alert: typeof selectedLoan.alerts[0], idx: number) => (
            <AlertBadge
              key={idx}
              severity={alert.severity}
              message={alert.message}
              timestamp={alert.triggeredDate}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
