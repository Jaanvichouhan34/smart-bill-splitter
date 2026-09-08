import React, { useState } from 'react';
import { useBill } from '../../context/BillContext';
import { ItemAssignmentCard } from './ItemAssignmentCard';
import {
  UtensilsCrossed,
  Search,
  Users,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ItemAssignmentList: React.FC = () => {
  const {
    billData,
    participants,
    assignments,
    toggleItemAssignment,
    assignEveryoneToItem,
    clearItemAssignments,
    assignAllItemsToEveryone,
    resetAssignments,
    unassignedCount,
  } = useBill();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unassigned' | 'assigned'>('all');

  if (!billData) return null;

  const currency = billData.currency || 'INR';
  const totalItems = billData.items.length;
  const assignedCount = totalItems - unassignedCount;

  // Filter items
  const filteredItems = billData.items.filter((item) => {
    // Search match
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const itemPeople = assignments[item.id] || [];
    if (filterMode === 'unassigned') {
      return itemPeople.length === 0;
    }
    if (filterMode === 'assigned') {
      return itemPeople.length > 0;
    }
    return true;
  });

  return (
    <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-5">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                2. Assign Line Items
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 text-xs font-mono font-semibold border border-slate-300 dark:border-slate-700">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tap the participant badges on each dish to assign individual or split shares.
            </p>
          </div>
        </div>

        {/* Bulk Global Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={assignAllItemsToEveryone}
            disabled={participants.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Assign all items on the receipt to everyone"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Assign All to Everyone</span>
          </button>

          {assignedCount > 0 && (
            <button
              type="button"
              onClick={resetAssignments}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
              title="Reset all assignments"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish or item..."
            className="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            All ({totalItems})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('unassigned')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filterMode === 'unassigned'
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span>Unassigned ({unassignedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('assigned')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filterMode === 'assigned'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Assigned ({assignedCount})</span>
          </button>
        </div>
      </div>

      {/* Item Assignment Cards List */}
      <div className="space-y-3.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-center space-y-2">
            <UtensilsCrossed className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No items found</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {searchQuery
                ? `No items match "${searchQuery}".`
                : filterMode === 'unassigned'
                ? 'All items have been assigned! Great job.'
                : 'No assigned items yet.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <ItemAssignmentCard
              key={item.id}
              item={item}
              itemIndex={billData.items.findIndex((it) => it.id === item.id)}
              participants={participants}
              assignedPersonIds={assignments[item.id] || []}
              currency={currency}
              onTogglePerson={(pid) => toggleItemAssignment(item.id, pid)}
              onAssignEveryone={() => assignEveryoneToItem(item.id)}
              onClear={() => clearItemAssignments(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
