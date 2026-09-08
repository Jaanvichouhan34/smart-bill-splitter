import React from 'react';
import type { Participant } from '../../types/bill';
import { getParticipantColorTheme, getInitials } from '../../utils/colors';
import { X, Check } from 'lucide-react';

interface ParticipantBadgeProps {
  participant: Participant;
  assignedCount?: number;
  isSelected?: boolean;
  isInteractive?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const ParticipantBadge: React.FC<ParticipantBadgeProps> = ({
  participant,
  assignedCount = 0,
  isSelected = false,
  isInteractive = false,
  onToggle,
  onRemove,
  size = 'md',
  showCount = true,
}) => {
  const theme = getParticipantColorTheme(participant.colorIndex);
  const initials = getInitials(participant.name);

  // Styling based on size
  const avatarSizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  }[size];

  const badgePaddingClasses = {
    sm: 'py-1 px-2 text-xs gap-1.5',
    md: 'py-1.5 px-3 text-xs gap-2',
    lg: 'py-2 px-3.5 text-sm gap-2.5',
  }[size];

  // If interactive (clickable chip inside item cards)
  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`group inline-flex items-center rounded-xl font-medium border transition-all duration-150 select-none ${badgePaddingClasses} ${
          isSelected
            ? `${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} shadow-sm ${theme.glow} ring-1 ${theme.ring}`
            : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
        title={`Click to ${isSelected ? 'unassign' : 'assign'} ${participant.name}`}
      >
        <span
          className={`flex items-center justify-center rounded-lg font-bold transition-all ${avatarSizeClasses} ${
            isSelected
              ? `${theme.avatarBg} ${theme.avatarText}`
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 group-hover:text-slate-900 dark:group-hover:text-slate-200'
          }`}
        >
          {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : initials}
        </span>
        <span className="truncate max-w-[120px]">{participant.name}</span>
      </button>
    );
  }

  // Display badge (in People Manager)
  return (
    <div
      className={`inline-flex items-center rounded-2xl border font-medium transition-all ${badgePaddingClasses} ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} shadow-sm`}
    >
      <span
        className={`flex items-center justify-center rounded-xl font-bold shadow-xs ${avatarSizeClasses} ${theme.avatarBg} ${theme.avatarText}`}
      >
        {initials}
      </span>

      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
        {participant.name}
      </span>

      {showCount && (
        <span
          className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
            assignedCount > 0
              ? 'bg-emerald-50 dark:bg-slate-900/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
              : 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
          }`}
          title={`${assignedCount} items assigned to ${participant.name}`}
        >
          {assignedCount} {assignedCount === 1 ? 'item' : 'items'}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
          title={`Remove ${participant.name}`}
          aria-label={`Remove ${participant.name}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
