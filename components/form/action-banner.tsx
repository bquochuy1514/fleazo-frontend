import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Two tones only. 'error' is the one real use of --color-rust outside a form
// field. 'neutral' is deliberately NOT moss-tinted even for a success message
// ("Xác thực thành công!") — moss stays reserved for price tags and the save
// toggle (see AGENTS.md → Design System); a green success banner here would
// be exactly the "reach for the accent as a general-purpose color" the
// palette rule warns against. Icon carries the distinction alongside color,
// not color alone (WCAG 1.4.1).
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
				// fz-rise: this only ever appears in response to something
				// happening (a failed submit, a redirect after success) —
				// motion here has an actual cause to point at, unlike a
				// decorative flourish, so it earns the entrance the login
				// form itself deliberately skips per-field.
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
