import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shared field label — icon is optional (dang-tin's fields have none,
// complete-profile-modal's do) so both callers can share one component
// instead of each keeping its own local copy.
export function FieldLabel({
	icon: Icon,
	htmlFor,
	// Required fields get a small rust `*` — unmarked means optional. Rust,
	// not moss: this is a plain "required" convention, unrelated to the
	// error-state meaning FieldError also uses rust for, and moss stays
	// reserved for price tags/the save toggle (see AGENTS.md → Design System).
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
