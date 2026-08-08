'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Nests inside ProtectedGuard (applied at the (header-only) layout level —
// login is already guaranteed here). This only adds the role check: a
// signed-in non-admin gets bounced home instead of seeing the queue.
export function AdminGuard({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoading || !user) return;
		if (user.role !== 'ADMIN') router.replace('/');
	}, [isLoading, user, router]);

	if (isLoading || !user || user.role !== 'ADMIN') {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return <>{children}</>;
}
