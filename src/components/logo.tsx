import Image from 'next/image';
import { cn } from '@/lib/utils';

// Contrast checked: this asset's green (#00BF63-ish) against the header's
// navy background (#111828) measures ~7.3:1 — passes WCAG AAA. Works directly
// on the Header now; the earlier "needs a white-wordmark variant" caution was
// based on the old dark-green (v1) header and is no longer accurate.
export function Logo({ className }: { className?: string }) {
	return (
		<Image
			src="/fleazo-logo.png"
			alt="Fleazo"
			width={284}
			height={95}
			priority
			className={cn('h-12 w-auto', className)}
		/>
	);
}
