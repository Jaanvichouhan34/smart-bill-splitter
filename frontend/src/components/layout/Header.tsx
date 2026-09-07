import React from 'react';
import { useBill } from '../../context/BillContext';
import { Sparkles, Receipt, CheckCircle, ArrowRight, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentStep, isBackendOnline, configuredProvider, setCurrentStep, billData, isAllItemsAssigned } = useBill();

  const steps = [
    { number: 1, label: 'Upload Receipt', desc: 'Scan or drag photo' },
    { number: 2, label: 'Review & Edit', desc: 'Verify items & math' },
    { number: 3, label: 'People & Items', desc: 'Assign line items' },
    { number: 5, label: 'Results', desc: 'Final share breakdown' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  DigiValet
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Splitter
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Receipt Vision & Intelligent Group Bill Splitting
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-full border border-slate-800/80">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.number;
              // Step is "past" when we've moved beyond it
              const isPast =
                (step.number === 1 && currentStep > 1) ||
                (step.number === 2 && currentStep > 2) ||
                (step.number === 3 && currentStep > 3) ||
                (step.number === 5 && false); // Results is never "past"
              const isClickable =
                step.number === 1 ||
                (step.number === 2 && billData !== null) ||
                (step.number === 3 && billData !== null) ||
                (step.number === 5 && isAllItemsAssigned);

              return (
                <React.Fragment key={step.number}>
                  {idx > 0 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 mx-1 flex-shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => isClickable && setCurrentStep(step.number as 1 | 2 | 3 | 5)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : isPast
                        ? 'text-emerald-400 hover:bg-slate-800 cursor-pointer'
                        : isClickable
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : isPast
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPast ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* System status pill */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${
                isBackendOnline === true
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                  : isBackendOnline === false
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={
                isBackendOnline
                  ? `Vision API Active (${configuredProvider.toUpperCase()})`
                  : 'Backend server not detected (demo fallback mode ready)'
              }
            >
              {isBackendOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="capitalize font-mono text-[11px]">{configuredProvider} AI</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px]">Demo Mode</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
