'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import '@/instrumentation-client';
import { trackEvent } from '@/lib/analytics';

// PostHog is initialized via instrumentation-client.ts (Next.js 15.3+).
// This component is kept as a pass-through wrapper for layout compatibility.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent('page_view', {
      path: pathname,
      search: searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
