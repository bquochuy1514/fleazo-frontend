import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { formatPrice } from '@/lib/format';

// Inline reminder of which listing a stretch of messages is about — a
// conversation can drift across several products over time (see backend
// AGENTS.md → Chat, Conversation is per-pair not per-product), so this
// re-anchors context rather than assuming one fixed product per thread.
export function ProductContextCard({
	productId,
	title,
	price,
	imageUrl,
}: {
	productId: number;
	title: string;
	price: string | number;
	imageUrl?: string;
}) {
	return (
		<Link
			href={`/san-pham/${productId}`}
			className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-2.5 py-2 shadow-sm shadow-fz-ink/5 transition-colors hover:bg-muted/60"
		>
			<div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
				{imageUrl ? (
					<Image src={imageUrl} alt={title} fill sizes="40px" className="object-cover" />
				) : (
					<ImageIcon className="size-4 text-muted-foreground" />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-xs font-medium text-fz-ink">{title}</p>
				<p className="text-xs font-semibold text-fz-accent tabular-nums">
					{formatPrice(price)}
				</p>
			</div>
		</Link>
	);
}
