'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/form/password-input';
import { FieldError } from '@/components/form/field-error';
import { ActionBanner } from '@/components/form/action-banner';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { api, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';

// Field names must match RegisterDto exactly (fleazo-backend/register.dto.ts).
type RegisterFields = 'fullName' | 'email' | 'password' | 'confirmPassword';

export default function RegisterPage() {
	const router = useRouter();
	const [errors, setErrors] = useState<ApiErrorResponse<RegisterFields>>({});
	const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			await api.post('/auth/register', values);

			// handleRegister doesn't return tokens — account needs OTP
			// verification before it can log in. Carry the email over so
			// verify-account doesn't have to ask for it again.
			router.push(
				`/verify-account?email=${encodeURIComponent(String(values.email))}`,
			);
		} catch (err) {
			const parsed = parseApiError<RegisterFields>(err);
			setErrors(parsed);
			setEmailAlreadyExists(parsed.errorCode === 'EMAIL_ALREADY_EXISTS');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-2xl font-semibold text-fz-ink sm:text-3xl">
				Đăng ký
			</h1>
			<p className="mt-1.5 text-sm text-muted-foreground">
				Tạo tài khoản để bắt đầu mua bán trên Fleazo
			</p>

			<div className="mt-4">
				<GoogleAuthButton />
			</div>

			<div className="my-4 flex items-center gap-3">
				<span className="h-px flex-1 bg-border" aria-hidden="true" />
				<span className="text-sm text-muted-foreground">
					Hoặc đăng ký bằng email
				</span>
				<span className="h-px flex-1 bg-border" aria-hidden="true" />
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="fullName"
						className="text-sm font-medium text-fz-ink"
					>
						Họ tên
					</label>
					<Input
						id="fullName"
						name="fullName"
						type="text"
						placeholder="Nguyễn Văn A"
						className="mt-1.5 h-11 text-sm"
					/>
					<FieldError message={errors.errors?.fullName} />
				</div>

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
					<FieldError message={errors.errors?.email} />
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label
							htmlFor="password"
							className="text-sm font-medium text-fz-ink"
						>
							Mật khẩu
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

				{emailAlreadyExists ? (
					<ActionBanner
						message={errors.message ?? ''}
						actionHref="/login"
						actionLabel="Đăng nhập ngay"
						className="my-3"
					/>
				) : (
					<FieldError message={errors.message} />
				)}

				<Button
					type="submit"
					variant="default"
					className="h-11 w-full text-sm"
					disabled={loading}
				>
					{loading ? 'Đang đăng ký...' : 'Đăng ký'}
				</Button>
			</form>

			<p className="mt-4 text-center text-sm text-muted-foreground">
				Đã có tài khoản?{' '}
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
