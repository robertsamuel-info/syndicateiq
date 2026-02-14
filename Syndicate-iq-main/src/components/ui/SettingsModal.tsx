import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Info, Shield, CheckCircle, Activity, FileText, Brain, Lock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl glass-lg border border-white/20 backdrop-blur-xl shadow-2xl"
            onClick={(e?: React.MouseEvent) => e?.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                  <Settings className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Platform Information</h2>
                  <p className="text-sm text-white/60 mt-0.5">SyndicateIQ Ultra Platform</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6 space-y-8">
              {/* Platform Overview */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Platform Overview</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  SyndicateIQ is an intelligent operating system designed for syndicated loan lifecycle management.
                  It unifies document intelligence, due diligence, covenant monitoring, and ESG verification into a single, real-time portfolio intelligence platform for banks, lenders, and institutional investors.
                </p>
                <p className="text-white/80 leading-relaxed mt-3">
                  The platform transforms complex loan documentation and compliance obligations into continuously updated, decision-ready insights.
                </p>
              </section>

              {/* Core Capabilities */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Core Capabilities</h3>
                </div>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">AI-Powered Document Intelligence</h4>
                    <p className="text-sm text-white/70">Automated extraction and normalization of loan agreements, amendments, and ESG disclosures.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">Real-Time Portfolio Monitoring</h4>
                    <p className="text-sm text-white/70">Continuous tracking of risk, covenants, and compliance across all active facilities.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">Due Diligence Automation</h4>
                    <p className="text-sm text-white/70">Accelerated pre-trade validation, risk assessment, and settlement readiness.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">ESG Veritas™ Verification</h4>
                    <p className="text-sm text-white/70">Independent ESG metric validation aligned with LMA Green Loan Principles and institutional reporting standards.</p>
                  </div>
                </div>
              </section>

              {/* Intelligence & Methodology */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Intelligence & Methodology</h3>
                </div>
                <p className="text-white/80 leading-relaxed mb-4">
                  SyndicateIQ applies a multi-layer intelligence framework:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Data Intelligence</p>
                      <p className="text-sm text-white/70">Structured extraction from unstructured documents and data feeds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Semantic Intelligence</p>
                      <p className="text-sm text-white/70">Context-aware interpretation of financial, legal, and ESG language</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Decision Intelligence</p>
                      <p className="text-sm text-white/70">Risk scoring, breach prediction, and compliance evaluation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Continuous Learning</p>
                      <p className="text-sm text-white/70">Feedback-driven refinement of extraction and scoring logic</p>
                    </div>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed mt-4">
                  All insights are generated with traceability and confidence scoring to support auditability and regulatory review.
                </p>
              </section>

              {/* Compliance & Standards Alignment */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Compliance & Standards Alignment</h3>
                </div>
                <div className="space-y-2 text-white/80">
                  <p>• Aligned with LMA Green Loan Principles</p>
                  <p>• Designed to support internal credit policies and regulatory oversight</p>
                  <p>• Transparent methodology to mitigate greenwashing and model risk</p>
                </div>
              </section>

              {/* Security & Governance */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Security & Governance</h3>
                </div>
                <div className="space-y-2 text-white/80">
                  <p>• Role-based access control</p>
                  <p>• Immutable audit trails for key actions</p>
                  <p>• Read-only historical records for compliance review</p>
                  <p>• Designed to meet enterprise security and governance expectations</p>
                </div>
              </section>

              {/* System Status */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">System Status</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-sm text-white/60 mb-1">Platform State</p>
                    <p className="font-semibold text-emerald-400">Operational</p>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-sm text-white/60 mb-1">Live Data Feeds</p>
                    <p className="font-semibold text-emerald-400">Active</p>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-sm text-white/60 mb-1">AI Intelligence Engine</p>
                    <p className="font-semibold text-emerald-400">Running</p>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-sm text-white/60 mb-1">Last Portfolio Sync</p>
                    <p className="font-semibold text-emerald-400">Real-time</p>
                  </div>
                </div>
              </section>

              {/* Version Information */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Version Information</h3>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60">Platform Version:</span>
                    <span className="font-semibold text-white">SyndicateIQ Ultra v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Build Type:</span>
                    <span className="font-semibold text-white">Hackathon Demonstration (Production-Ready Architecture)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Last Updated:</span>
                    <span className="font-semibold text-white">January 2026</span>
                  </div>
                </div>
              </section>

              {/* Disclaimers */}
              <section className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <h4 className="font-semibold text-amber-400 mb-2">Intended Use Disclaimer</h4>
                  <p className="text-sm text-white/80">
                    SyndicateIQ provides decision-support intelligence and does not replace formal legal, credit, or compliance approval processes. Final lending and investment decisions remain the responsibility of authorized institutional stakeholders.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="font-semibold text-blue-400 mb-2">Regulatory Note</h4>
                  <p className="text-sm text-white/80">
                    All ESG verification outputs are generated based on disclosed data and defined methodologies. SyndicateIQ does not certify sustainability outcomes but provides transparency and verification support aligned with market standards.
                  </p>
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
