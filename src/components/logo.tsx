import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Contrast checked: this asset's green (#00BF63-ish) against the header's
// navy background (#111828) measures ~7.3:1 — passes WCAG AAA. Works directly
// on the Header now; the earlier "needs a white-wordmark variant" caution was
// based on the old dark-green (v1) header and is no longer accurate.
//
// hover uses opacity, not scale, unlike Button/icon buttons — scaling a wide
// horizontal wordmark+icon lockup looks distorted and risks overlapping the
// "Danh mục" button next to it in the Header. See AGENTS.md → Design System
// → Interactive feedback for why Logo is an intentional exception.
export function Logo({ className }: { className?: string }) {
	return (
		<Link
			href="/"
			className="inline-block transition-opacity hover:opacity-80"
		>
			<Image
				src="/fleazo-logo.png"
				alt="Fleazo"
				width={284}
				height={95}
				priority
				className={cn('h-12 w-auto', className)}
			/>
		</Link>
	);
}
