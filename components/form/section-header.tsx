import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// Card-group header — echoes the hero's eyebrow (tracked uppercase label +
// hairline, see app/(main)/(public)/page.tsx) rather than a generic bordered
// heading, so the form still reads as Fleazo rather than a bare admin form.
export function SectionHeader({
	icon: Icon,
	title,
	action,
	// Marks a whole section as required when it has no per-field FieldLabel
	// of its own. A group with mixed-required sub-fields should leave this
	// unmarked and put `required` on the specific field instead.
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
