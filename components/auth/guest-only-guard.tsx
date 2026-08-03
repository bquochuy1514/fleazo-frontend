'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const shouldRedirect = !isLoading && !!user;

	useEffect(() => {
		if (shouldRedirect) router.replace('/');
	}, [shouldRedirect, router]);

	if (shouldRedirect) return null;
	return <>{children}</>;
}
