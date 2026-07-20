'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/form/password-input';
import { FieldError } from '@/components/form/field-error';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { api, isAxiosError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';

type LoginFields = 'email' | 'password';

export default function LoginPage() {
	const router = useRouter();
	const [errors, setErrors] = useState<ApiErrorResponse<LoginFields>>({});
	const [rememberMe, setRememberMe] = useState(true);
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			const { data } = await api.post('/auth/login', values);

			// Remember me: with it, refresh_token persists in localStorage so
			// the (future) 401 -> refresh -> retry interceptor can keep the
			// session alive silently. Without it, only the access token goes
			// into sessionStorage and no refresh token is stored at all.
			if (rememberMe) {
				localStorage.setItem('access_token', data.access_token);
				localStorage.setItem('refresh_token', data.refresh_token);
			} else {
				sessionStorage.setItem('access_token', data.access_token);
			}

			router.push('/');
		} catch (err) {
			const res = isAxiosError<ApiErrorResponse<LoginFields>>(err)
				? err.response?.data
				: undefined;

			setErrors(
				res?.errors && Object.keys(res.errors).length > 0
					? { errors: res.errors }
					: {
							message:
								res?.message ??
								'Đã có lỗi xảy ra, vui lòng thử lại.',
						},
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-3xl font-semibold text-fz-ink sm:text-4xl">
				Đăng nhập
			</h1>
			<p className="mt-2 text-base text-muted-foreground">
				Chào mừng quay lại Fleazo
			</p>

			<div className="mt-8">
				<GoogleAuthButton />
			</div>

			<div className="my-6 flex items-center gap-3">
				<span className="h-px flex-1 bg-border" aria-hidden="true" />
				<span className="text-sm text-muted-foreground">
					Hoặc đăng nhập bằng email
				</span>
				<span className="h-px flex-1 bg-border" aria-hidden="true" />
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="email"
						className="text-base font-medium text-fz-ink"
					>
						Email
					</label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="example@gmail.com"
						className="mt-2 h-12 text-base"
					/>
					<FieldError message={errors.errors?.email} />
				</div>

				<div>
					<label
						htmlFor="password"
						className="text-base font-medium text-fz-ink"
					>
						Mật khẩu
					</label>
					<PasswordInput
						id="password"
						name="password"
						placeholder="••••••••"
						wrapperClassName="mt-2"
						className="h-12 text-base"
					/>
					<FieldError message={errors.errors?.password} />

					<div className="mt-3 flex items-center justify-between">
						<label className="flex items-center gap-2 text-sm text-fz-ink">
							<Checkbox
								checked={rememberMe}
								onCheckedChange={(checked) =>
									setRememberMe(checked === true)
								}
							/>
							Ghi nhớ đăng nhập
						</label>
						<Link
							href="/forgot-password"
							tabIndex={-1}
							className="text-sm text-fz-primary hover:underline"
						>
							Quên mật khẩu?
						</Link>
					</div>
				</div>

				<FieldError message={errors.message} />

				<Button
					type="submit"
					variant="default"
					className="h-12 w-full text-base"
					disabled={loading}
				>
					{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
				</Button>
			</form>

			<p className="mt-4 text-center text-base text-muted-foreground">
				Chưa có tài khoản?{' '}
				<Link
					href="/register"
					className="font-medium text-fz-primary hover:underline"
				>
					Đăng ký
				</Link>
			</p>
		</>
	);
}
