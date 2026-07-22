'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/form/password-input';
import { FieldError } from '@/components/form/field-error';
import { ActionBanner } from '@/components/form/action-banner';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { api, parseApiError } from '@/lib/api';
import { setSessionFlag } from '@/lib/session-flag';
import type { ApiErrorResponse } from '@/types/api.types';
import { useAuth } from '@/hooks/use-auth';

type LoginFields = 'email' | 'password';

// useSearchParams needs a Suspense boundary (Next.js build requirement)
export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginForm />
		</Suspense>
	);
}

function LoginForm() {
	const auth = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const successMessage =
		searchParams.get('verified') === 'true'
			? 'Xác thực tài khoản thành công! Đăng nhập để tiếp tục.'
			: searchParams.get('passwordReset') === 'true'
				? 'Đặt lại mật khẩu thành công! Đăng nhập để tiếp tục.'
				: null;

	const [errors, setErrors] = useState<ApiErrorResponse<LoginFields>>({});
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
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

			setSessionFlag(rememberMe);
			await auth.login(data.access_token);

			router.push('/');
		} catch (err) {
			const parsed = parseApiError<LoginFields>(err);
			setErrors(parsed);
			setUnverifiedEmail(
				parsed.errorCode === 'ACCOUNT_NOT_VERIFIED'
					? String(values.email)
					: null,
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h1 className="font-heading text-2xl font-semibold text-fz-ink sm:text-3xl">
				Đăng nhập
			</h1>
			<p className="mt-1.5 text-sm text-muted-foreground">
				Chào mừng quay lại Fleazo
			</p>

			{successMessage && (
				<ActionBanner message={successMessage} className="mt-4" />
			)}

			<div className="mt-4">
				<GoogleAuthButton />
			</div>

			<div className="my-4 flex items-center gap-3">
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

					<div className="mt-2 flex items-center justify-between">
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
							href="/quen-mat-khau"
							tabIndex={-1}
							className="text-sm text-fz-primary hover:underline"
						>
							Quên mật khẩu?
						</Link>
					</div>
				</div>

				{unverifiedEmail ? (
					<ActionBanner
						message={errors.message ?? ''}
						actionHref={`/verify-account?email=${encodeURIComponent(unverifiedEmail)}&autoResend=true`}
						actionLabel="Xác thực ngay"
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
					{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
				</Button>
			</form>

			<p className="mt-4 text-center text-sm text-muted-foreground">
				Chưa có tài khoản?{' '}
				<Link
					href="/dang-ky"
					className="font-medium text-fz-primary hover:underline"
				>
					Đăng ký
				</Link>
			</p>
		</>
	);
}
