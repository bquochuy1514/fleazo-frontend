import Link from 'next/link';
import { cn } from '@/lib/utils';

const SRC = '/logo.png';

// Icon only — no wordmark baked in (that's live text below). A flat,
// single-tone silhouette (1024×1024, transparent background, no gradient/
// shadow) so it works with `mask-image` + `bg-current`: mask only reads the
// alpha channel, so a second opaque colour anywhere in the source (e.g. a
// price-tag glyph drawn in white-on-black) would collapse to the same
// currentColor as the rest of the shape and vanish — see the previous
// asset's own history for exactly that failure. Replacing the mark means
// replacing this file; no crop-box math to update since it's used whole.
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
}: {
	size?: keyof typeof SIZES;
	mark?: boolean;
	// Lets the header collapse to a mark-only lockup on small screens without
	// a second component — at 375px the full lockup shoves the search field
	// off centre.
	wordmarkClassName?: string;
	// Goes on the link: a masked `bg-current` icon and plain text both pick
	// up a colour set here (e.g. text-white) the same way, via currentColor.
	className?: string;
}) {
	const size_ = SIZES[size];

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
		</Link>
	);
}
