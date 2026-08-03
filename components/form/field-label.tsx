import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shared field label — icon optional, so both callers share one component.
export function FieldLabel({
	icon: Icon,
	htmlFor,
	// Required fields get a small rust `*`; unmarked means optional.
	required,
	className,
	children,
}: {
	icon?: LucideIcon;
	htmlFor?: string;
	required?: boolean;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<label
			htmlFor={htmlFor}
			className={cn(
				'flex items-center gap-1.5 text-sm font-medium text-fz-ink',
				className,
			)}
		>
			{Icon && <Icon className="size-3.5 text-muted-foreground" />}
			{children}
			{required && (
				<span className="text-fz-danger" aria-hidden="true">
					*
				</span>
			)}
		</label>
	);
}
