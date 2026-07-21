'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/form/field-error';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';

// Field names must match VerifyForgotOtpDto (fleazo-backend/verify-forgot-otp.dto.ts).
type VerifyForgotOtpFields = 'email' | 'codeOtp';

// useSearchParams needs a Suspense boundary (Next.js build requirement)
export default function VerifyForgotOtpPage() {
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

	const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/verify-forgot-otp', values);

			router.push(`/reset-password?email=${encodeURIComponent(email)}`);
		} catch (err) {
			setErrors(parseApiError<VerifyForgotOtpFields>(err));
		} finally {
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
			const { data } = await api.post('/auth/forgot-password', {
				email,
			});
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
			<h1 className="font-heading text-2xl font-semibold text-fz-ink sm:text-3xl">
				Xác thực mã OTP
			</h1>
			<p className="mt-1.5 text-sm text-muted-foreground">
				{email ? (
					<>
						Nhập mã 6 chữ số đã được gửi tới{' '}
						<span className="font-medium text-fz-ink">{email}</span>
					</>
				) : (
					'Nhập mã gồm 6 chữ số đã gửi tới email của bạn.'
				)}
			</p>

			<form onSubmit={onSubmit} className="mt-4 space-y-2">
				<input type="hidden" name="email" value={email} />

				<div>
					<label
						htmlFor="codeOtp"
						className="text-sm font-medium text-fz-ink"
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
						className="mt-1.5 h-11 text-center text-lg tracking-[0.5em]"
					/>
					<FieldError
						message={errors.errors?.codeOtp ?? errors.message}
					/>
				</div>

				<Button
					type="submit"
					variant="default"
					className="h-11 w-full text-sm"
					disabled={loading}
				>
					{loading ? 'Đang xác thực...' : 'Xác thực'}
				</Button>
			</form>

			<div className="mt-4 text-center text-sm text-muted-foreground">
				Chưa nhận được mã?{' '}
				<button
					type="button"
					onClick={onResend}
					disabled={resending || !email || cooldown > 0}
					className="cursor-pointer font-medium text-fz-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
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
					className={`mt-2 text-center text-sm ${
						resendMessage.type === 'success'
							? 'text-fz-primary'
							: 'text-destructive'
					}`}
				>
					{resendMessage.text}
				</p>
			)}

			<p className="mt-2 text-center text-sm text-muted-foreground">
				Nhớ mật khẩu rồi?{' '}
				<Link
					href="/login"
					className="font-medium text-fz-primary hover:underline"
				>
					Đăng nhập
				</Link>
			</p>
		</>
	);
}
