import Image from 'next/image';
import { cn } from '@/lib/utils';

// Shared across the footer credit card, /lien-he and /gioi-thieu so there's
// one place to swap the placeholder for a real photo — drop the file in
// public/avatar.jpg (square, will be cropped to a circle via object-cover).
export function FounderAvatar({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				'relative shrink-0 overflow-hidden rounded-full bg-muted',
				className,
			)}
		>
			<Image
				src="/avatar.jpg"
				alt="Bùi Quốc Huy"
				fill
				sizes="48px"
				className="object-cover"
			/>
		</div>
	);
}
