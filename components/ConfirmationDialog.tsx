'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
  extraAction?: {
    label: string;
    onClick: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'default';
  };
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  extraAction,
}: ConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessing, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  }, [onConfirm]);

  const handleExtraAction = useCallback(async () => {
    if (!extraAction) return;
    setIsProcessing(true);
    try {
      await extraAction.onClick();
    } finally {
      setIsProcessing(false);
    }
  }, [extraAction]);

  if (!isOpen) return null;

  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    default: 'bg-navy hover:bg-navy-light text-white',
  };

  const processing = isLoading || isProcessing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={processing ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <h2
          id="dialog-title"
          className="font-serif text-xl font-bold text-navy mb-4"
        >
          {title}
        </h2>

        <div className="text-body mb-6">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        <div className="flex justify-end gap-3">
          {cancelLabel && (
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 text-body border border-border rounded hover:bg-light transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className={`px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${buttonStyles[variant]}`}
          >
            {processing && (
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmLabel}
          </button>
          {extraAction && (
            <button
              type="button"
              onClick={handleExtraAction}
              disabled={processing}
              className={`px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${buttonStyles[extraAction.variant || 'default']}`}
            >
              {processing && (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {extraAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
