'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/form/password-input';
import { FieldError } from '@/components/form/field-error';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';

// Field names assumed to match ResetPasswordDto (fleazo-backend/reset-password.dto.ts).
// handleResetPassword only destructures email/password — confirmPassword
// isn't read there either, same as RegisterDto's confirmPassword (only
// used by class-validator's @Match, never touched in service logic).
// Confirm against the real DTO if this turns out wrong.
type ResetPasswordFields = 'email' | 'password' | 'confirmPassword';

// useSearchParams needs a Suspense boundary (Next.js build requirement)
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

	const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/reset-password', values);

			// no tokens returned — still needs a normal login after
			router.push('/login?passwordReset=true');
		} catch (err) {
			setErrors(parseApiError<ResetPasswordFields>(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-2xl font-semibold text-fz-ink sm:text-3xl">
				Đặt lại mật khẩu
			</h1>
			<p className="mt-1.5 text-sm text-muted-foreground">
				Tạo mật khẩu mới cho tài khoản của bạn
			</p>

			<form onSubmit={onSubmit} className="mt-6 space-y-2">
				<input type="hidden" name="email" value={email} />

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label
							htmlFor="password"
							className="text-sm font-medium text-fz-ink"
						>
							Mật khẩu mới
						</label>
						<PasswordInput
							id="password"
							name="password"
							placeholder="••••••••"
							wrapperClassName="mt-1.5"
							className="h-11 text-sm"
						/>
						<FieldError message={errors.errors?.password} />
					</div>

					<div>
						<label
							htmlFor="confirmPassword"
							className="text-sm font-medium text-fz-ink"
						>
							Xác nhận
						</label>
						<PasswordInput
							id="confirmPassword"
							name="confirmPassword"
							placeholder="••••••••"
							wrapperClassName="mt-1.5"
							className="h-11 text-sm"
						/>
						<FieldError message={errors.errors?.confirmPassword} />
					</div>
				</div>

				<FieldError message={errors.message} />

				<Button
					type="submit"
					variant="default"
					className="h-11 w-full text-sm"
					disabled={loading}
				>
					{loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
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
