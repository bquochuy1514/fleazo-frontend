'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// useSearchParams needs a Suspense boundary (Next.js build requirement)
export default function GoogleCallbackPage() {
	return (
		<Suspense fallback={null}>
			<GoogleCallbackHandler />
		</Suspense>
	);
}

function GoogleCallbackHandler() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const auth = useAuth();
	const hasRun = useRef(false);

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const accessToken = searchParams.get('access_token');
		const refreshToken = searchParams.get('refresh_token');

		if (!accessToken || !refreshToken) {
			router.replace('/login');
			return;
		}

		// No remember-me checkbox in the Google flow — always persist to
		// localStorage, same as remember-me checked for email/password login.
		localStorage.setItem('access_token', accessToken);
		localStorage.setItem('refresh_token', refreshToken);

		auth.login(accessToken).then(() => {
			// replace, not push — the current entry (this URL, tokens in the
			// query string) gets swapped away rather than kept in history.
			router.replace('/');
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<p className="text-center text-sm text-muted-foreground">
			Đang đăng nhập...
		</p>
	);
}
