import Image from "next/image";
import Link from "next/link";

function ArrowGlyph() {
  return (
    <span
      aria-hidden="true"
      className="ml-2 inline-block h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-text-muted align-middle"
    />
  );
}

export function Hero() {
  return (
    <section className="border-x border-b border-border">
      <div className="landing-gradient border-b border-border px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28">
        <h1 className="mx-auto max-w-230 text-[48px] font-bold leading-[1.08] tracking-normal text-text-black sm:text-[64px] lg:text-[78px]">
          Job hunting is hard.
          <br />
          Your tools should not be.
        </h1>
        <p className="mx-auto mt-8 max-w-205 text-[22px] font-normal leading-9 text-text-slate-medium">
          Stop applying blind. Joblio finds the jobs, researches the companies, and
          gives you everything you need to stand out.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="min-w-47.5 rounded-md bg-overlay px-8 py-4 text-[20px] font-semibold leading-7 text-accent-foreground shadow-sm transition hover:bg-overlay-dark"
          >
            Get Started
            <ArrowGlyph />
          </Link>
          <Link
            href="/find-jobs"
            className="min-w-65 rounded-md border border-border bg-surface/70 px-8 py-4 text-[20px] font-semibold leading-7 text-text-slate shadow-sm transition hover:bg-surface"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
      <div className="bg-surface-tertiary px-6 py-16 sm:px-10 lg:px-24">
        <div className="mx-auto max-w-362.5 overflow-hidden rounded-xl">
          <Image
            src="/images/dashboard-demo.png"
            alt="Joblio dashboard preview"
            width={4788}
            height={2416}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
