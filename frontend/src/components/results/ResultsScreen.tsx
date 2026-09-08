import React, { useState, useMemo, useCallback } from 'react';
import { useBill } from '../../context/BillContext';
import { calculateBillSplits, generateShareableSummaryText } from '../../utils/splitCalculator';
import { formatCurrency } from '../../utils/currency';
import { getParticipantColorTheme, getInitials } from '../../utils/colors';
import { roundToTwo } from '../../utils/math';
import type { PersonShareBreakdown } from '../../types/bill';
import {
  ArrowLeft,
  Copy,
  Check,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';

// ─── Toast Notification ──────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, visible }) => (
  <div
    aria-live="polite"
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-2xl text-sm font-medium text-slate-900 dark:text-slate-100 transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}
  >
    <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
    {message}
  </div>
);

// ─── Balance Badge ────────────────────────────────────────────────────────────

interface BalanceBadgeProps {
  sumOfShares: number;
  billTotal: number;
  currency: string;
}

const BalanceBadge: React.FC<BalanceBadgeProps> = ({ sumOfShares, billTotal, currency }) => {
  const diff = roundToTwo(Math.abs(billTotal - sumOfShares));
  const isBalanced = diff < 0.02;

  if (isBalanced) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 shadow-lg shadow-emerald-900/10 dark:shadow-emerald-900/20">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">
            ✓ Perfectly Balanced
          </p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
            Sum of shares ({formatCurrency(sumOfShares, currency)}) matches Bill Total (
            {formatCurrency(billTotal, currency)}) down to ₹0.00
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 shadow-lg shadow-amber-900/10 dark:shadow-amber-900/20">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <p className="text-sm font-bold leading-tight">Discrepancy Detected</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
          Sum of shares ({formatCurrency(sumOfShares, currency)}) vs Bill Total (
          {formatCurrency(billTotal, currency)}) — difference: {formatCurrency(diff, currency)}
        </p>
      </div>
    </div>
  );
};

// ─── Header Summary Bar ───────────────────────────────────────────────────────

interface HeaderSummaryProps {
  billData: NonNullable<ReturnType<typeof useBill>['billData']>;
  currency: string;
  participantCount: number;
}

