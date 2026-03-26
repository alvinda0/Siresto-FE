// components/Modal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Glassmorphism */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content with Glassmorphism 2.0 */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white/90 dark:bg-slate-900/90
          backdrop-blur-xl
          border border-white/20
          rounded-2xl
          shadow-2xl shadow-black/10
          overflow-hidden
          animate-in fade-in-0 zoom-in-95 duration-300
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            {title && (
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  p-2 rounded-lg
                  hover:bg-white/20 dark:hover:bg-white/10
                  transition-colors duration-200
                  text-slate-600 dark:text-slate-300
                "
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 text-slate-700 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}