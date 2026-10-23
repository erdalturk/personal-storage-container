"use client";

import React from "react";
import { Trash2, CheckSquare, Square, X, RotateCcw } from "lucide-react";

export interface BatchActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteBatch: () => void;
  onRestoreBatch?: () => void;
  onClose: () => void;
  deleteLabel?: string;
  restoreLabel?: string;
}

export default function BatchActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDeleteBatch,
  onRestoreBatch,
  onClose,
  deleteLabel = "Seçilenleri Sil",
  restoreLabel = "Geri Yükle",
}: BatchActionBarProps) {
  if (selectedCount === 0) return null;

  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 bg-stone-900/95 dark:bg-slate-900/95 text-white backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl border border-stone-700/60 dark:border-slate-700/60 transition-all max-w-[95vw] sm:max-w-xl">
      <div className="flex items-center gap-2 pr-2 border-r border-stone-700/80">
        <span className="text-xs font-bold bg-indigo-600 px-2 py-0.5 rounded-full">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-stone-200 hidden sm:inline">
          seçildi
        </span>
      </div>

      <button
        type="button"
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white px-2 py-1 rounded-lg hover:bg-stone-800 transition cursor-pointer"
      >
        {isAllSelected ? (
          <>
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Seçimi Kaldır</span>
          </>
        ) : (
          <>
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Tümünü Seç</span>
            <span className="sm:hidden">Tümü</span>
          </>
        )}
      </button>

      {onRestoreBatch && (
        <button
          type="button"
          onClick={onRestoreBatch}
          className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{restoreLabel}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onDeleteBatch}
        className="flex items-center gap-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>{deleteLabel}</span>
      </button>

      <button
        type="button"
        onClick={onClose}
        className="p-1 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition cursor-pointer ml-1"
        title="Seçimi Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
