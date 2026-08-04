import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="landing-gradient flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" aria-label="Joblio home" className="mb-10">
        <Image src="/logo.png" alt="Joblio" width={124} height={42} priority className="h-10 w-auto" />
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-black">Sign in to Joblio</h1>
          <p className="mt-2 text-sm leading-6 text-text-slate-medium">
            Continue with Google or GitHub to access your dashboard and job matches.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-8 max-w-md text-center text-sm text-text-muted">
        If your browser blocks the redirect, refresh the page and try again.
      </p>
    </div>
  );
}
