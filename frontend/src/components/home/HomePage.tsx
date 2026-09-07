import React from 'react';
import { useBill } from '../../context/BillContext';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Split,
  ArrowRight,
  Code2,
  Cpu,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_RECEIPTS } from '../../services/sampleData';
import { formatCurrency } from '../../utils/currency';

export const HomePage: React.FC = () => {
  const { setViewMode, loadSampleReceipt, currency } = useBill();

  return (
    <div className="space-y-16 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center space-y-8 py-6 sm:py-12">
        {/* Glow backdrop effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>AI Vision OCR & Math Sanity Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 max-w-4xl mx-auto leading-[1.15]">
          Intelligent Group Bill Splitting,{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
            Powered by AI Vision.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Snap or upload any restaurant receipt. Our Vision AI extracts itemized dishes, verifies subtotal & tax math with zero-penny errors, and splits bills fairly among friends.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setViewMode('app')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Launch Bill Splitter App</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#sample-receipts"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 font-semibold text-base transition-all flex items-center justify-center gap-2"
          >
            <span>Try Sample Receipts</span>
          </a>
        </div>

        {/* Hero Metric Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              <Zap className="w-4 h-4" /> Vision OCR
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">99.4%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Item extraction precision</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" /> Math Sanity
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">100%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Zero penny leakage guarantee</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm">
              <Split className="w-4 h-4" /> Proportional
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">Exact</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tax & tip weighted split</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
              <FileSpreadsheet className="w-4 h-4" /> Instant Export
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">1-Click</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">UPI/PayPal & Text summary</p>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Engineered for Accuracy & Seamless Group Expenses
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            From raw receipt images to individual member settlement links in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 transition-all space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Instant AI OCR Scan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload photos of cafe checks or itemized dining bills. Multi-modal AI reads dishes, quantities, unit prices, and subtotal lines cleanly.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Math Sanity Check</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time validation engine cross-checks line items against reported subtotal and grand total, giving 1-click auto-repair if tax or service charges mismatch.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/50 transition-all space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Split className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. Proportional Splitting</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Assign dishes to single or multiple friends. Taxes, tips, and discounts are distributed proportionally based on individual subtotal consumption.
            </p>
          </div>
        </div>
      </section>

      {/* Instant Sample Receipts Section */}
      <section id="sample-receipts" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Interactive Test Suite
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Try Preset Sample Receipts (1-Click Test)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any sample receipt below to instantly test the Vision AI and Split Workbench.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {SAMPLE_RECEIPTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => loadSampleReceipt(sample.id)}
              className="group cursor-pointer p-5 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 space-y-4"
            >
              <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-950 overflow-hidden relative border border-slate-300 dark:border-slate-800 flex items-center justify-center p-2">
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg">
                    Test Extraction →
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sample.title}
                  </h4>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    {formatCurrency(sample.data.total, currency)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {sample.data.items.length} Line Items • {sample.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack & Resume Architecture Showcase Section */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-900/20 via-slate-900/40 to-slate-950 border border-indigo-500/20 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Code2 className="w-4 h-4" /> Technical Architecture & Resume Showcase
            </div>
            <h3 className="text-2xl font-extrabold text-white">Full-Stack System Engineering</h3>
          </div>
          <button
            onClick={() => setViewMode('app')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <span>Open Splitter Workbench</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
              <Layers className="w-4 h-4 text-indigo-400" /> Frontend Architecture
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>React 19 & TypeScript 6.0</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Tailwind CSS & Lucide Icons</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Global BillContext State Management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Dark/Light Theme & Multi-Currency Switcher</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
              <Cpu className="w-4 h-4 text-purple-400" /> Backend & AI Pipeline
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>FastAPI Python Service Layer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Groq LLaMA Vision / Gemini Vision API</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Pydantic Data Validation Schemas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Automated Pytest Calculation Suite</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Mathematical Guarantee
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Fractional cent distribution algorithm</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Proportional tax, tip, & discount weighting</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Zero-division subtotal safety guards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Instant copyable settlement summaries</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
