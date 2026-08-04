'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { initiateOAuth } from '@/actions/auth';
import { trackEvent } from '@/lib/analytics';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.62h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.27-2.09 3.56-5.17 3.56-8.83Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.27v3.11C3.25 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4.02-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.02 3.11c.94-2.83 3.59-4.94 6.71-4.94Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.42.36.78 1.07.78 2.15 0 1.56-.01 2.81-.01 3.19 0 .31.21.67.8.56A10.51 10.51 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  );
}

const providers = [
  { id: 'google', label: 'Continue with Google', Icon: GoogleIcon },
  { id: 'github', label: 'Continue with GitHub', Icon: GitHubIcon },
];

export default function LoginFormContent({ onSuccess }: { onSuccess?: () => void }) {
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectAfterLogin = searchParams?.get('redirect') ?? '/dashboard';
  const oauthError = searchParams?.get('error');

  const handleOAuth = async (provider: string) => {
    setErrorMessage(null);
    setLoadingProvider(provider);

    trackEvent('login_initiated', { provider, source: 'login_form' });

    try {
      onSuccess?.();
      await initiateOAuth(provider, redirectAfterLogin);
    } catch (err) {
      console.error('[login]', err);
      setErrorMessage('Unable to start sign in. Please try again.');
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {providers.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary shadow-sm transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => handleOAuth(id)}
            disabled={Boolean(loadingProvider) && loadingProvider !== id}
          >
            <Icon />
            {loadingProvider === id ? 'Redirecting...' : label}
          </button>
        ))}
      </div>

      {errorMessage || oauthError ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage ?? 'Sign in failed. Please try again.'}
        </div>
      ) : null}
    </div>
  );
}
