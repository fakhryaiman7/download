'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
      <div className="flex-1 font-medium">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
