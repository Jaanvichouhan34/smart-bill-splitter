import React, { useState } from 'react';
import { useBill } from '../../context/BillContext';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Eye,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface ReceiptViewerProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  onToggleCollapse,
}) => {
  const { receiptImageUrl, receiptImageName } = useBill();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!receiptImageUrl) {
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
        No receipt photo attached
      </div>
    );
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <>
      <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="truncate">{receiptImageName || 'Receipt Photo'}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors ml-1"
              title="Open full view modal"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ml-1"
                title="Collapse receipt preview"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable image viewport */}
        <div className="relative flex-1 min-h-[420px] max-h-[680px] overflow-auto p-4 bg-slate-950/90 flex items-center justify-center select-none">
          <div
            className="transition-transform duration-200 origin-top flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={receiptImageUrl}
              alt="Receipt preview"
              className="max-w-full rounded-lg shadow-2xl border border-slate-800 object-contain max-h-[620px]"
            />
          </div>
        </div>

        {/* Helper footer */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tip: Scroll & zoom to cross-check item totals</span>
          <span className="text-indigo-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Original Check
          </span>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-slate-200">
            <div className="flex items-center gap-2 font-medium text-sm">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Full Receipt Inspection: {receiptImageName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono px-3"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 ml-2"
              >
                Close View
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={receiptImageUrl}
              alt="Fullscreen receipt"
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>
        </div>
      )}
    </>
  );
};
