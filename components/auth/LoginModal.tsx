'use client';

import { Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LoginForm from './LoginForm';

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <Fragment>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-background p-8 shadow-xl shadow-black/5">
          <div className="flex justify-end">
            <button
              aria-label="Close login"
              onClick={onClose}
              className="rounded-full p-1 text-text-muted hover:bg-muted"
            >
              ×
            </button>
          </div>

          <div className="mt-2">
            <LoginForm onSuccess={onClose} />
          </div>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}
