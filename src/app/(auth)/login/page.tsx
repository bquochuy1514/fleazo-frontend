'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { api } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
	const router = useRouter();
	const [errors, setErrors] = useState<{
		email?: string;
		password?: string;
		general?: string;
	}>({});
	const [rememberMe, setRememberMe] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			const { data } = await api.post('/auth/login', values);

			if (rememberMe) {
				localStorage.setItem('access_token', data.access_token);
				localStorage.setItem('refresh_token', data.refresh_token);
			} else {
				sessionStorage.setItem('access_token', data.access_token);
			}

			router.push('/');
		} catch (err: any) {
			const res = err.response?.data;
			const fieldErrors = res?.errors ?? {};

			setErrors({
				email: fieldErrors.email,
				password: fieldErrors.password,
				general:
					!fieldErrors.email && !fieldErrors.password
						? (res?.message ??
							'Đã có lỗi xảy ra, vui lòng thử lại.')
						: undefined,
			});
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

			<form onSubmit={onSubmit} className="space-y-5">
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
					{errors.email && (
						<p className="mt-1.5 text-sm text-destructive">
							{errors.email}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="password"
						className="text-base font-medium text-fz-ink"
					>
						Mật khẩu
					</label>
					<div className="relative mt-2">
						<Input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							className="h-12 pr-12 text-base"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute cursor-pointer top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-fz-ink"
							aria-label={
								showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
							}
						>
							{showPassword ? (
								<EyeOff className="size-5" />
							) : (
								<Eye className="size-5" />
							)}
						</button>
					</div>
					{errors.password && (
						<p className="mt-1.5 text-sm text-destructive">
							{errors.password}
						</p>
					)}

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

				{errors.general && (
					<p className="text-sm text-destructive">{errors.general}</p>
				)}

				<Button
					type="submit"
					variant="default"
					className="h-12 w-full text-base"
					disabled={loading}
				>
					{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
				</Button>
			</form>

			<p className="mt-8 text-center text-base text-muted-foreground">
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
