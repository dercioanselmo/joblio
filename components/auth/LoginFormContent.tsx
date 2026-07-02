'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@insforge/sdk';
import { trackEvent } from '@/lib/analytics';

const providers = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'github', label: 'Continue with GitHub' },
];

export default function LoginFormContent({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectAfterLogin = searchParams?.get('redirect') ?? '/dashboard';
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/callback?redirect=${encodeURIComponent(redirectAfterLogin)}`
      : `/callback?redirect=${encodeURIComponent(redirectAfterLogin)}`;

  const handleOAuth = async (provider: string) => {
    setErrorMessage(null);
    setLoadingProvider(provider);

    trackEvent('login_initiated', { provider, source: 'login_form' });

    try {
      const client = createClient({ baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL! });

      const { data, error } = await client.auth.signInWithOAuth(provider, {
        redirectTo,
      });

      if (error) {
        setErrorMessage('Unable to start OAuth sign in. Please try again.');
        setLoadingProvider(null);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      router.push(`/callback?redirect=${encodeURIComponent(redirectAfterLogin)}`);
      onSuccess?.();
    } catch (err) {
      console.error('[login]', err);
      setErrorMessage('Unable to start sign in. Please try again.');
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-text-muted">Welcome back</p>
      <h1 className="text-4xl font-semibold tracking-tight">Sign in to Joblio</h1>
      <p className="text-base leading-7 text-text-muted">
        Continue with Google or GitHub to access your dashboard and job matches.
      </p>

      <div className="mt-6 space-y-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className="flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-4 text-base font-semibold text-accent-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => handleOAuth(provider.id)}
            disabled={Boolean(loadingProvider) && loadingProvider !== provider.id}
          >
            {loadingProvider === provider.id ? 'Redirecting...' : provider.label}
          </button>
        ))}
      </div>

      {errorMessage ? (
        <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
