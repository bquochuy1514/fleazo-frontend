import Link from 'next/link';
import { cn } from '@/lib/utils';

// Shared "info + optional action" banner — a backend message paired with a
// suggested next step (verify now, log in now, ...). Action is optional:
// omit actionHref/actionLabel for a plain message banner (e.g. a success
// notice with nothing to click). See AGENTS.md → Form Conventions.
type ActionBannerProps = {
	message: string;
	actionHref?: string;
	actionLabel?: string;
	className?: string;
};

export function ActionBanner({
	message,
	actionHref,
	actionLabel,
	className,
}: ActionBannerProps) {
	return (
		<div
			className={cn(
				'flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl bg-fz-primary-soft px-4 py-3 text-sm text-fz-ink',
				className,
			)}
		>
			<span>{message}</span>
			{actionHref && actionLabel && (
				<Link
					href={actionHref}
					className="font-medium text-fz-primary hover:underline"
				>
					{actionLabel}
				</Link>
			)}
		</div>
	);
}
