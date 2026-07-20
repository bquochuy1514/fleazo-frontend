'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Shared password field with a show/hide toggle — any masked-password form
// (login, register, profile, reset-password) uses this instead of hand-
// rolling the toggle button each time. Renders two elements (input + button)
// wrapped in one relative div, so `wrapperClassName` (margin/spacing) and
// `className` (the input's own size/text styles) are separate props.
export function PasswordInput({
	className,
	wrapperClassName,
	...props
}: Omit<React.ComponentProps<typeof Input>, 'type'> & {
	wrapperClassName?: string;
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className={cn('relative', wrapperClassName)}>
			<Input
				type={showPassword ? 'text' : 'password'}
				className={cn('pr-12', className)}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setShowPassword((prev) => !prev)}
				className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-fz-ink"
				aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
			>
				{showPassword ? (
					<EyeOff className="size-5" />
				) : (
					<Eye className="size-5" />
				)}
			</button>
		</div>
	);
}
