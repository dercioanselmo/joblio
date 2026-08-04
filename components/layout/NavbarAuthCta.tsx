'use client';

import { useState } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { trackEvent } from '@/lib/analytics';

export function NavbarAuthCta({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);

  if (isAuthenticated) {
    return (
      <SignOutButton
        source="navbar"
        className="rounded-md bg-overlay px-6 py-3 text-[16px] font-semibold leading-6 text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-overlay-dark disabled:cursor-not-allowed disabled:opacity-70"
      />
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
