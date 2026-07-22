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
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) router.replace('/dang-nhap');
	}, [isLoading, user, router]);

	if (isLoading || !user) return null;
	return <>{children}</>;
}
