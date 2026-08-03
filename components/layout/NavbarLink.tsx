'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

export function NavbarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="transition hover:text-accent"
      onClick={() => trackEvent('navbar_link_clicked', { label, href })}
    >
      {label}
    </Link>
  );
}
