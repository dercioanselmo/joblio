'use client';

import { useState } from 'react';
import posthog from 'posthog-js';
import { signOut } from '@/actions/auth';
import { trackEvent } from '@/lib/analytics';

export function SignOutButton({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const [signingOut, setSigningOut] = useState(false);

  return (
    <button
      onClick={() => {
        setSigningOut(true);
        trackEvent('logout_initiated', { source });
        posthog.reset();
        signOut();
      }}
      disabled={signingOut}
      className={className}
    >
      {signingOut ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
