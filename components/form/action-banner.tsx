import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Two tones only. 'neutral' is deliberately not moss-tinted even for success
// messages — moss stays reserved for price tags/save toggle. Icon carries the
// distinction alongside color, not color alone (WCAG 1.4.1).
export function ActionBanner({
	message,
	tone = 'neutral',
	actionHref,
	actionLabel,
	className,
}: {
	message: string;
	tone?: 'neutral' | 'error';
	actionHref?: string;
	actionLabel?: string;
	className?: string;
}) {
	const Icon = tone === 'error' ? AlertCircle : CheckCircle2;

	return (
		<div
			role={tone === 'error' ? 'alert' : 'status'}
			className={cn(
				// fz-rise: appears in response to an actual event (submit
				// failure/success), not decorative.
				'fz-rise flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm',
				tone === 'error'
					? 'border-fz-danger/25 bg-fz-danger/10 text-fz-danger'
					: 'border-border bg-muted text-fz-ink',
				className,
			)}
		>
			<Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
			<div className="min-w-0">
				<p>{message}</p>
				{actionHref && actionLabel && (
					<Link
						href={actionHref}
						className="mt-1 inline-block font-medium underline underline-offset-2"
					>
						{actionLabel}
					</Link>
				)}
			</div>
		</div>
	);
}
