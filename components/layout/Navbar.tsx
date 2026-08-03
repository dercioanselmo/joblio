import Image from "next/image";
import Link from "next/link";
import { createInsforgeServer } from "@/lib/insforge-server";
import { NavbarAuthCta } from "@/components/layout/NavbarAuthCta";
import { NavbarLink } from "@/components/layout/NavbarLink";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
];

export async function Navbar() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const isAuthenticated = Boolean(data?.user);

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
            <NavbarLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <NavbarAuthCta isAuthenticated={isAuthenticated} />
      </div>
    </header>
  );
}
