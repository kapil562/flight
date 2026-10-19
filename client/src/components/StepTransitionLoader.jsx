import React from 'react';
import { motion } from 'motion/react';
import { Plane } from 'lucide-react';

export default function StepTransitionLoader({
  targetStep = 2
}) {
  let label = 'Please wait...';
  if (targetStep === 2) label = 'Loading seats...';
  else if (targetStep === 3) label = 'Loading review...';
  else if (targetStep === 4) label = 'Opening payment...';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs rounded-3xl select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl px-6 py-4 shadow-2xl border border-slate-100 flex flex-col items-center justify-center gap-2.5 min-w-[150px]"
      >
        {/* Simple elegant flight spinner */}
        <div className="relative w-11 h-11 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full border-3 border-sky-100 border-t-sky-600 animate-spin" />
          <Plane className="w-5 h-5 text-sky-600 absolute" />
        </div>

        {/* Clean simple label */}
        <span className="text-xs font-extrabold text-slate-800 tracking-tight">
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}
