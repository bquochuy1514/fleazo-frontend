'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button';
import { PasswordInput } from '@/components/form/password-input';
import { FieldError } from '@/components/form/field-error';
import { ActionBanner } from '@/components/form/action-banner';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { useAuthFormScrollTop } from '@/components/auth/auth-form-panel';
import { api, parseApiError } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { ApiErrorResponse } from '@/types/api.types';
import { cn } from '@/lib/utils';

type LoginFields = 'email' | 'password';

const PILL_INPUT = 'h-11 rounded-full px-4 text-base md:text-[15px]';

// useSearchParams needs a Suspense boundary (Next build requirement).
export function LoginPageClient() {
	return (
		<Suspense fallback={null}>
			<LoginForm />
		</Suspense>
	);
}

function LoginForm() {
	const auth = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	// Where to land after a successful login — set by ProtectedGuard
	// (components/auth/protected-guard.tsx) when it bounces a signed-out
	// visitor here from a route that needs a session. Falls back to home for
	// a plain, un-redirected visit to /dang-nhap.
	const next = searchParams.get('next');
	const successMessage =
		searchParams.get('verified') === 'true'
			? 'Xác thực tài khoản thành công! Đăng nhập để tiếp tục.'
			: searchParams.get('passwordReset') === 'true'
				? 'Đặt lại mật khẩu thành công! Đăng nhập để tiếp tục.'
				: null;

	const [errors, setErrors] = useState<ApiErrorResponse<LoginFields>>({});
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
	const [rememberMe, setRememberMe] = useState(true);
	const [loading, setLoading] = useState(false);
	const scrollFormToTop = useAuthFormScrollTop();

	useEffect(() => {
		if (!errors.message && !errors.errors) return;
		scrollFormToTop();
		const id = setTimeout(scrollFormToTop, 350);
		return () => clearTimeout(id);
	}, [errors, scrollFormToTop]);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Force the keyboard to start dismissing right away rather than
		// hoping the default tap-to-blur happens promptly on iOS — the more
		// deterministic that timing is, the less room there is for the race
		// the effect above is guarding against.
		(document.activeElement as HTMLElement | null)?.blur();
		setLoading(true);
		setErrors({});

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			const { data } = await api.post('/auth/login', values);

			// Remember me decides WHICH storage gets the tokens — lib/api.ts's
			// refresh-token lookup checks localStorage first, then
			// sessionStorage, and writes back to whichever one it found them
			// in. This is the other half of that contract.
			const storage = rememberMe ? localStorage : sessionStorage;
			storage.setItem('access_token', data.access_token);
			storage.setItem('refresh_token', data.refresh_token);
			await auth.login(data.access_token);

			toast.success(data.message);
			router.push(next ?? '/');
		} catch (err) {
			const parsed = parseApiError<LoginFields>(err);
			setErrors(parsed);
			setUnverifiedEmail(
				parsed.errorCode === 'ACCOUNT_NOT_VERIFIED'
					? String(values.email)
					: null,
			);
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-3xl font-bold text-fz-ink">
				Đăng nhập
			</h1>
			<p className="mt-1.5 text-[15px] text-muted-foreground">
				Chào mừng quay lại Fleazo
			</p>

			{successMessage && (
				<ActionBanner message={successMessage} className="mt-5" />
			)}

			<div className="mt-6">
				<GoogleAuthButton next={next} />
			</div>

			<div className="my-5 flex items-center gap-3">
				<span className="h-px flex-1 bg-border" aria-hidden />
				<span className="text-sm text-muted-foreground">
					Hoặc đăng nhập bằng email
				</span>
				<span className="h-px flex-1 bg-border" aria-hidden />
			</div>

			<form
				onSubmit={onSubmit}
				noValidate
				className="flex flex-col gap-4"
			>
				<div>
					<label
						htmlFor="email"
						className="ml-1 text-sm font-medium text-fz-ink"
					>
						Email
					</label>
					<Input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="example@gmail.com"
						className={cn(PILL_INPUT, 'mt-1.5')}
					/>
					<FieldError message={errors.errors?.email} />
				</div>

				<div>
					<div className="flex items-center justify-between">
						<label
							htmlFor="password"
							className="ml-1 text-sm font-medium text-fz-ink"
						>
							Mật khẩu
						</label>
						{/* py-3 -my-3: grows the tap target to the 44px touch
						    minimum without pushing the label/field below it
						    down — the padding adds hit area, the matching
						    negative margin cancels the extra visual space it
						    would otherwise take. */}
						<Link
							href="/quen-mat-khau"
							tabIndex={-1}
							className="-my-3 inline-flex items-center py-3 text-sm text-fz-ink underline-offset-2 hover:underline"
						>
							Quên mật khẩu?
						</Link>
					</div>
					<PasswordInput
						id="password"
						name="password"
						autoComplete="current-password"
						placeholder="••••••••"
						wrapperClassName="mt-1.5"
						className={PILL_INPUT}
					/>
					<FieldError message={errors.errors?.password} />
				</div>

				{/* Same -my-3/py-3 hit-area trick as "Quên mật khẩu?" above —
				    the 20px line of text/checkbox was under half the 44px
				    touch minimum. */}
				<label className="-my-3 flex w-fit items-center gap-2.5 py-3 text-sm text-fz-ink">
					<Checkbox
						checked={rememberMe}
						onCheckedChange={(checked) =>
							setRememberMe(checked === true)
						}
					/>
					Ghi nhớ đăng nhập
				</label>

				{/* INVALID_CREDENTIALS deliberately doesn't say which of email/
				    password was wrong (see backend AGENTS.md → Auth Flow) — so
				    this renders as one banner above the button, never attached
				    to a specific field. ACCOUNT_NOT_VERIFIED swaps it for a
				    banner with a way out instead of a dead end. */}
				{unverifiedEmail ? (
					<ActionBanner
						tone="error"
						message={errors.message ?? ''}
						actionHref={`/xac-thuc-tai-khoan?email=${encodeURIComponent(unverifiedEmail)}&autoResend=true`}
						actionLabel="Xác thực ngay"
					/>
				) : (
					errors.message && (
						<ActionBanner tone="error" message={errors.message} />
					)
				)}

				<button
					type="submit"
					disabled={loading}
					className={cn(
						buttonVariants({ variant: 'default' }),
						'h-11 w-full text-[15px]',
					)}
				>
					{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
				</button>
			</form>

			<p className="mt-4 text-center text-sm text-muted-foreground">
				Chưa có tài khoản?{' '}
				<Link
					href="/dang-ky"
					className="font-medium text-fz-ink underline-offset-2 hover:underline"
				>
					Đăng ký
				</Link>
			</p>
		</>
	);
}
