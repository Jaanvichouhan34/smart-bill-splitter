import React, { useState } from 'react';
import { useBill } from '../../context/BillContext';
import { ReceiptViewer } from './ReceiptViewer';
import { LineItemsTable } from './LineItemsTable';
import { MathSanityBadge } from './MathSanityBadge';
import { BillSummaryCard } from './BillSummaryCard';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReviewScreen: React.FC = () => {
  const {
    billData,
    confirmAndContinue,
    startNewBill,
    resetToOriginalExtraction,
    hasUnsavedChanges,
    receiptImageUrl,
  } = useBill();

  const [isReceiptCollapsed, setIsReceiptCollapsed] = useState<boolean>(false);

  if (!billData) return null;

  const handleConfirm = () => {
    // Fire celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    confirmAndContinue();
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={startNewBill}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Upload New Photo</span>
            </button>

            {receiptImageUrl && (
              <button
                onClick={() => setIsReceiptCollapsed(!isReceiptCollapsed)}
                className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
              >
                {isReceiptCollapsed ? (
                  <>
                    <PanelLeftOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Show Receipt Photo</span>
                  </>
                ) : (
                  <>
                    <PanelLeftClose className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Collapse Receipt Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-2">
            Review & Edit Bill Details
          </h2>
          <p className="text-xs text-slate-400">
            Verify recognized dishes, quantities, and prices against the original check before splitting.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {hasUnsavedChanges && (
            <button
              onClick={resetToOriginalExtraction}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-medium border border-slate-700 transition-colors"
              title="Reset items and prices to the original AI extraction"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset OCR</span>
            </button>
          )}

          <button
            onClick={handleConfirm}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Confirm & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Review Workspace: Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Original Receipt Photo (Collapsible) */}
        {!isReceiptCollapsed && receiptImageUrl && (
          <div className="lg:col-span-5 sticky top-24">
            <ReceiptViewer
              isCollapsed={isReceiptCollapsed}
              onToggleCollapse={() => setIsReceiptCollapsed(true)}
            />
          </div>
        )}

        {/* Right Column (or Full Width if collapsed): Line Items & Financial Summary */}
        <div className={`${!isReceiptCollapsed && receiptImageUrl ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
          
          {/* Live Math Sanity Badge */}
          <MathSanityBadge />

          {/* Editable Line Items Table */}
          <LineItemsTable />

          {/* Summary & Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <BillSummaryCard />
          </div>

          {/* Bottom Confirmation Card */}
          <div className="p-4 sm:p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Ready to Split?</h4>
                <p className="text-xs text-slate-400">
                  Once your line items match the check, continue to assign items to group members.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Continue to Phase 3 (People & Assignment)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
