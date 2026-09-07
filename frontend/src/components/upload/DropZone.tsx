import React, { useRef, useState } from 'react';
import { useBill } from '../../context/BillContext';
import { UploadCloud, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';

export const DropZone: React.FC = () => {
  const { selectFile, uploadedFile } = useBill();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setDragError(null);
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'image/bmp',
    ];

    const isImage = validTypes.includes(file.type.toLowerCase()) || 
      file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif|bmp)$/);

    if (!isImage) {
      setDragError('Please upload an image file (JPEG, PNG, WEBP, HEIC, BMP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setDragError('File is too large (Max 20MB).');
      return;
    }

    selectFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/bmp"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01] shadow-xl shadow-indigo-500/10'
            : uploadedFile
            ? 'border-emerald-500/50 bg-emerald-950/10 hover:border-emerald-400'
            : 'border-slate-700/80 bg-slate-900/40 hover:border-indigo-500/70 hover:bg-slate-900/80'
        }`}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              uploadedFile
                ? 'bg-emerald-500/20 text-emerald-400'
                : isDragging
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50'
                : 'bg-slate-800 text-indigo-400 border border-slate-700 group-hover:bg-indigo-600 group-hover:text-white'
            }`}
          >
            {uploadedFile ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in-50" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-200">
              {isDragging
                ? 'Drop your receipt image here!'
                : uploadedFile
                ? 'Receipt photo selected'
                : 'Upload your receipt photo'}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Drag & drop your restaurant check or bill photo here, or{' '}
              <span className="text-indigo-400 font-medium underline underline-offset-2">
                browse files
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> JPEG, PNG, WEBP, HEIC
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Max 20 MB
            </span>
          </div>
        </div>

        {dragError && (
          <div className="mt-4 p-2 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg animate-shake">
            {dragError}
          </div>
        )}
      </div>
    </div>
  );
};
