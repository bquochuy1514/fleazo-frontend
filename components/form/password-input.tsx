'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Wraps Input rather than growing a `type` toggle onto it directly — the
// eye button needs to sit INSIDE the field's own padding, which only makes
// sense for this one field type, not something every Input caller should
// carry.
export const PasswordInput = React.forwardRef<
	HTMLInputElement,
	Omit<React.ComponentProps<'input'>, 'type'> & { wrapperClassName?: string }
>(function PasswordInput({ className, wrapperClassName, ...props }, ref) {
	const [visible, setVisible] = React.useState(false);

	return (
		<div className={cn('relative', wrapperClassName)}>
			<Input
				ref={ref}
				type={visible ? 'text' : 'password'}
				className={cn('pr-11', className)}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
				// aria-pressed, not a second aria-label swap alone — a toggle's
				// own state needs to be announced, not just its next action.
				aria-pressed={visible}
				className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground outline-none hover:text-fz-ink focus-visible:text-fz-ink focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
			>
				{visible ? (
					<EyeOff className="size-[18px]" />
				) : (
					<Eye className="size-[18px]" />
				)}
			</button>
		</div>
	);
});
