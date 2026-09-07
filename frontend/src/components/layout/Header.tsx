import React from 'react';
import { useBill } from '../../context/BillContext';
import {
  Sparkles,
  Receipt,
  CheckCircle,
  ArrowRight,
  WifiOff,
  Moon,
  Sun,
  Home,
  Wand2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentStep,
    isBackendOnline,
    configuredProvider,
    setCurrentStep,
    billData,
    isAllItemsAssigned,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    viewMode,
    setViewMode,
  } = useBill();

  const steps = [
    { number: 1, label: 'Upload Receipt', desc: 'Scan or drag photo' },
    { number: 2, label: 'Review & Edit', desc: 'Verify items & math' },
    { number: 3, label: 'People & Items', desc: 'Assign line items' },
    { number: 5, label: 'Results', desc: 'Final share breakdown' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-400 dark:bg-clip-text">
                  Smart Splitter
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 rounded-full hidden sm:flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Splitter
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Receipt Vision & Intelligent Group Bill Splitting
              </p>
            </div>
          </div>

          {/* Stepper — only in app mode */}
          {viewMode === 'app' && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950/60 p-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80">
              {steps.map((step, idx) => {
                const isActive = currentStep === step.number;
                const isPast =
                  (step.number === 1 && currentStep > 1) ||
                  (step.number === 2 && currentStep > 2) ||
                  (step.number === 3 && currentStep > 3) ||
                  (step.number === 5 && false);
                const isClickable =
                  step.number === 1 ||
                  (step.number === 2 && billData !== null) ||
                  (step.number === 3 && billData !== null) ||
                  (step.number === 5 && isAllItemsAssigned);

                return (
                  <React.Fragment key={step.number}>
                    {idx > 0 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 mx-1 flex-shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => isClickable && setCurrentStep(step.number as 1 | 2 | 3 | 5)}
                      disabled={!isClickable}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : isPast
                          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer'
                          : isClickable
                          ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer'
                          : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive
                            ? 'bg-white text-indigo-700'
                            : isPast
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
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
          )}

          {/* Right-side Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Home / App toggle button */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'home' ? 'app' : 'home')}
              title={viewMode === 'home' ? 'Open Splitter App' : 'Back to Home'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
                border-slate-200 dark:border-slate-700
                hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              {viewMode === 'home' ? (
                <><Wand2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">App</span></>
              ) : (
                <><Home className="w-3.5 h-3.5" /><span className="hidden sm:inline">Home</span></>
              )}
            </button>

            {/* Currency Toggle */}
            <button
              type="button"
              onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
              title="Toggle currency between INR and USD"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
                border-slate-200 dark:border-slate-700
                hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-mono"
            >
              {currency === 'INR' ? '₹ INR' : '$ USD'}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer
                bg-slate-100 dark:bg-slate-800
                border-slate-200 dark:border-slate-700
                hover:bg-slate-200 dark:hover:bg-slate-700
                text-slate-600 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Backend Status */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
                isBackendOnline === true
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                  : isBackendOnline === false
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
              title={
                isBackendOnline
                  ? `Vision API Active (${configuredProvider.toUpperCase()})`
                  : 'Backend server not detected (demo fallback mode ready)'
              }
            >
              {isBackendOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="capitalize font-mono text-[11px]">{configuredProvider} AI</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-500" />
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
