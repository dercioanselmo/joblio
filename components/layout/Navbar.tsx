import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-[1720px] items-center justify-between px-6 sm:px-10 lg:px-24">
        <Link href="/" aria-label="Joblio home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Joblio"
            width={124}
            height={42}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-12 text-[16px] font-medium leading-6 text-text-dark sm:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="rounded-md bg-overlay px-6 py-3 text-[16px] font-semibold leading-6 text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-overlay-dark"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}
