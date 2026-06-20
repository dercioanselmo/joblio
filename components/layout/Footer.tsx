import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Condition" },
];

export function Footer() {
  return (
    <footer className="border-x border-border bg-surface">
      <div className="mx-auto flex min-h-44 max-w-[1720px] flex-col justify-between gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-16">
        <Link href="/" aria-label="Joblio home" className="shrink-0">
          <Image src="/logo.png" alt="Joblio" width={124} height={42} className="h-10 w-auto" />
        </Link>
        <nav className="flex flex-wrap items-center gap-8 text-[20px] font-normal leading-7 text-text-dark">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
