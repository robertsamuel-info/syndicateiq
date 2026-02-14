import { LayoutDashboard, FileText, TrendingUp, Shield, Leaf, ArrowRight, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MetricCard from '@/components/ui/MetricCard';
import AlertBadge from '@/components/ui/AlertBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { sampleCovenantMonitoring, sampleESGData } from '@/lib/data/sampleData';

export function Dashboard() {
  const portfolioHealth = 85;
  const totalLoans = 247;
  const activeAlerts = 12;

  // Get high-risk items
  const highRiskLoans = sampleCovenantMonitoring.filter(loan => loan.riskScore > 60);
  const esgFlags = sampleESGData.filter(loan => loan.greenwashingRisk.riskLevel === 'high');

  const moduleCards = [
    {
      to: '/document-processing',
      icon: FileText,
      title: 'Document Intelligence',
      subtitle: '99% faster processing',
      color: 'blue',
      stats: [
        { label: 'Processed This Month', value: '47' },
        { label: 'Time Saved', value: '156 days', highlight: true },
      ],
    },
    {
      to: '/due-diligence',
      icon: TrendingUp,
      title: 'Due Diligence',
      subtitle: '85% faster settlement',
      color: 'green',
      stats: [
        { label: 'Trades This Month', value: '23' },
        { label: 'Cost Saved', value: '$460K', highlight: true },
      ],
    },
    {
      to: '/covenant-monitoring',
      icon: Shield,
      title: 'Covenant Guardian',
      subtitle: '70% time reduction',
      color: 'amber',
      stats: [
        { label: 'High Risk Loans', value: highRiskLoans.length.toString(), highlight: true },
        { label: 'Predicted Breaches', value: '5' },
      ],
    },
    {
      to: '/esg-monitoring',
      icon: Leaf,
      title: 'ESG Veritas',
      subtitle: '96% faster reporting',
      color: 'green',
      stats: [
        { label: 'Green Loans', value: '47' },
        { label: 'High Risk Flags', value: esgFlags.length.toString(), highlight: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with gradient */}
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
              Portfolio Intelligence Hub
            </h1>
            <p className="text-lg text-white/60">
              Unified dashboard showing real-time insights across all loan operations
            </p>
          </div>
        </motion.div>

        {/* Top Metrics - Professional Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Portfolio Health", value: `${portfolioHealth}/100`, subtitle: "Overall score", color: "green" as const },
            { title: "Total Loans", value: totalLoans, subtitle: "actively monitored", icon: LayoutDashboard, color: "blue" as const },
            { title: "Portfolio Value", value: "$12.5B", subtitle: "total facility value", color: "slate" as const },
            { title: "Active Alerts", value: activeAlerts, subtitle: "require attention", color: "amber" as const },
          ].map((metric, idx) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <MetricCard
                title={metric.title}
                value={metric.value}
                subtitle={metric.subtitle}
                icon={metric.icon}
                color={metric.color}
                size="md"
              />
            </motion.div>
          ))}
        </div>

        {/* Module Status Cards - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {moduleCards.map((module, idx) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={module.to} className="group block h-full">
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <Card className="h-full hover:bg-white/10 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                              <Icon 
                                className="text-cyan-400"
                                size={28} 
                              />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold mb-1 text-white">
                                {module.title}
                              </CardTitle>
                              <CardDescription className="text-sm font-medium text-white/60">
                                {module.subtitle}
                              </CardDescription>
                            </div>
                          </div>
                          <ArrowRight className="text-white/40 group-hover:text-cyan-400 transition-colors flex-shrink-0" size={20} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                          {module.stats.map((stat, statIdx) => (
                            <motion.div
                              key={statIdx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1 + statIdx * 0.05 }}
                            >
                              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
                                {stat.label}
                              </p>
                              <p className={`
                                text-2xl font-bold
                                ${stat.highlight 
                                  ? 'text-cyan-400'
                                  : 'text-white'}
                              `}>
                                {stat.value}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Alerts - Professional Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold mb-1 text-white">
                    Recent Alerts & Actions Required
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Priority items requiring immediate attention
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold border border-red-500/30">
                    {activeAlerts} Active
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highRiskLoans.slice(0, 2).map((loan) => (
                  loan.alerts.map((alert, idx) => (
                    <AlertBadge
                      key={`${loan.loanId}-${idx}`}
                      severity={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}
                      message={`${loan.borrowerName}: ${alert.message}`}
                      timestamp={alert.triggeredDate}
                    />
                  ))
                ))}
                {esgFlags.slice(0, 1).map((loan) => (
                  <AlertBadge
                    key={loan.loanId}
                    severity="warning"
                    message={`${loan.borrowerName}: ${loan.greenwashingRisk.flags[0]}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ROI Summary - Glass Card with Accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
              className="glass-lg p-8 lg:p-12 border border-white/20"
        >
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-cyan-500/20 backdrop-blur-sm rounded-xl border border-cyan-500/30">
                <TrendingUp size={32} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1 text-white">Annual Impact Summary</h2>
                <p className="text-white/60">Quantified value delivered across all modules</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Time Savings', value: '1,850', unit: 'days annually', icon: TrendingDown },
                { label: 'Cost Reduction', value: '$3.2M', unit: 'per year', icon: TrendingDown },
                { label: 'Loss Prevention', value: '$15M+', unit: 'avoided defaults', icon: Shield },
                { label: 'Efficiency Gain', value: '85%', unit: 'average improvement', icon: TrendingUp },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={20} className="text-cyan-400" />
                      <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                        {metric.label}
                      </p>
                    </div>
                    <p className="text-4xl font-bold mb-1 text-white">{metric.value}</p>
                    <p className="text-sm text-white/50">{metric.unit}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
