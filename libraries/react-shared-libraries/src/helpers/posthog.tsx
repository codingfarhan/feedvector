'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { FC, ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const PosthogPageviewListener: FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      pathname,
      search,
    });

    const section = (() => {
      if (!pathname) return null;
      if (pathname.startsWith('/templates')) return 'templates';
      if (pathname.startsWith('/analytics')) return 'analytics';
      if (pathname.startsWith('/agents')) return 'agents';
      if (pathname.startsWith('/plugs')) return 'plugs';
      if (pathname.startsWith('/integrations')) return 'integrations';
      if (pathname.startsWith('/billing')) return 'billing';
      return null;
    })();

    if (section) {
      posthog.capture('view_section', {
        section,
        pathname,
        search,
      });
    }
  }, [pathname, search]);

  return null;
};
export const PHProvider: FC<{
  children: ReactNode;
  phkey?: string;
  host?: string;
}> = ({ children, phkey, host }) => {
  useEffect(() => {
    if (!phkey || !host) {
      return;
    }
    posthog.init(phkey, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    });
  }, []);
  if (!phkey || !host) {
    return <>{children}</>;
  }
  return (
    <PostHogProvider client={posthog}>
      <PosthogPageviewListener />
      {children}
    </PostHogProvider>
  );
};
