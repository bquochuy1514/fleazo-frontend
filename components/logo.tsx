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
}: {
	size?: keyof typeof SIZES;
	mark?: boolean;
	// Lets the header collapse to mark-only on small screens (full lockup
	// shoves the search field off centre at 375px).
	wordmarkClassName?: string;
	// On the link — both icon and text pick up a colour set here via currentColor.
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
