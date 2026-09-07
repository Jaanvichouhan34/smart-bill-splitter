import React from 'react';
import { useBill } from '../../context/BillContext';
import { Sparkles, Trash2, CheckCircle, ArrowRight } from 'lucide-react';

export const ImagePreview: React.FC = () => {
  const {
    uploadedFile,
    receiptImageUrl,
    receiptImageName,
    clearFile,
    extractBill,
    status,
  } = useBill();

  if (!receiptImageUrl && !uploadedFile) return null;

  const fileSizeKb = uploadedFile ? Math.round(uploadedFile.size / 1024) : null;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Thumbnail Preview */}
        <div className="relative group w-32 h-44 sm:w-36 sm:h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-md flex-shrink-0">
          <img
            src={receiptImageUrl || ''}
            alt="Receipt preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <span className="text-[10px] text-slate-300 font-mono truncate">
              {receiptImageName}
            </span>
          </div>
        </div>

        {/* Metadata & Controls */}
        <div className="flex-1 flex flex-col justify-between self-stretch space-y-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CheckCircle className="w-4 h-4" /> Ready for AI Extraction
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-slate-100 truncate max-w-md">
              {receiptImageName || 'Selected Receipt Photo'}
            </h4>
            {fileSizeKb && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Size: {fileSizeKb > 1024 ? `${(fileSizeKb / 1024).toFixed(2)} MB` : `${fileSizeKb} KB`}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-2">
              Our Vision AI will detect item names, quantities, unit rates, taxes, and subtotal automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              onClick={extractBill}
              disabled={status === 'processing'}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Extract Bill with Vision AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={clearFile}
              disabled={status === 'processing'}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/80 text-slate-300 hover:text-red-400 hover:bg-red-950/30 border border-slate-700/80 hover:border-red-800/50 text-sm font-medium transition-all"
              title="Remove this image"
            >
              <Trash2 className="w-4 h-4" />
              <span>Change Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
