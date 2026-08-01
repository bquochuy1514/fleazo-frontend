import Link from 'next/link';
import { cn } from '@/lib/utils';

const SRC = '/logo.png';

// The source (198×214) is a STACKED lockup — mark on top, wordmark below,
// separated by a fully transparent band at y 147–172. Stacked can't be used
// as-is in a 64px header (the wordmark would land around 5px tall), so both
// halves are cropped out of that one file and re-laid out horizontally. One
// asset rather than three: replacing the logo means replacing the PNG — but
// **re-measure these boxes if the new file's internal layout differs.**
//
// Both halves are masks filled with currentColor, so the whole lockup inverts
// to white over the hero photo and back to ink everywhere else — the rest of
// the system is monochrome and the source PNG's teal/yellow was the only
// colour on the page that wasn't in the palette.
//
// The cost, measured off the source's alpha channel: masked, the bag loses its
// swoosh and its two tones, and the graduation cap fuses into the bag's
// top-right corner. Only the handle's loop survives (the space inside it is
// genuinely transparent). At the header's 36px it reads as a filled bag
// shape, not as the mark. Pass `mark={false}` for a wordmark-only lockup if
// that trade stops being worth it.
//
// Percentages rather than pixel offsets, so a size change only touches SIZES:
//   size     = source / box
//   position = offset / (source − box)
const MARK = {
	// source box x 43–192, y 0–146
	aspect: '150 / 147',
	size: '132% 145.578%',
	position: '89.583% 0%',
};
const WORDMARK = {
	// source box y 173–212, full width
	aspect: '198 / 40',
	size: '100% 535%',
	position: '0% 99.4253%',
};

const SIZES = {
	sm: { mark: 'h-9', word: 'h-4', gap: 'gap-2' },
	lg: { mark: 'h-12', word: 'h-5', gap: 'gap-2.5' },
} as const;

function maskStyle(
	box: typeof MARK,
	url: string,
): React.CSSProperties & Record<string, string> {
	return {
		aspectRatio: box.aspect,
		maskImage: url,
		WebkitMaskImage: url,
		maskRepeat: 'no-repeat',
		WebkitMaskRepeat: 'no-repeat',
		maskSize: box.size,
		WebkitMaskSize: box.size,
		maskPosition: box.position,
		WebkitMaskPosition: box.position,
	};
}

export function Logo({
	size = 'sm',
	mark = true,
	wordmarkClassName,
	className,
}: {
	size?: keyof typeof SIZES;
	mark?: boolean;
	// Lets the header collapse to a mark-only lockup on small screens without
	// a second component — at 375px the full lockup is 122px wide and shoves
	// the search field off centre.
	wordmarkClassName?: string;
	// Goes on the link, so a colour set here (e.g. text-white) reaches both
	// masks through currentColor.
	className?: string;
}) {
	const size_ = SIZES[size];
	const url = `url(${SRC})`;

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
					className={cn('block bg-current', size_.mark)}
					style={maskStyle(MARK, url)}
				/>
			)}
			<span
				aria-hidden
				className={cn('block bg-current', size_.word, wordmarkClassName)}
				style={maskStyle(WORDMARK, url)}
			/>
		</Link>
	);
}
