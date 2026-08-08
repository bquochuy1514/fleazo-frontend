'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { FieldError } from '@/components/form/field-error';
import { FieldLabel } from '@/components/form/field-label';
import { PasswordInput } from '@/components/form/password-input';
import { useAuth } from '@/hooks/use-auth';
import { api, getStoredAccessToken, parseApiError } from '@/lib/api';
import type { ApiErrorResponse } from '@/types/api.types';

type PasswordFields =
	| 'currentPassword'
	| 'newPassword'
	| 'confirmNewPassword'
	| 'password'
	| 'confirmPassword';

export function PasswordDialog({
	open,
	onOpenChange,
	hasPassword,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	hasPassword: boolean;
}) {
	const { login } = useAuth();
	const [isSaving, setIsSaving] = useState(false);
	const [errors, setErrors] = useState<ApiErrorResponse<PasswordFields>>({});

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrors({});
		setIsSaving(true);
		const values = Object.fromEntries(new FormData(event.currentTarget));

		try {
			if (hasPassword) {
				await api.put('/users/me/change-password', {
					currentPassword: values.currentPassword,
					newPassword: values.newPassword,
					confirmNewPassword: values.confirmNewPassword,
				});
			} else {
				await api.post('/auth/set-initial-password', {
					password: values.password,
					confirmPassword: values.confirmPassword,
				});
			}

			const token = getStoredAccessToken();
			if (token) await login(token);
			toast.success(
				hasPassword ? 'Đã đổi mật khẩu.' : 'Đã thêm mật khẩu.',
			);
			onOpenChange(false);
		} catch (error) {
			setErrors(parseApiError<PasswordFields>(error));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="font-heading text-xl font-bold tracking-tight">
						{hasPassword ? 'Đổi mật khẩu' : 'Thêm mật khẩu'}
					</DialogTitle>
					<DialogDescription>
						{hasPassword
							? 'Dùng một mật khẩu mới, riêng tư và khó đoán.'
							: 'Thêm mật khẩu để có thể đăng nhập Fleazo ngoài Google.'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{hasPassword && (
						<div>
							<FieldLabel htmlFor="currentPassword" required>
								Mật khẩu hiện tại
							</FieldLabel>
							<PasswordInput
								id="currentPassword"
								name="currentPassword"
								required
								autoComplete="current-password"
								wrapperClassName="mt-1.5"
								className="h-11"
							/>
							<FieldError
								message={errors.errors?.currentPassword}
							/>
						</div>
					)}

					<div>
						<FieldLabel htmlFor="newPassword" required>
							Mật khẩu mới
						</FieldLabel>
						<PasswordInput
							id="newPassword"
							name={hasPassword ? 'newPassword' : 'password'}
							required
							autoComplete="new-password"
							wrapperClassName="mt-1.5"
							className="h-11"
						/>
						<FieldError
							message={
								hasPassword
									? errors.errors?.newPassword
									: errors.errors?.password
							}
						/>
					</div>

					<div>
						<FieldLabel htmlFor="confirmPassword" required>
							Xác nhận mật khẩu mới
						</FieldLabel>
						<PasswordInput
							id="confirmPassword"
							name={
								hasPassword
									? 'confirmNewPassword'
									: 'confirmPassword'
							}
							required
							autoComplete="new-password"
							wrapperClassName="mt-1.5"
							className="h-11"
						/>
						<FieldError
							message={
								hasPassword
									? errors.errors?.confirmNewPassword
									: errors.errors?.confirmPassword
							}
						/>
					</div>

					<FieldError message={errors.message} />
					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSaving}
							className="h-11"
						>
							Hủy
						</Button>
						<Button
							type="submit"
							disabled={isSaving}
							className="h-11"
						>
							{isSaving ? 'Đang lưu...' : 'Lưu mật khẩu'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
