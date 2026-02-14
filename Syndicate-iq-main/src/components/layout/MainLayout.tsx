import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white relative overflow-hidden">
      {/* Floating glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Navbar />
      <div className="flex h-[calc(100vh-73px)] relative z-10">
        <Sidebar />
        <div className="flex-1 overflow-y-auto relative pl-4">
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-full p-6"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
