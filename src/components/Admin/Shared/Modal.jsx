// src/components/admin/shared/Modal.jsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal — Generic overlay rendered via Portal (always covers full viewport)
 *
 * Props :
 *   open       {boolean}
 *   onClose    {function}
 *   title      {string}
 *   subtitle   {string}
 *   size       {'sm'|'md'|'lg'|'xl'}
 *   closable   {boolean}
 *   footer     {ReactNode}
 *   children   {ReactNode}
 */

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size     = 'md',
  closable = true,
  footer,
  children,
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else      document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open || !closable) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closable, onClose]);

  if (!open) return null;

  // createPortal renders the modal directly into document.body,
  // bypassing any parent overflow/transform/height constraints.
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop — covers the entire viewport */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closable ? onClose : undefined}
      />

      {/* Modal panel */}
      <div className={`
        relative w-full ${SIZES[size] ?? SIZES.md}
        bg-white dark:bg-gray-800
        rounded-2xl shadow-2xl
        border border-gray-200 dark:border-gray-700
        flex flex-col max-h-[90vh]
        animate-in fade-in zoom-in-95 duration-200
      `}>
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            {title && (
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
                )}
              </div>
            )}
            {closable && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Optional footer */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body  // 👈 Portal target — bypasses any parent stacking context
  );
}
