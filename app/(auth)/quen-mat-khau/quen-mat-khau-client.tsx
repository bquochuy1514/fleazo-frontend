'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button';
import { FieldError } from '@/components/form/field-error';
import { ActionBanner } from '@/components/form/action-banner';
import { useAuthFormScrollTop } from '@/components/auth/auth-form-panel';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';
import { cn } from '@/lib/utils';

// Field name must match ForgotPasswordDto (fleazo-backend/forgot-password.dto.ts).
type ForgotPasswordFields = 'email';

const PILL_INPUT = 'h-11 rounded-full px-4 text-base md:text-[15px]';

export function ForgotPasswordPageClient() {
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
	const scrollFormToTop = useAuthFormScrollTop();

	// Same iOS keyboard-scroll race as dang-nhap/page.tsx — see that file's
	// comment for the full explanation.
	useEffect(() => {
		if (!errors.message && !errors.errors && !actionBanner) return;
		scrollFormToTop();
		const id = setTimeout(scrollFormToTop, 350);
		return () => clearTimeout(id);
	}, [errors, actionBanner, scrollFormToTop]);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		(document.activeElement as HTMLElement | null)?.blur();
		setLoading(true);
		setErrors({});
		setActionBanner(null);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/forgot-password', values);

			router.push(
				`/xac-thuc-otp-quen-mat-khau?email=${encodeURIComponent(String(values.email))}`,
			);
		} catch (err) {
			const parsed = parseApiError<ForgotPasswordFields>(err);
			setErrors(parsed);

			if (parsed.errorCode === 'EMAIL_NOT_FOUND') {
				setActionBanner({
					message: parsed.message ?? '',
					href: '/dang-ky',
					label: 'Đăng ký ngay',
				});
			} else if (parsed.errorCode === 'ACCOUNT_NOT_VERIFIED') {
				setActionBanner({
					message: parsed.message ?? '',
					href: `/xac-thuc-tai-khoan?email=${encodeURIComponent(String(values.email))}&autoResend=true`,
					label: 'Xác thực ngay',
				});
			}
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-3xl font-bold text-fz-ink">
				Quên mật khẩu
			</h1>
			<p className="mt-1.5 text-[15px] text-muted-foreground">
				Nhập email để nhận mã xác thực đặt lại mật khẩu
			</p>

			<form
				onSubmit={onSubmit}
				noValidate
				className="mt-6 flex flex-col gap-4"
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
					{actionBanner ? (
						<ActionBanner
							tone="error"
							message={actionBanner.message}
							actionHref={actionBanner.href}
							actionLabel={actionBanner.label}
							className="mt-3"
						/>
					) : (
						<FieldError
							message={errors.errors?.email ?? errors.message}
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
					{loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
				</button>
			</form>

			<p className="mt-4 text-center text-sm text-muted-foreground">
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
