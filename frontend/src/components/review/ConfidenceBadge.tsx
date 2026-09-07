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
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap cursor-help transition-transform hover:scale-105"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        {showLabel && <span>{pctStr} High</span>}
      </span>
    );
  }

  if (safeConfidence >= 0.5) {
    return (
      <span
        title={`AI Confidence: ${pctStr} (Medium confidence - please check name & price)`}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap cursor-help transition-transform hover:scale-105"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        {showLabel && <span>{pctStr} Med</span>}
      </span>
    );
  }

  return (
    <span
      title={`AI Confidence: ${pctStr} (Low confidence - please verify or re-enter details)`}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap cursor-help animate-pulse transition-transform hover:scale-105"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
      <AlertCircle className="w-3 h-3 text-rose-400" />
      {showLabel && <span>{pctStr} Check</span>}
    </span>
  );
};
