import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatConfidence } from '../../utils/currency';

interface ConfidenceBadgeProps {
  confidence: number;
  showLabel?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showLabel = true,
}) => {
  const safeConfidence = isNaN(confidence) ? 1.0 : Math.max(0, Math.min(1, confidence));
  const pctStr = formatConfidence(safeConfidence);

  if (safeConfidence >= 0.8) {
    return (
      <span
        title={`AI Confidence: ${pctStr} (High confidence - text clearly recognized)`}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 whitespace-nowrap cursor-help transition-transform hover:scale-105"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        {showLabel && <span>{pctStr} High</span>}
      </span>
    );
  }

  if (safeConfidence >= 0.5) {
    return (
      <span
        title={`AI Confidence: ${pctStr} (Medium confidence - please check name & price)`}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 whitespace-nowrap cursor-help transition-transform hover:scale-105"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        {showLabel && <span>{pctStr} Med</span>}
      </span>
    );
  }

  return (
    <span
      title={`AI Confidence: ${pctStr} (Low confidence - please verify or re-enter details)`}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 whitespace-nowrap cursor-help animate-pulse transition-transform hover:scale-105"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400"></span>
      <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
      {showLabel && <span>{pctStr} Check</span>}
    </span>
  );
};
