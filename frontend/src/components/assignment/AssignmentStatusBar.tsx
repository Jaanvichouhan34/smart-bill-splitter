import React from 'react';
import { useBill } from '../../context/BillContext';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssignmentStatusBarProps {
  onContinue: () => void;
}

export const AssignmentStatusBar: React.FC<AssignmentStatusBarProps> = ({ onContinue }) => {
  const { billData, participants, unassignedCount, isAllItemsAssigned } = useBill();

  if (!billData) return null;

  const totalItems = billData.items.length;
  const assignedItemsCount = totalItems - unassignedCount;
  const progressPercent = totalItems > 0 ? Math.round((assignedItemsCount / totalItems) * 100) : 0;

  const handleProceed = () => {
    if (!isAllItemsAssigned) return;

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.7 },
    });

    onContinue();
  };

  // Determine helper message if disabled
  let disabledReason = '';
  if (participants.length === 0) {
    disabledReason = 'Please add at least 1 person to assign items.';
  } else if (participants.length === 1) {
    disabledReason = 'Add at least 2 people to split between multiple members.';
  } else if (unassignedCount > 0) {
    disabledReason = `Please assign all ${unassignedCount} remaining ${
      unassignedCount === 1 ? 'item' : 'items'
    } to proceed.`;
  }

  return (
    <div className="sticky bottom-4 z-30 animate-in fade-in slide-in-from-bottom-3">
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl space-y-3 ring-1 ring-white/10">
        
        {/* Top Banner Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Status Badge & Counters */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                isAllItemsAssigned
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isAllItemsAssigned ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm sm:text-base font-bold ${
                    isAllItemsAssigned ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {isAllItemsAssigned
                    ? 'All items assigned ✓'
                    : `Unassigned items: ${unassignedCount} remaining`}
                </h4>

                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {assignedItemsCount}/{totalItems} items ({progressPercent}%)
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                {isAllItemsAssigned
                  ? `Every dish is assigned across ${participants.length} participants. Ready to view results!`
                  : disabledReason}
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="w-full sm:w-auto flex flex-col items-end gap-1.5">
            <button
              type="button"
              onClick={handleProceed}
              disabled={!isAllItemsAssigned}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                isAllItemsAssigned
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
              title={
                isAllItemsAssigned
                  ? 'View final split results'
                  : disabledReason || 'Please assign every item to at least one person to proceed.'
              }
            >
              {isAllItemsAssigned && <Sparkles className="w-4 h-4 text-emerald-300" />}
              <span>View Split Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isAllItemsAssigned
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                : 'bg-gradient-to-r from-amber-500 to-indigo-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Helper text tooltip when disabled */}
        {!isAllItemsAssigned && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/50">
            <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>
              <strong>Requirement:</strong> Please assign every item to at least one person to proceed.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
