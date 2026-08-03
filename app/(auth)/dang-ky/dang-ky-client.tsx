'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button';
import { PasswordInput } from '@/components/form/password-input';
import { FieldError } from '@/components/form/field-error';
import { ActionBanner } from '@/components/form/action-banner';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { useAuthFormScrollTop } from '@/components/auth/auth-form-panel';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';
import { cn } from '@/lib/utils';

// Field names must match RegisterDto exactly (fleazo-backend/register.dto.ts).
type RegisterFields = 'fullName' | 'email' | 'password' | 'confirmPassword';

const PILL_INPUT = 'h-11 rounded-full px-4 text-base md:text-[15px]';

export function RegisterPageClient() {
	const router = useRouter();
	const [errors, setErrors] = useState<ApiErrorResponse<RegisterFields>>({});
	const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
	const [loading, setLoading] = useState(false);
	const scrollFormToTop = useAuthFormScrollTop();

	// Same iOS keyboard-scroll race as the login form.
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
			await api.post('/auth/register', values);

			// No tokens returned — account needs OTP verification first.
			router.push(
				`/xac-thuc-tai-khoan?email=${encodeURIComponent(String(values.email))}`,
			);
		} catch (err) {
			const parsed = parseApiError<RegisterFields>(err);
			setErrors(parsed);
			setEmailAlreadyExists(parsed.errorCode === 'EMAIL_ALREADY_EXISTS');
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-3xl font-bold text-fz-ink">
				Đăng ký
			</h1>
			<p className="mt-1.5 text-[15px] text-muted-foreground">
				Tạo tài khoản để bắt đầu mua bán trên Fleazo
			</p>

			<div className="mt-5">
				<GoogleAuthButton />
			</div>

			<div className="my-4 flex items-center gap-3">
				<span className="h-px flex-1 bg-border" aria-hidden />
				<span className="text-sm text-muted-foreground">
					Hoặc đăng ký bằng email
				</span>
				<span className="h-px flex-1 bg-border" aria-hidden />
			</div>

			<form
				onSubmit={onSubmit}
				noValidate
				className="flex flex-col gap-3"
			>
				<div>
					<label
						htmlFor="fullName"
						className="ml-1 text-sm font-medium text-fz-ink"
					>
						Họ tên
					</label>
					<Input
						id="fullName"
						name="fullName"
						type="text"
						autoComplete="name"
						placeholder="Nguyễn Văn A"
						className={cn(PILL_INPUT, 'mt-1.5')}
					/>
					<FieldError message={errors.errors?.fullName} />
				</div>

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

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label
							htmlFor="password"
							className="ml-1 text-sm font-medium text-fz-ink"
						>
							Mật khẩu
						</label>
						<PasswordInput
							id="password"
							name="password"
							autoComplete="new-password"
							placeholder="••••••••"
							wrapperClassName="mt-1.5"
							className={PILL_INPUT}
						/>
						<FieldError message={errors.errors?.password} />
					</div>

					<div>
						<label
							htmlFor="confirmPassword"
							className="ml-1 text-sm font-medium text-fz-ink"
						>
							Xác nhận
						</label>
						<PasswordInput
							id="confirmPassword"
							name="confirmPassword"
							autoComplete="new-password"
							placeholder="••••••••"
							wrapperClassName="mt-1.5"
							className={PILL_INPUT}
						/>
						<FieldError message={errors.errors?.confirmPassword} />
					</div>
				</div>

				{emailAlreadyExists ? (
					<ActionBanner
						tone="error"
						message={errors.message ?? ''}
						actionHref="/dang-nhap"
						actionLabel="Đăng nhập ngay"
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
					{loading ? 'Đang đăng ký...' : 'Đăng ký'}
				</button>
			</form>

			<p className="mt-4 text-center text-sm text-muted-foreground">
				Đã có tài khoản?{' '}
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
