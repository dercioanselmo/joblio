import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface px-6 py-16 text-text-dark">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-background p-10 shadow-xl shadow-black/5 sm:p-12">
        <LoginForm />

        <div className="mt-8 rounded-3xl border border-border bg-surface p-5 text-sm text-text-muted">
          <p className="font-medium text-text-dark">Need help?</p>
          <p className="mt-2 leading-6">
            If your browser blocks the redirect, refresh the page and try again.
          </p>
        </div>
      </div>
    </div>
  );
}
