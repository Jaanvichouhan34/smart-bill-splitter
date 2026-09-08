import React from 'react';
import { useBill } from '../../context/BillContext';
import { getCurrencySymbol, formatCurrency, formatConfidence } from '../../utils/currency';
import { checkMathSanity, roundToTwo } from '../../utils/math';
import { Calculator, RefreshCw, Sparkles, Tag } from 'lucide-react';

export const BillSummaryCard: React.FC = () => {
  const { billData, updateSummary } = useBill();

  if (!billData) return null;

  const sanity = checkMathSanity(billData);
  const currencySymbol = getCurrencySymbol(billData.currency);

  const handleFieldChange = (field: keyof typeof billData, valueStr: string) => {
    const val = parseFloat(valueStr);
    updateSummary({ [field]: isNaN(val) ? 0 : val });
  };

  const handleRecalculateGrandTotal = () => {
    const subtotal = Number(billData.subtotal) || 0;
    const tax = Number(billData.tax) || 0;
    const serviceCharge = Number(billData.service_charge) || 0;
    const tip = Number(billData.tip) || 0;
    const discount = Number(billData.discount) || 0;
    const newTotal = roundToTwo(subtotal + tax + serviceCharge + tip - discount);
    updateSummary({ total: newTotal });
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Bill Financial Summary
          </h3>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-slate-500 dark:text-slate-400">Currency:</label>
          <select
            value={billData.currency || 'INR'}
            onChange={(e) => updateSummary({ currency: e.target.value })}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (CA$)</option>
            <option value="AUD">AUD (AU$)</option>
            <option value="AED">AED</option>
          </select>
        </div>
      </div>

      {/* Editable summary fields */}
      <div className="space-y-2.5 text-xs sm:text-sm">
        
        {/* Subtotal */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-700 dark:text-slate-300 font-medium">Subtotal</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{currencySymbol}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={billData.subtotal === 0 ? '' : billData.subtotal}
              onChange={(e) => handleFieldChange('subtotal', e.target.value)}
              placeholder="0.00"
              className="w-28 text-right bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span>Taxes (GST / VAT)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{currencySymbol}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={billData.tax === 0 ? '' : billData.tax}
              onChange={(e) => handleFieldChange('tax', e.target.value)}
              placeholder="0.00"
              className="w-28 text-right bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Service Charge */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-600 dark:text-slate-400">Service Charge / Packaging</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{currencySymbol}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={billData.service_charge === 0 ? '' : billData.service_charge}
              onChange={(e) => handleFieldChange('service_charge', e.target.value)}
              placeholder="0.00"
              className="w-28 text-right bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tip / Gratuity */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-600 dark:text-slate-400">Tip / Gratuity</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{currencySymbol}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={billData.tip === 0 ? '' : billData.tip}
              onChange={(e) => handleFieldChange('tip', e.target.value)}
              placeholder="0.00"
              className="w-28 text-right bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Discount (Deducted) */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Discount (Off)
          </span>
          <div className="flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-500 font-mono text-xs">- {currencySymbol}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={billData.discount === 0 ? '' : billData.discount}
              onChange={(e) => handleFieldChange('discount', e.target.value)}
              placeholder="0.00"
              className="w-28 text-right bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-emerald-600 dark:text-emerald-300 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Grand Total Divider */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white block">Grand Total</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Final bill amount</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-sm">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={billData.total === 0 ? '' : billData.total}
                onChange={(e) => handleFieldChange('total', e.target.value)}
                placeholder="0.00"
                className="w-32 text-right bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recalculate helper / Sanity formula indicator */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
        {!sanity.isTotalValid ? (
          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Formula Discrepancy</span>
              <button
                onClick={handleRecalculateGrandTotal}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Auto-Fix Total
              </button>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/80">
              Subtotal + Taxes + Fees - Discounts calculates to {formatCurrency(sanity.expectedTotal, billData.currency)} (Differs by {formatCurrency(Math.abs(sanity.totalDiff), billData.currency)}).
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span>Formula: Subtotal + Tax + Svc + Tip - Disc</span>
            <button
              onClick={handleRecalculateGrandTotal}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
              title="Recalculate grand total from components"
            >
              <RefreshCw className="w-3 h-3" /> Recalculate Total
            </button>
          </div>
        )}
      </div>

      {/* Overall Confidence Meter */}
      <div className="p-3 bg-slate-100/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Overall AI Accuracy</span>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-200 dark:border-indigo-500/20">
          {formatConfidence(billData.confidence_overall)}
        </span>
      </div>
    </div>
  );
};
