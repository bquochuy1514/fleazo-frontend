import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reserved for standalone content pages (hướng dẫn đăng tin, giới thiệu,
// liên hệ) — deliberately NOT the homepage hero's hairline-eyebrow +
// giant-clamp() heading treatment (app/(main)/(public)/page.tsx), so a
// "reading" page doesn't look like a re-skinned marketplace hero. Pill
// kicker + oversized watermark icon + accent underline bar + blockquote-
// style dek instead — reads as an editorial page, not a shopping one.
export function PageHeader({
	icon: Icon,
	kicker,
	title,
	description,
	className,
}: {
	icon: LucideIcon;
	kicker: string;
	title: string;
	description: string;
	className?: string;
}) {
	return (
		<div className={cn('fz-rise relative', className)}>
			<Icon
				aria-hidden
				className="pointer-events-none absolute -top-8 right-0 size-32 -rotate-12 text-fz-ink/[0.06] sm:size-40"
			/>
			<span className="relative inline-flex items-center rounded-full bg-fz-ink px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-fz-paper uppercase">
				{kicker}
			</span>
			<h1 className="relative mt-4 max-w-xl font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
				{title}
			</h1>
			<span
				aria-hidden
				className="mt-4 block h-1.5 w-14 rounded-full bg-fz-accent"
			/>
			<p className="relative mt-4 max-w-xl border-l-2 border-border pl-4 text-base leading-7 text-muted-foreground">
				{description}
			</p>
		</div>
	);
}
