'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// Renders `children` immediately, even while `isLoading` — the initial
// loading window is a near-instant microtask, but blocking render during it
// causes a blank flash on every (auth) page (e.g. google-callback's spinner
// not appearing right away). Middleware's cookie check already handles the
// common "already logged in, visiting an auth page" case before the page
// ever loads; this guard only needs to catch it once isLoading resolves.
export function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const [shouldRedirect, setShouldRedirect] = useState<boolean | null>(null);

	if (shouldRedirect === null && !isLoading) {
		setShouldRedirect(!!user);
	}

	useEffect(() => {
		if (shouldRedirect) router.replace('/');
	}, [shouldRedirect, router]);

	if (shouldRedirect) return null;
	return <>{children}</>;
}
