'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { setSessionFlag } from '@/lib/session-flag';

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
			router.replace('/dang-nhap');
			return;
		}

		// No remember-me checkbox in the Google flow — always persist to
		// localStorage, same as remember-me checked for email/password login.
		localStorage.setItem('access_token', accessToken);
		localStorage.setItem('refresh_token', refreshToken);

		setSessionFlag(true);
		auth.login(accessToken).then(() => {
			// replace, not push — the current entry (this URL, tokens in the
			// query string) gets swapped away rather than kept in history.
			router.replace('/');
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex flex-col items-center gap-4 py-6 text-center">
			<div
				className="size-10 animate-spin rounded-full border-4 border-fz-primary-soft border-t-fz-primary"
				aria-hidden="true"
			/>
			<div>
				<h1 className="font-heading text-xl font-semibold text-fz-ink sm:text-2xl">
					Đang đăng nhập với Google
				</h1>
				<p className="mt-1.5 text-sm text-muted-foreground">
					Vui lòng đợi trong giây lát...
				</p>
			</div>
		</div>
	);
}
