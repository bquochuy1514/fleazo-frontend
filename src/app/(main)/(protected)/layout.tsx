'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// Auth guard lives once here — never re-check per page (see AGENTS.md → Project Structure).
// Cookie-based middleware already blocks most unauthenticated hits before this ever renders;
// this is the fallback for when the cookie is stale/missing but the real session is fine, or vice versa.
export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user, isLoading, isLoggingOut } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoading || user || isLoggingOut) return;
		router.replace('/dang-nhap');
	}, [isLoading, user, isLoggingOut, router]);

	// Mid-logout, keep showing the previous content instead of blanking —
	// logout() is already navigating home; blanking here would just flash
	// white for the split second before that navigation lands.
	if (isLoading || (!user && !isLoggingOut)) return null;
	return <>{children}</>;
}
