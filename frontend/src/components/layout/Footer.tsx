import React from 'react';
import { ShieldCheck, Zap, ExternalLink, Code2, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
        {/* Left: Project info */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Smart Bill Splitter</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span>AI-Powered Bill Scanning & Split Engine</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1">
            <Code2 className="w-3 h-3 text-indigo-500" />
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              React 19 · FastAPI · Groq Vision AI
            </span>
          </span>
        </div>

        {/* Right: Quality badges + GitHub */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast AI Extraction
          </span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Math Sanity Guaranteed
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Portfolio Project</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
