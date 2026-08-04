import { SignOutButton } from "@/components/auth/SignOutButton";

export default function ProfilePage() {
  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow">
          <h1 className="text-3xl font-semibold text-text-primary">Profile (Placeholder)</h1>
          <p className="mt-4 text-base text-text-muted">
            The full profile form will appear here once implemented.
          </p>

          <SignOutButton
            source="profile"
            className="mt-8 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>
      </div>
    </div>
  );
}
