'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { PasswordInput } from '@/components/form/password-input';
import { FieldError } from '@/components/form/field-error';
import { useAuthFormScrollTop } from '@/components/auth/auth-form-panel';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';
import { cn } from '@/lib/utils';

// Field names assumed to match ResetPasswordDto (fleazo-backend/reset-password.dto.ts).
// handleResetPassword only destructures email/password — confirmPassword
// isn't read there either, same as RegisterDto's confirmPassword (only
// used by class-validator's @Match, never touched in service logic).
type ResetPasswordFields = 'email' | 'password' | 'confirmPassword';

const PILL_INPUT = 'h-11 rounded-full px-4 text-base md:text-[15px]';

// useSearchParams needs a Suspense boundary (Next build requirement).
export default function ResetPasswordPage() {
	return (
		<Suspense fallback={null}>
			<ResetPasswordForm />
		</Suspense>
	);
}

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get('email') ?? '';

	const [errors, setErrors] = useState<ApiErrorResponse<ResetPasswordFields>>(
		{},
	);
	const [loading, setLoading] = useState(false);
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
			await api.post('/auth/reset-password', values);

			// no tokens returned — still needs a normal login after
			router.push('/dang-nhap?passwordReset=true');
		} catch (err) {
			setErrors(parseApiError<ResetPasswordFields>(err));
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-3xl font-bold text-fz-ink">
				Đặt lại mật khẩu
			</h1>
			<p className="mt-1.5 text-[15px] text-muted-foreground">
				Tạo mật khẩu mới cho tài khoản của bạn
			</p>

			<form
				onSubmit={onSubmit}
				noValidate
				className="mt-6 flex flex-col gap-4"
			>
				<input type="hidden" name="email" value={email} />

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label
							htmlFor="password"
							className="ml-1 text-sm font-medium text-fz-ink"
						>
							Mật khẩu mới
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

				{errors.message && <FieldError message={errors.message} />}

				<button
					type="submit"
					disabled={loading}
					className={cn(
						buttonVariants({ variant: 'default' }),
						'h-11 w-full text-[15px]',
					)}
				>
					{loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
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
