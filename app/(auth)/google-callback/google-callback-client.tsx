'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { POST_LOGIN_NEXT_KEY } from '@/components/auth/google-auth-button';
import { useAuth } from '@/hooks/use-auth';

// useSearchParams needs a Suspense boundary (Next build requirement).
export function GoogleCallbackPageClient() {
	return (
		<Suspense fallback={null}>
			<GoogleCallbackHandler />
		</Suspense>
	);
}

function GoogleCallbackHandler() {
	const auth = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const hasRun = useRef(false);

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const accessToken = searchParams.get('access_token');
		const refreshToken = searchParams.get('refresh_token');
		const message = searchParams.get('message');

		if (!accessToken || !refreshToken) {
			router.replace('/dang-nhap');
			return;
		}

		// No remember-me checkbox in Google flow — always persist to localStorage.
		localStorage.setItem('access_token', accessToken);
		localStorage.setItem('refresh_token', refreshToken);

		// Set by GoogleAuthButton before leaving the app.
		const next = sessionStorage.getItem(POST_LOGIN_NEXT_KEY);
		sessionStorage.removeItem(POST_LOGIN_NEXT_KEY);

		auth.login(accessToken).then(() => {
			if (message) toast.success(message);
			// replace: don't keep the token-bearing URL in history
			router.replace(next ?? '/');
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex flex-col items-center gap-4 py-6 text-center">
			<div
				className="size-10 animate-spin rounded-full border-4 border-border border-t-fz-ink"
				aria-hidden="true"
			/>
			<div>
				<h1 className="font-heading text-2xl font-bold text-fz-ink">
					Đang đăng nhập với Google
				</h1>
				<p className="mt-1.5 text-[15px] text-muted-foreground">
					Vui lòng đợi trong giây lát...
				</p>
			</div>
		</div>
	);
}
