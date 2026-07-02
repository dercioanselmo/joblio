'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { insforge } from '@/lib/insforge-client';
import { identifyUser, trackEvent } from '@/lib/analytics';

export default function CallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const finishAuth = async () => {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        const user = data?.user;

        if (user) {
          identifyUser(user.id, {
            email: user.email,
            name: user.profile?.name,
          });
          trackEvent('login_completed', {
            provider: user.providers?.[0],
          });
          const redirectTarget = searchParams.get('redirect') ?? '/dashboard';
          router.replace(redirectTarget);
          return;
        }

        console.error('[callback] no user', error);
        setErrorMessage('Unable to confirm your login. Please sign in again.');
        setStatus('error');
      } catch (error) {
        console.error('[callback]', error);
        trackEvent('login_failed', { step: 'callback', error: error instanceof Error ? error.message : String(error) });
        setErrorMessage('Unable to confirm your login. Please sign in again.');
        setStatus('error');
      }
    };

    finishAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-surface px-6 py-16 text-text-dark">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-background p-10 shadow-xl shadow-black/5 sm:p-12">
        {status === 'loading' ? (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold">Finishing sign in</p>
            <p className="text-sm leading-6 text-text-muted">
              We are confirming your account and redirecting you to your dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold">Sign in failed</p>
            <p className="text-sm leading-6 text-text-muted">{errorMessage}</p>
            <a
              href="/login"
              className="inline-flex rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-accent-dark"
            >
              Return to login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
