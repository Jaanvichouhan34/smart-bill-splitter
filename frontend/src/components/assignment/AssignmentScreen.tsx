import React from 'react';
import { useBill } from '../../context/BillContext';
import { PeopleManager } from './PeopleManager';
import { ItemAssignmentList } from './ItemAssignmentList';
import { AssignmentStatusBar } from './AssignmentStatusBar';
import { formatCurrency } from '../../utils/currency';
import { ArrowLeft, Receipt, Users } from 'lucide-react';

export const AssignmentScreen: React.FC = () => {
  const { billData, setCurrentStep, participants, goToCalculation } = useBill();

  if (!billData) return null;

  const currency = billData.currency || 'INR';

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Review Bill</span>
            </button>

            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold">
              Step 3 of 4
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-2">
            Assign Items to People
          </h2>
          <p className="text-xs text-slate-400">
            Select who ordered or shared each line item. We’ll calculate proportional taxes and tips next.
          </p>
        </div>

        {/* Mini Bill Stats */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
          <div className="flex items-center gap-2.5 px-3 border-r border-slate-800">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bill Total</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400">
                {formatCurrency(billData.total, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Splitters</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-slate-200">
                {participants.length} added
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="space-y-6">
        {/* Section 1: Add People */}
        <PeopleManager />

        {/* Section 2: Item Assignment List */}
        <ItemAssignmentList />
      </div>

      {/* Sticky Bottom Validation Banner & Action */}
      <AssignmentStatusBar onContinue={goToCalculation} />
    </div>
  );
};
