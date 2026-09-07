import React, { useState, useRef } from 'react';
import { useBill } from '../../context/BillContext';
import { ParticipantBadge } from './ParticipantBadge';
import type { Participant } from '../../types/bill';
import {
  UserPlus,
  Users,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Sparkles,
} from 'lucide-react';

const SUGGESTED_NAMES = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank'];

export const PeopleManager: React.FC = () => {
  const { participants, assignments, addParticipant, removeParticipant, billData } = useBill();

  const [inputName, setInputName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Participant | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (nameToAdd?: string) => {
    const target = nameToAdd || inputName;
    const trimmed = target.trim();

    if (!trimmed) {
      setInputError('Please enter a name');
      return;
    }

    if (participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setInputError(`"${trimmed}" is already added`);
      return;
    }

    const created = addParticipant(trimmed);
    if (created) {
      setInputName('');
      setInputError(null);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // Calculate how many items a participant is assigned to
  const getAssignedCount = (participantId: string): number => {
    return Object.values(assignments).filter((assignedList) =>
      assignedList.includes(participantId)
    ).length;
  };

  // Find items assigned to a person for the confirmation modal
  const getAssignedItemNames = (participantId: string): string[] => {
    if (!billData) return [];
    return billData.items
      .filter((item) => (assignments[item.id] || []).includes(participantId))
      .map((item) => item.name);
  };

  const handleInitiateRemove = (participant: Participant) => {
    const assignedCount = getAssignedCount(participant.id);
    if (assignedCount > 0) {
      // Show confirmation modal
      setPersonToDelete(participant);
    } else {
      // Remove directly
      removeParticipant(participant.id);
    }
  };

  const handleConfirmDelete = () => {
    if (personToDelete) {
      removeParticipant(personToDelete.id);
      setPersonToDelete(null);
    }
  };

  // Unused suggestions
  const remainingSuggestions = SUGGESTED_NAMES.filter(
    (name) => !participants.some((p) => p.name.toLowerCase() === name.toLowerCase())
  );

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                1. Add Group Members
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 text-xs font-mono font-semibold border border-slate-700">
                {participants.length} {participants.length === 1 ? 'person' : 'people'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Add everyone who is splitting this bill. Each person gets a distinct color badge.
            </p>
          </div>
        </div>

        {participants.length < 2 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Add at least 2 people to split</span>
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter name (e.g. Alice, Bob, Charlie)..."
              maxLength={30}
              className={`w-full bg-slate-950/80 border rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                inputError
                  ? 'border-rose-500/80 focus:ring-rose-500/50'
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => handleAdd()}
            disabled={!inputName.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Person</span>
          </button>
        </div>

        {/* Inline input error */}
        {inputError && (
          <p className="text-xs text-rose-400 flex items-center gap-1 pl-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{inputError}</span>
          </p>
        )}
      </div>

      {/* Quick Add Suggestions */}
      {remainingSuggestions.length > 0 && participants.length < 6 && (
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Quick add:</span>
          </span>
          {remainingSuggestions.slice(0, 4).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleAdd(name)}
              className="px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-indigo-950/40 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/30 transition-all font-medium"
            >
              + {name}
            </button>
          ))}
        </div>
      )}

      {/* Participants Badge Cloud */}
      <div className="space-y-2">
        {participants.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No participants added yet. Type names above or use quick suggestions.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {participants.map((person) => {
              const count = getAssignedCount(person.id);
              return (
                <ParticipantBadge
                  key={person.id}
                  participant={person}
                  assignedCount={count}
                  size="md"
                  showCount={true}
                  onRemove={() => handleInitiateRemove(person)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {personToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-lg font-bold text-white">
                Remove {personToDelete.name}?
              </h4>
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-rose-300">{personToDelete.name}</span> is currently assigned to{' '}
                <span className="font-bold text-white">{getAssignedCount(personToDelete.id)}</span> items:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-left max-h-32 overflow-y-auto divide-y divide-slate-800/50">
                {getAssignedItemNames(personToDelete.id).map((itemName, i) => (
                  <p key={i} className="text-xs text-slate-300 py-1 truncate">
                    • {itemName}
                  </p>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Removing them will automatically unassign them from these dishes.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPersonToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove & Unassign</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
