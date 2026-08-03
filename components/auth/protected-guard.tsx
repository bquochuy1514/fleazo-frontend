'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Wraps a logged-in-only route group. Bounces a signed-out visitor to
// /dang-nhap with `?next=` so login sends them back to what they tapped,
// not the homepage.
export function ProtectedGuard({ children }: { children: React.ReactNode }) {
	const { user, isLoading, isLoggingOut } = useAuth();
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		// logout() already navigates home itself — avoid fighting it mid-flight.
		if (isLoading || user || isLoggingOut) return;
		router.replace(`/dang-nhap?next=${encodeURIComponent(pathname)}`);
	}, [isLoading, user, isLoggingOut, pathname, router]);

	if (isLoading || !user) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return <>{children}</>;
}
