'use client';

import { useState } from 'react';
import posthog from 'posthog-js';
import LoginModal from '@/components/auth/LoginModal';
import { signOut } from '@/actions/auth';
import { trackEvent } from '@/lib/analytics';

export function NavbarAuthCta({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (isAuthenticated) {
    return (
      <button
        onClick={() => {
          setSigningOut(true);
          trackEvent('logout_initiated', { source: 'navbar' });
          posthog.reset();
          signOut();
        }}
        disabled={signingOut}
        className="rounded-md bg-overlay px-6 py-3 text-[16px] font-semibold leading-6 text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-overlay-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {signingOut ? 'Signing out...' : 'Sign out'}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          trackEvent('login_modal_opened', { source: 'navbar' });
        }}
        className="rounded-md bg-overlay px-6 py-3 text-[16px] font-semibold leading-6 text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-overlay-dark"
      >
        Start for free
      </button>

      <LoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
