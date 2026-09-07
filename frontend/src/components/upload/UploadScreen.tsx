import React from 'react';
import { useBill } from '../../context/BillContext';
import { DropZone } from './DropZone';
import { ImagePreview } from './ImagePreview';
import { SampleReceipts } from './SampleReceipts';
import { ExtractionLoader } from './ExtractionLoader';
import { AlertCircle, RefreshCw, Sparkles, Shield, Split, Zap } from 'lucide-react';

export const UploadScreen: React.FC = () => {
  const { status, errorMessage, retryExtraction, receiptImageUrl } = useBill();

  if (status === 'processing') {
    return (
      <div className="py-8 sm:py-12 px-4 flex justify-center items-center">
        <ExtractionLoader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Hero Intro */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Phase 2 • Smart Receipt Extraction
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Upload Receipt & Verify Bill
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Snap a photo of your cafe check, restaurant bill, or grocery receipt. Our Vision AI extracts every dish and verifies all math automatically.
        </p>
      </div>

      {/* Error Alert with Retry */}
      {status === 'error' && errorMessage && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-900/50 text-rose-400 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-200">Extraction Error</h4>
              <p className="text-xs text-rose-300/90 mt-0.5 max-w-xl">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={retryExtraction}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition-all flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Extraction</span>
          </button>
        </div>
      )}

      {/* Upload or Selected Preview */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
        {receiptImageUrl ? (
          <ImagePreview />
        ) : (
          <div className="space-y-6">
            <DropZone />
            <SampleReceipts />
          </div>
        )}
      </div>

      {/* Feature Highlights Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-slate-200">Instant Vision OCR</h5>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Reads curved receipts, low lighting, printed checks, and itemized bills accurately.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-slate-200">Math Sanity Check</h5>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Real-time validation ensures items sum matches subtotal and tax calculations.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 flex-shrink-0">
            <Split className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-semibold text-slate-200">Group Split Ready</h5>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Seamlessly moves to member assignment and custom tip/tax proportional splitting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
