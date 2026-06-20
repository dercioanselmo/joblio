import Link from "next/link";

function ArrowGlyph() {
  return (
    <span
      aria-hidden="true"
      className="ml-2 inline-block h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-text-muted align-middle"
    />
  );
}

export function BottomCta() {
  return (
    <section className="border-x border-b border-border">
      <div className="section-hatch h-28 border-b border-border" />
      <div className="landing-gradient px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28">
        <h2 className="mx-auto max-w-[980px] text-[48px] font-bold leading-[1.12] tracking-normal text-text-black sm:text-[64px] lg:text-[76px]">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="mx-auto mt-8 max-w-[900px] text-[22px] font-normal leading-9 text-text-slate-medium">
          Set up your profile, upload your resume, and start finding matches in minutes.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="min-w-[190px] rounded-md bg-overlay px-8 py-4 text-[20px] font-semibold leading-7 text-accent-foreground shadow-sm transition hover:bg-overlay-dark"
          >
            Get Started
            <ArrowGlyph />
          </Link>
          <Link
            href="/find-jobs"
            className="min-w-[260px] rounded-md border border-border bg-surface/70 px-8 py-4 text-[20px] font-semibold leading-7 text-text-slate shadow-sm transition hover:bg-surface"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
      <div className="section-hatch h-28 border-t border-border" />
    </section>
  );
}
