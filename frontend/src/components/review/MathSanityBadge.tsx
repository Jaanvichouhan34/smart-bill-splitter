import React from 'react';
import { useBill } from '../../context/BillContext';
import { checkMathSanity } from '../../utils/math';
import { formatCurrency } from '../../utils/currency';
import { CheckCircle2, AlertTriangle, Wand2 } from 'lucide-react';

export const MathSanityBadge: React.FC = () => {
  const { billData, syncSubtotalFromItems } = useBill();

  if (!billData) return null;

  const sanity = checkMathSanity(billData);
  const currency = billData.currency || 'INR';

  if (sanity.isSubtotalValid) {
    return (
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>
            Sum of items ({formatCurrency(sanity.itemsSum, currency)}) matches Subtotal ({formatCurrency(sanity.subtotal, currency)}) ✓
          </span>
        </div>
        <span className="text-[11px] font-mono bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
          Math Verified
        </span>
      </div>
    );
  }

  const diffAbs = Math.abs(sanity.subtotalDiff);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 shadow-md animate-in fade-in">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
            Sum of items ({formatCurrency(sanity.itemsSum, currency)}) differs from Subtotal ({formatCurrency(sanity.subtotal, currency)}) by {formatCurrency(diffAbs, currency)} ⚠️
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-0.5">
            {sanity.subtotalDiff > 0
              ? `Items sum is ${formatCurrency(diffAbs, currency)} higher than recorded subtotal. Adjust an item price or update subtotal.`
              : `Items sum is ${formatCurrency(diffAbs, currency)} lower than recorded subtotal. Check if an item is missing.`}
          </p>
        </div>
      </div>

      <button
        onClick={syncSubtotalFromItems}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-sm flex-shrink-0 ml-auto sm:ml-0"
        title="Automatically set subtotal to equal the sum of item prices"
      >
        <Wand2 className="w-3.5 h-3.5" />
        <span>Sync Subtotal to {formatCurrency(sanity.itemsSum, currency)}</span>
      </button>
    </div>
  );
};
