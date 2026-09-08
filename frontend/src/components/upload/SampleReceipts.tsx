import React from 'react';
import { useBill } from '../../context/BillContext';
import { SAMPLE_RECEIPTS } from '../../services/sampleData';
import { Coffee, UtensilsCrossed, ShoppingBag, Sparkles } from 'lucide-react';

export const SampleReceipts: React.FC = () => {
  const { loadSampleReceipt, status } = useBill();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cafe':
        return <Coffee className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'restaurant':
        return <UtensilsCrossed className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
      case 'grocery':
        return <ShoppingBag className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          Or try with instant sample receipts
        </h4>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">1-Click Test Extraction</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {SAMPLE_RECEIPTS.map((sample) => (
          <button
            key={sample.id}
            onClick={() => loadSampleReceipt(sample.id)}
            disabled={status === 'processing'}
            className="group relative flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-lg hover:shadow-indigo-500/10 text-left transition-all duration-200 disabled:opacity-50"
          >
            {/* Thumbnail mini preview */}
            <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={sample.imageUrl}
                alt={sample.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                {getCategoryIcon(sample.category)}
                <span className="truncate">{sample.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                {sample.subtitle}
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Load & Test</span> →
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
