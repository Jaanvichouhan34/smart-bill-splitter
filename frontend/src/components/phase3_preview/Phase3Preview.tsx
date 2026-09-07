import React from 'react';
import { useBill } from '../../context/BillContext';
import { formatCurrency } from '../../utils/currency';
import {
  Users,
  CheckCircle2,
  ArrowLeft,
  Receipt,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

export const Phase3Preview: React.FC = () => {
  const { billData, setCurrentStep, startNewBill } = useBill();

  if (!billData) return null;

  const currency = billData.currency || 'INR';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-indigo-950/60 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            Phase 2 Verified & Saved
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bill Extracted & Reviewed Successfully!
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            All {billData.items.length} line items, prices, taxes, and totals have been validated and saved to state.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Review & Edit Table</span>
          </button>

          <button
            onClick={startNewBill}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Another Receipt</span>
          </button>
        </div>
      </div>

      {/* Structured Bill Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Bill Snapshot</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Items:</span>
              <span className="text-slate-200 font-semibold">{billData.items.length} items</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Subtotal:</span>
              <span className="text-slate-200 font-mono font-medium">{formatCurrency(billData.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Taxes & Fees:</span>
              <span className="text-slate-200 font-mono">
                {formatCurrency((Number(billData.tax) || 0) + (Number(billData.service_charge) || 0), currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Tip / Gratuity:</span>
              <span className="text-slate-200 font-mono">{formatCurrency(billData.tip, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
              <span className="text-white font-bold">Grand Total:</span>
              <span className="text-emerald-400 font-mono font-bold">{formatCurrency(billData.total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Phase 3 Coming Soon Preview */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Next Step: Phase 3 • People & Assignment</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              Interactive Member Assignment & Proportional Splitting
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In Phase 3, you will be able to add group members (e.g. Alice, Bob, Charlie), assign dishes directly to individuals or shared groups, and let the system proportionally distribute taxes, service charges, tips, and discounts.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Phase 2 extraction data is ready in memory & localStorage.</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Ready for Phase 3
            </span>
          </div>
        </div>
      </div>

      {/* Itemized List Review */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Validated Items Payload
        </h4>
        <div className="divide-y divide-slate-800/60">
          {billData.items.map((item, idx) => (
            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono w-5">{idx + 1}.</span>
                <span className="text-slate-200 font-medium">{item.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">({item.quantity}x @ {formatCurrency(item.unit_price, currency)})</span>
              </div>
              <span className="text-indigo-300 font-mono font-semibold">
                {formatCurrency(item.total_price, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
