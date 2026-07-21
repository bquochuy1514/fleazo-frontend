'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/form/field-error';
import { ActionBanner } from '@/components/form/action-banner';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';

type VerifyFields = 'email' | 'codeOtp';

// useSearchParams needs a Suspense boundary (Next.js build requirement)
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
	// Set by the login banner only — see AGENTS.md → Auth Flow
	const autoResend = searchParams.get('autoResend') === 'true';

	const [errors, setErrors] = useState<ApiErrorResponse<VerifyFields>>({});
	// Real backend message, not hardcoded — covers both onSubmit and onResend
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

	const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/verify-otp', values);

			// no tokens returned — still needs a normal login after
			router.push('/login?verified=true');
		} catch (err) {
			const parsed = parseApiError<VerifyFields>(err);
			setErrors(parsed);
			setAlreadyActiveMessage(
				parsed.errorCode === 'ACCOUNT_ALREADY_ACTIVE'
					? (parsed.message ?? null)
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
			setCooldown(60);
		} catch (err) {
			const parsed = parseApiError(err);

			if (parsed.errorCode === 'ACCOUNT_ALREADY_ACTIVE') {
				setAlreadyActiveMessage(parsed.message ?? null);
			} else {
				setAlreadyActiveMessage(null);
				setResendMessage({
					type: 'error',
					text:
						parsed.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
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
						<ActionBanner
							message={alreadyActiveMessage}
							actionHref="/login"
							actionLabel="Đăng nhập ngay"
							className="my-3"
						/>
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
