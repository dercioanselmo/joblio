'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export function NavbarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === '/find-jobs' ? pathname.startsWith('/find-jobs') : pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'border-b-2 border-transparent pb-px transition hover:text-accent',
        isActive ? 'border-accent text-accent' : 'text-text-dark',
      )}
      onClick={() => trackEvent('navbar_link_clicked', { label, href })}
    >
      {label}
    </Link>
  );
}
