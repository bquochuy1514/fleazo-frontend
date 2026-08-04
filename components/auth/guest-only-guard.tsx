'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// google-callback manages its own post-login redirect (next comes from
// sessionStorage there, not the URL — see google-auth-button.tsx) and
// clears that key before this guard could ever read it. Letting this guard
// also fire on that page races it and always loses to '/'.
const EXEMPT_PATHS = ['/google-callback'];

export function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const shouldRedirect =
		!isLoading && !!user && !EXEMPT_PATHS.includes(pathname);

	useEffect(() => {
		if (!shouldRedirect) return;
		// Read from window.location, not useSearchParams — avoids forcing a
		// Suspense boundary here. Also covers the login page's own
		// router.push(next) racing this effect right after a fresh login:
		// both then agree on the same destination instead of this bouncing
		// the visitor to '/' over whatever they actually asked for.
		const next = new URLSearchParams(window.location.search).get('next');
		router.replace(next ?? '/');
	}, [shouldRedirect, router]);

	if (shouldRedirect) return null;
	return <>{children}</>;
}
