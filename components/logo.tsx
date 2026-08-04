import Link from 'next/link';
import { cn } from '@/lib/utils';

const SRC = '/logo.png';

// Icon only, no baked-in wordmark. Flat single-tone silhouette (1024x1024,
// transparent bg) so it works with `mask-image` + `bg-current` — mask only
// reads alpha, so a second opaque colour in the source would collapse to
// currentColor and vanish. Replacing the mark = replacing this file whole.
const MARK_STYLE: React.CSSProperties & Record<string, string> = {
	maskImage: `url(${SRC})`,
	WebkitMaskImage: `url(${SRC})`,
	maskRepeat: 'no-repeat',
	WebkitMaskRepeat: 'no-repeat',
	maskSize: 'contain',
	WebkitMaskSize: 'contain',
	maskPosition: 'center',
	WebkitMaskPosition: 'center',
};

const SIZES = {
	sm: { mark: 'size-9', word: 'text-lg', gap: 'gap-2' },
	lg: { mark: 'size-12', word: 'text-xl', gap: 'gap-2.5' },
} as const;

export function Logo({
	size = 'sm',
	mark = true,
	wordmarkClassName,
	className,
	interactive = true,
}: {
	size?: keyof typeof SIZES;
	mark?: boolean;
	// Lets the header collapse to mark-only on small screens (full lockup
	// shoves the search field off centre at 375px).
	wordmarkClassName?: string;
	// On the link — both icon and text pick up a colour set here via currentColor.
	className?: string;
	// Footer's lockup is a brand mark, not a second "go home" nav item next
	// to the real links below it — false renders a plain, unlinked div with
	// no hover/cursor affordance at all instead of a Link.
	interactive?: boolean;
}) {
	const size_ = SIZES[size];

	const content = (
		<>
			{mark && (
				<span
					aria-hidden
					className={cn('block shrink-0 bg-current', size_.mark)}
					style={MARK_STYLE}
				/>
			)}
			<span
				aria-hidden
				className={cn(
					'font-heading font-bold whitespace-nowrap',
					size_.word,
					wordmarkClassName,
				)}
			>
				Fleazo
			</span>
		</>
	);

	if (!interactive) {
		return (
			<div
				className={cn(
					'flex shrink-0 items-center text-fz-ink',
					size_.gap,
					className,
				)}
			>
				{content}
			</div>
		);
	}

	return (
		<Link
			href="/"
			aria-label="Fleazo — trang chủ"
			className={cn(
				'flex shrink-0 items-center text-fz-ink',
				size_.gap,
				className,
			)}
		>
			{content}
		</Link>
	);
}