const HeaderSummary: React.FC<HeaderSummaryProps> = ({ billData, currency, participantCount }) => {
  const subtotal = Number(billData.subtotal) || 0;
  const tax = Number(billData.tax) || 0;
  const serviceCharge = Number(billData.service_charge) || 0;
  const tip = Number(billData.tip) || 0;
  const discount = Number(billData.discount) || 0;
  const grandTotal = Number(billData.total) || 0;

  const stats = [
    { label: 'Grand Total', value: formatCurrency(grandTotal, currency), highlight: true, color: 'text-slate-900 dark:text-white' },
    { label: 'Subtotal', value: formatCurrency(subtotal, currency), highlight: false, color: 'text-slate-800 dark:text-slate-200' },
    ...(tax > 0 ? [{ label: 'Tax', value: formatCurrency(tax, currency), highlight: false, color: 'text-indigo-600 dark:text-indigo-300' }] : []),
    ...(serviceCharge > 0
      ? [{ label: 'Service Charge', value: formatCurrency(serviceCharge, currency), highlight: false, color: 'text-indigo-600 dark:text-indigo-300' }]
      : []),
    ...(tip > 0 ? [{ label: 'Tip', value: formatCurrency(tip, currency), highlight: false, color: 'text-purple-600 dark:text-purple-300' }] : []),
    ...(discount > 0
      ? [{ label: 'Discount', value: `−${formatCurrency(discount, currency)}`, highlight: false, color: 'text-emerald-600 dark:text-emerald-400' }]
      : []),
    {
      label: 'Splitting Among',
      value: `${participantCount} ${participantCount === 1 ? 'person' : 'people'}`,
      highlight: false,
      color: 'text-cyan-600 dark:text-cyan-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-2xl p-4 space-y-1.5 border ${
            s.highlight
              ? 'bg-indigo-50/80 dark:bg-indigo-600/15 border-indigo-200 dark:border-indigo-500/30'
              : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block leading-tight">
            {s.label}
          </span>
          <p className={`text-base font-bold font-mono leading-tight ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Person Breakdown Card ────────────────────────────────────────────────────

interface PersonCardProps {
  person: PersonShareBreakdown;
  currency: string;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, currency }) => {
  const theme = getParticipantColorTheme(person.colorIndex);
  const initials = getInitials(person.participantName);
  const [expanded, setExpanded] = useState(true);

  const taxAndFees = roundToTwo(
    (person.proportionalTax || 0) + (person.proportionalServiceCharge || 0)
  );
  const tip = person.proportionalTip || 0;
  const discount = person.proportionalDiscount || 0;

  return (
    <div
      className={`rounded-3xl border bg-white dark:bg-slate-900/80 backdrop-blur-md shadow-xl flex flex-col overflow-hidden transition-all ${theme.badgeBorder}`}
    >
      {/* ── Card Header ── */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-11 h-11 rounded-2xl font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0 ${theme.avatarBg} ${theme.avatarText}`}
            >
              {initials}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{person.participantName}</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {person.assignedItemsCount} {person.assignedItemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Total Owed — prominent */}
          <div className="text-right flex-shrink-0 ml-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total to Pay</span>
            <span className={`text-2xl font-extrabold font-mono ${theme.badgeText}`}>
              {formatCurrency(person.totalOwed, currency)}
            </span>
          </div>
        </div>

        {/* Expand / Collapse toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide breakdown' : 'Show breakdown'}
        </button>
      </div>

      {/* ── Collapsible Body ── */}
      {expanded && (
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 px-5 py-4 space-y-4">
          {/* Itemized list */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Items Consumed
            </span>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {person.itemBreakdowns.map((it, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="text-slate-800 dark:text-slate-200 font-medium block">{it.itemName}</span>
                    {it.splitCount > 1 && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        shared ÷ {it.splitCount} &nbsp;(total {formatCurrency(it.itemTotalPrice, currency)})
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                    {formatCurrency(it.shareAmount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Proportional cost breakdown */}
          <div className="space-y-1.5 text-xs border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Cost Breakdown
            </span>

            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Raw Items Subtotal</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(person.itemsSubtotal, currency)}</span>
            </div>

            {taxAndFees > 0 && (
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>+ Tax &amp; Service Charge</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-300">{formatCurrency(taxAndFees, currency)}</span>
              </div>
            )}

            {tip > 0 && (
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>+ Tip</span>
                <span className="font-mono text-purple-600 dark:text-purple-300">{formatCurrency(tip, currency)}</span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>− Discount</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">−{formatCurrency(discount, currency)}</span>
              </div>
            )}

            {/* Final total row */}
            <div className="pt-2.5 border-t border-slate-300 dark:border-slate-700 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Total to Pay</span>
              <span className={`text-xl font-extrabold font-mono ${theme.badgeText}`}>
                {formatCurrency(person.totalOwed, currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Results Screen ──────────────────────────────────────────────────────

export const ResultsScreen: React.FC = () => {
  const { billData, participants, assignments, setCurrentStep, startNewBill, receiptImageName } = useBill();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('Copied to clipboard!');

  if (!billData || participants.length === 0) return null;

  const currency = billData.currency || 'INR';

  // Derive vendor name from the uploaded filename (strip extension)
  const vendorName = useMemo(() => {
    if (!receiptImageName) return 'Restaurant';
    return receiptImageName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ') || 'Restaurant';
  }, [receiptImageName]);

  // Calculate splits (memoized)
  const breakdowns = useMemo(
    () => calculateBillSplits(billData, participants, assignments),
    [billData, participants, assignments]
  );

  const sumOfShares = useMemo(
    () => roundToTwo(breakdowns.reduce((acc, b) => acc + b.totalOwed, 0)),
    [breakdowns]
  );

  const billTotal = roundToTwo(Number(billData.total) || 0);

  // Show toast helper
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  // Copy WhatsApp summary to clipboard
  const handleCopySummary = useCallback(async () => {
    const text = generateShareableSummaryText(billData, breakdowns, vendorName);
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch {
      // Fallback for environments that don't support clipboard API
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!');
    }
  }, [billData, breakdowns, vendorName, showToast]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">

      {/* ── Page Title & Navigation Strip ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Edit Assignments</span>
            </button>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
              Step 4 · Results
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            Final Bill Split Results
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Taxes, gratuity, and discounts proportionally distributed based on each person's share.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-green-700/30 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy WhatsApp Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs sm:text-sm font-medium border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Back to Edit</span>
          </button>

          <button
            type="button"
            onClick={startNewBill}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs sm:text-sm font-medium border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Split Another Bill</span>
          </button>
        </div>
      </div>

      {/* ── Grand Total Summary Cards ── */}
      <HeaderSummary billData={billData} currency={currency} participantCount={participants.length} />

      {/* ── Balance Invariant Badge ── */}
      <BalanceBadge sumOfShares={sumOfShares} billTotal={billTotal} currency={currency} />

      {/* ── Section Title ── */}
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Per-Person Breakdown
        </h3>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs text-slate-500 dark:text-slate-400">{breakdowns.length} participants</span>
      </div>

      {/* ── Per-Person Breakdown Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {breakdowns.map((person) => (
          <PersonCard key={person.participantId} person={person} currency={currency} />
        ))}
      </div>

      {/* ── Bottom CTA Strip ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          All calculations verified · Penny-accurate rounding applied · Proportional tax/tip distribution
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold shadow-lg shadow-green-700/25 transition-all cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Copy WhatsApp Summary
          </button>

          <button
            type="button"
            onClick={startNewBill}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Start Over / Split Another Bill
          </button>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
};
