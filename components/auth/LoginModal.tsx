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
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow sm:p-8">
          <div className="flex justify-end">
            <button
              aria-label="Close login"
              onClick={onClose}
              className="rounded-full p-1 text-text-muted hover:bg-surface-secondary"
            >
              ×
            </button>
          </div>

          <div className="mb-6 -mt-4 text-center">
            <h2 className="text-2xl font-bold text-text-black">Sign in to Joblio</h2>
            <p className="mt-2 text-sm leading-6 text-text-slate-medium">
              Continue with Google or GitHub to access your dashboard and job matches.
            </p>
          </div>

          <LoginForm onSuccess={onClose} />
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}
