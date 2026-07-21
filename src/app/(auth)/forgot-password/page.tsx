'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/form/field-error';
import { ActionBanner } from '@/components/form/action-banner';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';

// Field name must match ForgotPasswordDto (fleazo-backend/forgot-password.dto.ts).
type ForgotPasswordFields = 'email';

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [errors, setErrors] = useState<
		ApiErrorResponse<ForgotPasswordFields>
	>({});
	// Two different errorCodes here each want their own suggested action
	// (register vs verify-account) — one object beats two booleans that
	// could otherwise both end up true at once.
	const [actionBanner, setActionBanner] = useState<{
		message: string;
		href: string;
		label: string;
	} | null>(null);
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/forgot-password', values);

			router.push(
				`/verify-forgot-otp?email=${encodeURIComponent(String(values.email))}`,
			);
		} catch (err) {
			const parsed = parseApiError<ForgotPasswordFields>(err);
			setErrors(parsed);

			if (parsed.errorCode === 'EMAIL_NOT_FOUND') {
				setActionBanner({
					message: parsed.message ?? '',
					href: '/register',
					label: 'Đăng ký ngay',
				});
			} else if (parsed.errorCode === 'ACCOUNT_NOT_VERIFIED') {
				setActionBanner({
					message: parsed.message ?? '',
					href: `/verify-account?email=${encodeURIComponent(String(values.email))}&autoResend=true`,
					label: 'Xác thực ngay',
				});
			} else {
				setActionBanner(null);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-2xl font-semibold text-fz-ink sm:text-3xl">
				Quên mật khẩu
			</h1>
			<p className="mt-1.5 text-sm text-muted-foreground">
				Nhập email để nhận mã xác thực đặt lại mật khẩu
			</p>

			<form onSubmit={onSubmit} className="mt-4 space-y-2">
				<div>
					<label
						htmlFor="email"
						className="text-sm font-medium text-fz-ink"
					>
						Email
					</label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="example@gmail.com"
						className="mt-1.5 h-11 text-sm"
					/>
					{actionBanner ? (
						<ActionBanner
							message={actionBanner.message}
							actionHref={actionBanner.href}
							actionLabel={actionBanner.label}
							className="my-3"
						/>
					) : (
						<FieldError
							message={errors.errors?.email ?? errors.message}
						/>
					)}
				</div>

				<Button
					type="submit"
					variant="default"
					className="h-11 w-full text-sm"
					disabled={loading}
				>
					{loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
				</Button>
			</form>

			<p className="mt-4 text-center text-sm text-muted-foreground">
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
