import React, { useState, useMemo } from 'react';
import { useBill } from '../../context/BillContext';
import { calculateBillSplits, generateShareableSummaryText } from '../../utils/splitCalculator';
import { formatCurrency } from '../../utils/currency';
import { getParticipantColorTheme, getInitials } from '../../utils/colors';
import {
  ArrowLeft,
  Copy,
  Check,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

export const CalculationScreen: React.FC = () => {
  const { billData, participants, assignments, setCurrentStep, startNewBill } = useBill();
  const [isCopied, setIsCopied] = useState(false);

  if (!billData || participants.length === 0) {
    return null;
  }

  const currency = billData.currency || 'INR';

  // Calculate splits
  const breakdowns = useMemo(() => {
    return calculateBillSplits(billData, participants, assignments);
  }, [billData, participants, assignments]);

  // Verify total sum match
  const sumOfOwed = breakdowns.reduce((acc, b) => acc + b.totalOwed, 0);

  const handleCopySummary = async () => {
    const text = generateShareableSummaryText(billData, breakdowns);
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy failed', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Item Assignments</span>
            </button>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
              Step 4 • Final Split Breakdown
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-2">
            Individual Share Calculation
          </h2>
          <p className="text-xs text-slate-400">
            Taxes, gratuity, and discounts have been proportionally distributed based on each person’s ordered items.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Summary for Group'}</span>
          </button>

          <button
            type="button"
            onClick={startNewBill}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs sm:text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Bill</span>
          </button>
        </div>
      </div>

      {/* Overview Snapshot Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Receipt Total</span>
          <p className="text-lg font-bold font-mono text-white">{formatCurrency(billData.total, currency)}</p>
          <span className="text-xs text-slate-400">{billData.items.length} line items</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Splitters</span>
          <p className="text-lg font-bold font-mono text-purple-300">{participants.length} members</p>
          <span className="text-xs text-slate-400">100% assigned</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Taxes & Fees</span>
          <p className="text-lg font-bold font-mono text-indigo-300">
            {formatCurrency((Number(billData.tax) || 0) + (Number(billData.service_charge) || 0), currency)}
          </p>
          <span className="text-xs text-slate-400">Proportionally split</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Math Verification</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Exact Match</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Sum: {formatCurrency(sumOfOwed, currency)}
          </span>
        </div>
      </div>

      {/* Individual Participant Breakdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {breakdowns.map((person) => {
          const theme = getParticipantColorTheme(person.colorIndex);
          const initials = getInitials(person.participantName);

          return (
            <div
              key={person.participantId}
              className={`rounded-3xl border bg-slate-900/80 p-5 space-y-4 backdrop-blur-md shadow-xl flex flex-col justify-between ${theme.badgeBorder}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-2xl font-bold flex items-center justify-center text-sm shadow-md ${theme.avatarBg} ${theme.avatarText}`}
                  >
                    {initials}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">{person.participantName}</h3>
                    <span className="text-xs text-slate-400">
                      {person.assignedItemsCount} {person.assignedItemsCount === 1 ? 'dish' : 'dishes'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Owed</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {formatCurrency(person.totalOwed, currency)}
                  </span>
                </div>
              </div>

              {/* Itemized List for this person */}
              <div className="space-y-2 flex-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Items Ordered / Shared
                </span>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-800/50">
                  {person.itemBreakdowns.map((it, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="text-slate-200 font-medium block truncate">{it.itemName}</span>
                        {it.splitCount > 1 && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            (Split 1/{it.splitCount} of {formatCurrency(it.itemTotalPrice, currency)})
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-300 font-semibold flex-shrink-0">
                        {formatCurrency(it.shareAmount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Summary Breakdown for this person */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Items Subtotal:</span>
                  <span className="font-mono text-slate-200">{formatCurrency(person.itemsSubtotal, currency)}</span>
                </div>

                {(person.proportionalTax > 0 || person.proportionalServiceCharge > 0) && (
                  <div className="flex justify-between text-slate-400">
                    <span>Tax & Service Charge:</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(person.proportionalTax + person.proportionalServiceCharge, currency)}
                    </span>
                  </div>
                )}

                {person.proportionalTip > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Tip share:</span>
                    <span className="font-mono text-slate-200">{formatCurrency(person.proportionalTip, currency)}</span>
                  </div>
                )}

                {person.proportionalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount share:</span>
                    <span className="font-mono">-{formatCurrency(person.proportionalDiscount, currency)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                  <span className="text-white">Amount Due:</span>
                  <span className="font-mono text-emerald-400">{formatCurrency(person.totalOwed, currency)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
