'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button';
import { FieldError } from '@/components/form/field-error';
import { ActionBanner } from '@/components/form/action-banner';
import { useAuthFormScrollTop } from '@/components/auth/auth-form-panel';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';
import { cn } from '@/lib/utils';

type VerifyFields = 'email' | 'codeOtp';

const PILL_INPUT = 'h-11 rounded-full px-4 text-base md:text-[15px]';

// useSearchParams needs a Suspense boundary (Next build requirement).
export function VerifyAccountPageClient() {
	return (
		<Suspense fallback={null}>
			<VerifyAccountForm />
		</Suspense>
	);
}

function VerifyAccountForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get('email') ?? '';
	// Set by the login/forgot-password banners only.
	const autoResend = searchParams.get('autoResend') === 'true';

	const codeOtpRef = useRef<HTMLInputElement>(null);

	const [errors, setErrors] = useState<ApiErrorResponse<VerifyFields>>({});
	// Real backend message, not hardcoded — covers both onSubmit and onResend.
	const [alreadyActiveMessage, setAlreadyActiveMessage] = useState<
		string | null
	>(null);
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [resendMessage, setResendMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);
	const scrollFormToTop = useAuthFormScrollTop();

	// Same iOS keyboard-scroll race as the login form.
	useEffect(() => {
		if (!errors.message && !errors.errors && !alreadyActiveMessage) return;
		scrollFormToTop();
		const id = setTimeout(scrollFormToTop, 350);
		return () => clearTimeout(id);
	}, [errors, alreadyActiveMessage, scrollFormToTop]);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		(document.activeElement as HTMLElement | null)?.blur();
		setLoading(true);
		setErrors({});

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/verify-otp', values);

			// no tokens returned — still needs a normal login after
			router.push('/dang-nhap?verified=true');
		} catch (err) {
			const parsed = parseApiError<VerifyFields>(err);
			setErrors(parsed);
			setAlreadyActiveMessage(
				parsed.errorCode === 'ACCOUNT_ALREADY_ACTIVE'
					? (parsed.message ?? null)
					: null,
			);
			setLoading(false);
		}
	};

	const onResend = async () => {
		setResending(true);
		setResendMessage(null);
		setErrors({});
		if (codeOtpRef.current) codeOtpRef.current.value = '';

		try {
			const { data } = await api.post('/auth/resend-otp', { email });
			setAlreadyActiveMessage(null);
			setResendMessage({ type: 'success', text: data.message });
			setCooldown(60);
		} catch (err) {
			const parsed = parseApiError(err);

			if (parsed.errorCode === 'ACCOUNT_ALREADY_ACTIVE') {
				setAlreadyActiveMessage(parsed.message ?? null);
			} else {
				setAlreadyActiveMessage(null);
				setResendMessage({
					type: 'error',
					text: parsed.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
				});
			}
		} finally {
			setResending(false);
		}
	};

	useEffect(() => {
		if (cooldown === 0) return;

		const id = setInterval(() => {
			setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
		}, 1000);

		return () => clearInterval(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cooldown > 0]);

	const hasAutoResent = useRef(false);

	useEffect(() => {
		if (autoResend && email && !hasAutoResent.current) {
			hasAutoResent.current = true;
			// queueMicrotask avoids react-hooks/set-state-in-effect
			queueMicrotask(() => {
				onResend();
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<h1 className="font-heading text-3xl font-bold text-fz-ink">
				Xác thực tài khoản
			</h1>
			<p className="mt-1.5 text-[15px] text-muted-foreground">
				{email ? (
					<>
						Nhập mã 6 chữ số đã được gửi tới{' '}
						<span className="font-medium text-fz-ink">{email}</span>
					</>
				) : (
					'Nhập mã gồm 6 chữ số đã gửi tới email của bạn.'
				)}
			</p>

			<form
				onSubmit={onSubmit}
				noValidate
				className="mt-6 flex flex-col gap-4"
			>
				<input type="hidden" name="email" value={email} />

				<div>
					<label
						htmlFor="codeOtp"
						className="ml-1 text-sm font-medium text-fz-ink"
					>
						Mã xác thực
					</label>
					<Input
						ref={codeOtpRef}
						id="codeOtp"
						name="codeOtp"
						type="text"
						inputMode="numeric"
						autoComplete="one-time-code"
						maxLength={6}
						placeholder="123456"
						className={cn(
							PILL_INPUT,
							'mt-1.5 text-center text-lg tracking-[0.4em]',
						)}
					/>
					{alreadyActiveMessage ? (
						<ActionBanner
							message={alreadyActiveMessage}
							actionHref="/dang-nhap"
							actionLabel="Đăng nhập ngay"
							className="mt-3"
						/>
					) : (
						<FieldError
							message={errors.errors?.codeOtp ?? errors.message}
						/>
					)}
				</div>

				<button
					type="submit"
					disabled={loading}
					className={cn(
						buttonVariants({ variant: 'default' }),
						'h-11 w-full text-[15px]',
					)}
				>
					{loading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
				</button>
			</form>

			<div className="mt-4 text-center text-sm text-muted-foreground">
				Chưa nhận được mã?{' '}
				<button
					type="button"
					onClick={onResend}
					disabled={resending || !email || cooldown > 0}
					className="font-medium text-fz-ink underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
				>
					{resending
						? 'Đang gửi...'
						: cooldown > 0
							? `Gửi lại sau ${cooldown}s`
							: 'Gửi lại mã'}
				</button>
			</div>

			{resendMessage && (
				<p
					className={cn(
						'mt-2 text-center text-sm',
						resendMessage.type === 'success'
							? 'text-fz-ink'
							: 'text-fz-danger',
					)}
				>
					{resendMessage.text}
				</p>
			)}

			<p className="mt-2 text-center text-sm text-muted-foreground">
				Sai email?{' '}
				<Link
					href="/dang-ky"
					className="font-medium text-fz-ink underline-offset-2 hover:underline"
				>
					Đăng ký lại
				</Link>
			</p>
		</>
	);
}
