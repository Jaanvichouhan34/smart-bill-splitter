import React from 'react';
import type { LineItem, Participant } from '../../types/bill';
import { ParticipantBadge } from './ParticipantBadge';
import { formatCurrency } from '../../utils/currency';
import { Users, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

interface ItemAssignmentCardProps {
  item: LineItem;
  itemIndex: number;
  participants: Participant[];
  assignedPersonIds: string[];
  currency: string;
  onTogglePerson: (participantId: string) => void;
  onAssignEveryone: () => void;
  onClear: () => void;
}

export const ItemAssignmentCard: React.FC<ItemAssignmentCardProps> = ({
  item,
  itemIndex,
  participants,
  assignedPersonIds,
  currency,
  onTogglePerson,
  onAssignEveryone,
  onClear,
}) => {
  const assignedCount = assignedPersonIds.length;
  const isUnassigned = assignedCount === 0;
  const isEveryone = participants.length > 0 && assignedCount === participants.length;

  const itemTotal = Number(item.total_price) || 0;
  const perPersonCost = assignedCount > 0 ? itemTotal / assignedCount : itemTotal;

  // Get assigned participants in order
  const assignedParticipants = participants.filter((p) =>
    assignedPersonIds.includes(p.id)
  );

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 border ${
        isUnassigned
          ? 'bg-amber-950/10 border-amber-500/40 shadow-md shadow-amber-500/5'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80 shadow-lg'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        
        {/* Left: Item index, name, qty */}
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {itemIndex + 1}
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
              <span>{item.quantity}x @ {formatCurrency(item.unit_price, currency)}</span>
            </div>
          </div>
        </div>

        {/* Right: Item Total & Quick Actions */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Item Total</span>
            <span className="text-base sm:text-lg font-bold font-mono text-indigo-300">
              {formatCurrency(itemTotal, currency)}
            </span>
          </div>

          {/* Quick Assign Buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              type="button"
              onClick={onAssignEveryone}
              disabled={participants.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed ${
                isEveryone
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500/40 hover:bg-purple-600/40'
                  : 'bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border-slate-700 hover:border-indigo-500/40'
              }`}
              title="Assign this item to everyone"
            >
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{isEveryone ? 'Everyone ✓' : 'Everyone'}</span>
              </span>
            </button>

            {assignedCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
                title="Clear all assignments for this item"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Multi-select Person Badges */}
      <div className="pt-3 space-y-3">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Assign To:
          </span>

          {participants.length === 0 ? (
            <div className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              Please add group members above before assigning dishes.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participants.map((person) => {
                const isSelected = assignedPersonIds.includes(person.id);
                return (
                  <ParticipantBadge
                    key={person.id}
                    participant={person}
                    isSelected={isSelected}
                    isInteractive={true}
                    onToggle={() => onTogglePerson(person.id)}
                    size="sm"
                    showCount={false}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom: Split status & Cost breakdown */}
        <div className="pt-2 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          {isUnassigned ? (
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
              <span>Unassigned — select who shared this item</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>
                {assignedCount === 1 ? (
                  <>
                    Assigned entirely to <strong className="text-white">{assignedParticipants[0]?.name}</strong>
                  </>
                ) : isEveryone ? (
                  <>
                    Split equally among <strong className="text-white">All {participants.length} members</strong>
                  </>
                ) : (
                  <>
                    Split among{' '}
                    <strong className="text-white">
                      {assignedParticipants.map((p) => p.name).join(', ')}
                    </strong>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Per person split breakdown cost */}
          {!isUnassigned && (
            <div className="font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-lg text-xs font-semibold ml-auto">
              {formatCurrency(perPersonCost, currency)} each{' '}
              <span className="text-slate-400 text-[10px] font-normal">
                ({assignedCount} {assignedCount === 1 ? 'person' : 'way split'})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
