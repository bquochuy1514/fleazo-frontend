'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button';
import { FieldError } from '@/components/form/field-error';
import { useAuthFormScrollTop } from '@/components/auth/auth-form-panel';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';
import { cn } from '@/lib/utils';

// Field names must match VerifyForgotOtpDto (fleazo-backend/verify-forgot-otp.dto.ts).
type VerifyForgotOtpFields = 'email' | 'codeOtp';

const PILL_INPUT = 'h-11 rounded-full px-4 text-base md:text-[15px]';

// useSearchParams needs a Suspense boundary (Next build requirement).
export function VerifyForgotOtpPageClient() {
	return (
		<Suspense fallback={null}>
			<VerifyForgotOtpForm />
		</Suspense>
	);
}

function VerifyForgotOtpForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get('email') ?? '';

	const [errors, setErrors] = useState<
		ApiErrorResponse<VerifyForgotOtpFields>
	>({});
	const codeOtpRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	// forgot-password just sent a code right before redirecting here —
	// cooldown starts hot, not at 0, so resend can't fire redundantly.
	const [cooldown, setCooldown] = useState(60);
	const [resendMessage, setResendMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);
	const scrollFormToTop = useAuthFormScrollTop();

	// Same iOS keyboard-scroll race as dang-nhap/page.tsx — see that file's
	// comment for the full explanation.
	useEffect(() => {
		if (!errors.message && !errors.errors) return;
		scrollFormToTop();
		const id = setTimeout(scrollFormToTop, 350);
		return () => clearTimeout(id);
	}, [errors, scrollFormToTop]);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		(document.activeElement as HTMLElement | null)?.blur();
		setLoading(true);
		setErrors({});

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/verify-forgot-otp', values);

			router.push(`/dat-lai-mat-khau?email=${encodeURIComponent(email)}`);
		} catch (err) {
			setErrors(parseApiError<VerifyForgotOtpFields>(err));
			setLoading(false);
		}
	};

	const onResend = async () => {
		setResending(true);
		setResendMessage(null);
		setErrors({});
		if (codeOtpRef.current) codeOtpRef.current.value = '';

		try {
			// No separate resend endpoint — forgot-password itself
			// regenerates and re-sends the OTP every time it's called.
			const { data } = await api.post('/auth/forgot-password', { email });
			setResendMessage({ type: 'success', text: data.message });
			setCooldown(60);
		} catch (err) {
			const parsed = parseApiError(err);
			setResendMessage({
				type: 'error',
				text: parsed.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
			});
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

	return (
		<>
			<h1 className="font-heading text-3xl font-bold text-fz-ink">
				Xác thực mã OTP
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
					<FieldError
						message={errors.errors?.codeOtp ?? errors.message}
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className={cn(
						buttonVariants({ variant: 'default' }),
						'h-11 w-full text-[15px]',
					)}
				>
					{loading ? 'Đang xác thực...' : 'Xác thực'}
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
				Nhớ mật khẩu rồi?{' '}
				<Link
					href="/dang-nhap"
					className="font-medium text-fz-ink underline-offset-2 hover:underline"
				>
					Đăng nhập
				</Link>
			</p>
		</>
	);
}
