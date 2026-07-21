'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/form/field-error';
import { api, isAxiosError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';

type VerifyFields = 'email' | 'codeOtp';

// useSearchParams needs a Suspense boundary or Next.js fails the build
// ("should be wrapped in a suspense boundary") — the actual page stays a
// thin wrapper so that requirement doesn't leak into the real component.
export default function VerifyAccountPage() {
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

	const [errors, setErrors] = useState<ApiErrorResponse<VerifyFields>>({});
	// Holds the backend's own message, not a hardcoded string — this banner
	// can be triggered from onSubmit OR onResend, so `errors.message` alone
	// wouldn't cover the resend case.
	const [alreadyActiveMessage, setAlreadyActiveMessage] = useState<
		string | null
	>(null);
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	const [resendMessage, setResendMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/verify-otp', values);

			// handleVerifyOtp doesn't return tokens either — account is just
			// active now, still needs a normal login afterwards.
			router.push('/login');
		} catch (err) {
			const res = isAxiosError<ApiErrorResponse<VerifyFields>>(err)
				? err.response?.data
				: undefined;
			const hasFieldErrors =
				res?.errors && Object.keys(res.errors).length > 0;

			setErrors(
				hasFieldErrors
					? { errors: res.errors }
					: {
							message:
								res?.message ??
								'Đã có lỗi xảy ra, vui lòng thử lại.',
						},
			);

			// errorCode matches src/common/constants/error-code.constant.ts
			// on the backend — branch on this, never on message text.
			setAlreadyActiveMessage(
				res?.errorCode === 'ACCOUNT_ALREADY_ACTIVE'
					? (res?.message ?? null)
					: null,
			);
		} finally {
			setLoading(false);
		}
	};

	const onResend = async () => {
		setResending(true);
		setResendMessage(null);

		try {
			const { data } = await api.post('/auth/resend-otp', { email });
			setAlreadyActiveMessage(null);
			setResendMessage({ type: 'success', text: data.message });
		} catch (err) {
			const res = isAxiosError<ApiErrorResponse>(err)
				? err.response?.data
				: undefined;

			if (res?.errorCode === 'ACCOUNT_ALREADY_ACTIVE') {
				setAlreadyActiveMessage(res.message ?? null);
			} else {
				setAlreadyActiveMessage(null);
				setResendMessage({
					type: 'error',
					text: res?.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
				});
			}
		} finally {
			setResending(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-2xl font-semibold text-fz-ink sm:text-3xl">
				Xác thực tài khoản
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

			<form onSubmit={onSubmit} className="mt-4 space-y-4">
				<input type="hidden" name="email" value={email} />

				<div>
					<label
						htmlFor="codeOtp"
						className="text-sm font-medium text-fz-ink"
					>
						Mã xác thực
					</label>
					<Input
						id="codeOtp"
						name="codeOtp"
						type="text"
						inputMode="numeric"
						autoComplete="one-time-code"
						maxLength={6}
						placeholder="123456"
						className="mt-1.5 h-11 text-center text-lg tracking-[0.5em]"
					/>
					{alreadyActiveMessage ? (
						<div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl bg-fz-primary-soft px-4 py-3 text-sm text-fz-ink">
							<span>{alreadyActiveMessage}</span>
							<Link
								href="/login"
								className="font-medium text-fz-primary hover:underline"
							>
								Đăng nhập ngay
							</Link>
						</div>
					) : (
						<FieldError
							message={errors.errors?.codeOtp ?? errors.message}
						/>
					)}
				</div>

				<Button
					type="submit"
					variant="default"
					className="h-11 w-full text-sm"
					disabled={loading}
				>
					{loading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
				</Button>
			</form>

			<div className="mt-4 text-center text-sm text-muted-foreground">
				Chưa nhận được mã?{' '}
				<button
					type="button"
					onClick={onResend}
					disabled={resending || !email}
					className="cursor-pointer font-medium text-fz-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
				>
					{resending ? 'Đang gửi...' : 'Gửi lại mã'}
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

			<p className="mt-4 text-center text-sm text-muted-foreground">
				Sai email?{' '}
				<Link
					href="/register"
					className="font-medium text-fz-primary hover:underline"
				>
					Đăng ký lại
				</Link>
			</p>
		</>
	);
}
