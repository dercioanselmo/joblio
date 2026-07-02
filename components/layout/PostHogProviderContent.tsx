'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import '@/instrumentation-client';
import { trackEvent } from '@/lib/analytics';

export default function PostHogProviderContent({ children }: { children: React.ReactNode }) {
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
