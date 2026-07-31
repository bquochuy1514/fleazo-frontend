import Link from 'next/link';
import { cn } from '@/lib/utils';

// Text-based logotype for now — no image asset yet. Default color assumes a
// paper (light) background; pass className to override for a dark surface
// (e.g. Footer's ink CTA band).
export function Logo({ className }: { className?: string }) {
	return (
		<Link
			href="/"
			className={cn(
				'font-heading text-2xl font-bold tracking-tight text-fz-ink',
				className,
			)}
		>
			Fleazo
		</Link>
	);
}
