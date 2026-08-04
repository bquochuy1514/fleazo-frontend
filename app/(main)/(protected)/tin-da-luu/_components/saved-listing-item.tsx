import Link from 'next/link';
import { Heart, MapPin, MessageCircle, Tag } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ListingThumbnail } from '@/components/listings/listing-thumbnail';
import { formatPrice } from '@/lib/format';
import { firstImageUrl, locationLabel } from '@/lib/products';
import { cn } from '@/lib/utils';
import {
	PRODUCT_CONDITION_LABELS,
	type SavedProduct,
} from '@/types/product.types';

// This is intentionally a saved-record row, not the public marketplace card.
// The collection context makes price, context and the remove action more useful
// than an oversized product image or the feed's condition badges.
export function SavedListingItem({
	item,
	onUnsaveRequested,
}: {
	item: SavedProduct;
	onUnsaveRequested: (item: SavedProduct) => void;
}) {
	const { product } = item;
	const imageUrl = firstImageUrl(product);
	const place = locationLabel(product);

	return (
		<article className="group relative flex min-w-0 gap-3 py-3.5 sm:gap-4 sm:py-4">
			<Link
				href={`/san-pham/${product.id}`}
				className="relative min-h-28 w-[7.5rem] shrink-0 self-stretch overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-36"
				aria-label={`Xem tin ${product.title}`}
			>
				<ListingThumbnail src={imageUrl} alt={product.title} />
				<span className="absolute top-2 left-2 rounded-full border border-border/70 bg-fz-paper/95 px-2 py-0.5 text-[11px] font-medium text-fz-ink shadow-sm">
					{PRODUCT_CONDITION_LABELS[product.condition]}
				</span>
			</Link>

			<div className="min-w-0 flex-1">
				<Link
					href={`/san-pham/${product.id}`}
					className="line-clamp-2 min-h-10 font-heading text-base leading-5 font-semibold tracking-tight text-fz-ink outline-none transition-colors hover:text-fz-muted focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
				>
					{product.title}
				</Link>

				<p className="mt-2 font-heading text-base leading-none font-bold tracking-tight text-fz-accent tabular-nums">
					{formatPrice(product.price)}
				</p>

				<div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
					<div className="flex min-w-0 items-center gap-1.5">
						<Tag aria-hidden className="size-3 shrink-0" />
						<span className="truncate">{product.category.name}</span>
					</div>
					{place && (
						<>
							<span aria-hidden className="text-border">·</span>
							<div className="flex min-w-0 items-center gap-1.5">
							<MapPin aria-hidden className="size-3 shrink-0" />
							<span className="truncate">{place}</span>
						</div>
						</>
					)}
				</div>

				<div className="mt-3 flex items-center gap-2">
					<Link
						href={`/tin-nhan?productId=${product.id}`}
						className={cn(
							buttonVariants({ variant: 'outline' }),
							'min-h-11 px-3',
						)}
					>
						<MessageCircle aria-hidden className="size-3.5" />
						Liên hệ
					</Link>
					<button
						type="button"
						onClick={() => onUnsaveRequested(item)}
						className="flex size-11 items-center justify-center rounded-full border border-border text-fz-accent transition-colors hover:bg-fz-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-fz-accent-soft"
						aria-label={`Bỏ lưu ${product.title}`}
					>
						<Heart aria-hidden className="size-4 fill-current" />
					</button>
				</div>
			</div>
		</article>
	);
}
