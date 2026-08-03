'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { usePathname, useSearchParams } from 'next/navigation';
import '@/instrumentation-client';
import { trackEvent, identifyUser } from '@/lib/analytics';
import { insforge } from '@/lib/insforge-client';

export default function PostHogProviderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent('page_view', {
      path: pathname,
      search: searchParams.toString(),
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      const user = data?.user;
      if (user && posthog.get_distinct_id() !== user.id) {
        identifyUser(user.id, { email: user.email, name: user.profile?.name });
        trackEvent('login_completed', { provider: user.providers?.[0] });
      }
    });
  }, [pathname]);

  return <>{children}</>;
}
