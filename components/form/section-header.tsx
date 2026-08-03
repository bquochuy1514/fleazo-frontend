import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// Card-group header — echoes the homepage hero's eyebrow style rather than a
// generic bordered heading.
export function SectionHeader({
	icon: Icon,
	title,
	action,
	// Marks the whole section required when it has no per-field FieldLabel.
	required,
}: {
	icon: LucideIcon;
	title: string;
	action?: ReactNode;
	required?: boolean;
}) {
	return (
		<div className="mb-4 flex items-center gap-2.5">
			<Icon className="size-4 shrink-0 text-muted-foreground" />
			<h2 className="font-heading text-xs font-semibold tracking-[0.14em] text-fz-ink uppercase">
				{title}
				{required && (
					<span className="text-fz-danger" aria-hidden="true">
						{' '}
						*
					</span>
				)}
			</h2>
			<span aria-hidden className="h-px flex-1 bg-border" />
			{action}
		</div>
	);
}
