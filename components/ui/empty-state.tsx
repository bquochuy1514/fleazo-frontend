import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dashed border, not a solid card — it reads as "a container that could hold
// something" rather than as content in its own right.
export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center sm:rounded-3xl sm:py-20',
				className,
			)}
		>
			<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<Icon aria-hidden className="size-5" />
			</span>
			<p className="font-heading text-base font-semibold tracking-tight text-fz-ink">
				{title}
			</p>
			{description && (
				<p className="max-w-sm text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			)}
			{action && <div className="mt-1">{action}</div>}
		</div>
	);
}
