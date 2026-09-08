import React, { useState, useEffect } from 'react';
import { useBill } from '../../context/BillContext';
import { Sparkles, Check, Loader2, Brain, Cpu, ShieldCheck } from 'lucide-react';

export const ExtractionLoader: React.FC = () => {
  const { receiptImageUrl, configuredProvider } = useBill();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps = [
    { title: 'Uploading high-resolution receipt photo', icon: Loader2 },
    { title: `Processing image with ${configuredProvider.toUpperCase()} Vision LLM`, icon: Cpu },
    { title: 'Parsing dish names, quantities, and line item prices', icon: Brain },
    { title: 'Validating totals, taxes, and OCR confidence scores', icon: ShieldCheck },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStepIndex(1), 700);
    const timer2 = setTimeout(() => setActiveStepIndex(2), 2200);
    const timer3 = setTimeout(() => setActiveStepIndex(3), 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col items-center text-center space-y-6">
        
        {/* Animated receipt with laser scan beam */}
        <div className="relative w-40 h-56 sm:w-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-500/20 flex-shrink-0">
          {receiptImageUrl ? (
            <img
              src={receiptImageUrl}
              alt="Scanning bill"
              className="w-full h-full object-cover filter contrast-105 opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
              <div className="space-y-2 w-full">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          )}

          {/* Scanner Beam Animation */}
          <div className="scanner-line" />

          {/* Glowing scanner overlay */}
          <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none mix-blend-overlay" />
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> AI Vision In Progress
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Reading & Extracting Bill Items
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Our AI model is reading each line item, quantity, tax breakdown, and confidence score from your photo.
          </p>
        </div>

        {/* Live Step Checklist */}
        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3 text-left">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? 'text-indigo-600 dark:text-indigo-300 font-medium'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white animate-spin'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px]">{idx + 1}</span>
                  )}
                </div>
                <span className="flex-1 truncate">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Skeleton lines preview */}
        <div className="w-full max-w-md space-y-2 pt-2">
          <div className="h-4 bg-slate-200/80 dark:bg-slate-800/60 rounded-full animate-pulse w-full" />
          <div className="h-4 bg-slate-200/60 dark:bg-slate-800/40 rounded-full animate-pulse w-4/5 mx-auto" />
        </div>
      </div>
    </div>
  );
};
