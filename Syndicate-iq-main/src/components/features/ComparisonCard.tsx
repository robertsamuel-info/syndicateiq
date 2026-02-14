import { motion } from 'framer-motion';
import { X, Check, TrendingDown, TrendingUp } from 'lucide-react';

interface ComparisonData {
  time: string;
  cost: string;
}

interface ComparisonCardProps {
  traditional: ComparisonData;
  syndicateiq: ComparisonData;
  savings: {
    time: string;
    cost: string;
  };
}

export default function ComparisonCard({
  traditional,
  syndicateiq,
  savings
}: ComparisonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-lg p-8 relative overflow-hidden border border-white/20 hover:border-white/30 transition-all"
    >
      <div className="relative">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
          Traditional vs SyndicateIQ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Traditional */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-sm p-6 rounded-xl border border-white/15 hover:border-white/25 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <X className="text-red-400" size={20} />
              </div>
              <span className="font-bold text-white">Traditional</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Duration
                </p>
                <p className="text-xl font-bold text-white">{traditional.time}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Cost
                </p>
                <p className="text-xl font-bold text-white">{traditional.cost}</p>
              </div>
              <p className="text-sm text-white/60 pt-2 border-t border-white/10">
                Manual checks required
              </p>
            </div>
          </motion.div>

          {/* SyndicateIQ */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-sm p-6 rounded-xl border border-green-500/40 hover:border-green-500/50 relative overflow-hidden transition-all"
          >
            {/* Success badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                RECOMMENDED
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <Check className="text-green-400" size={20} />
              </div>
              <span className="font-bold text-white">SyndicateIQ</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Duration
                </p>
                <p className="text-xl font-bold text-white">{syndicateiq.time}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Cost
                </p>
                <p className="text-xl font-bold text-white">{syndicateiq.cost}</p>
              </div>
              <p className="text-sm text-white/60 pt-2 border-t border-white/10">
                Automated verification
              </p>
            </div>
          </motion.div>
        </div>

        {/* Savings Highlight */}
        <div className="glass-sm p-6 rounded-xl border border-green-500/40 hover:border-green-500/50 transition-all">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
                <TrendingDown className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Cost Savings
                </p>
                <p className="text-2xl font-bold text-green-400">{savings.cost}</p>
              </div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                <TrendingUp className="text-cyan-400" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Time Saved
                </p>
                <p className="text-2xl font-bold text-cyan-400">{savings.time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
