import Link from 'next/link';
import { Heart, MapPin, Tag } from 'lucide-react';
import { ListingThumbnail } from '@/components/listings/listing-thumbnail';
import { formatPrice } from '@/lib/format';
import { firstImageUrl, locationLabel } from '@/lib/products';
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
		<article className="group relative flex min-w-0 gap-3 border-b border-border py-3.5 last:border-b-0 sm:gap-4 sm:py-4">
			<Link
				href={`/san-pham/${product.id}`}
				className="relative h-25 w-[7.5rem] shrink-0 overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-28 sm:w-36"
				aria-label={`Xem tin ${product.title}`}
			>
				<ListingThumbnail src={imageUrl} alt={product.title} />
				<span className="absolute top-2 left-2 rounded-full border border-border/70 bg-fz-paper/95 px-2 py-0.5 text-[11px] font-medium text-fz-ink shadow-sm">
					{PRODUCT_CONDITION_LABELS[product.condition]}
				</span>
			</Link>

			<div className="flex min-w-0 flex-1 flex-col justify-center pr-11">
				<Link
					href={`/san-pham/${product.id}`}
					className="line-clamp-2 font-heading text-base leading-5 font-semibold tracking-tight text-fz-ink outline-none transition-colors hover:text-fz-muted focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
				>
					{product.title}
				</Link>

				<p className="mt-2 font-heading text-base leading-none font-bold tracking-tight text-fz-accent tabular-nums">
					{formatPrice(product.price)}
				</p>

				<div className="mt-auto flex min-w-0 items-center gap-3 pt-2 text-xs text-muted-foreground">
					<div className="flex min-w-0 items-center gap-1.5">
						<Tag aria-hidden className="size-3 shrink-0" />
						<span className="truncate">{product.category.name}</span>
					</div>
					{place && (
						<div className="flex min-w-0 items-center gap-1.5">
							<MapPin aria-hidden className="size-3 shrink-0" />
							<span className="truncate">{place}</span>
						</div>
					)}
				</div>
			</div>
			<button
				type="button"
				onClick={() => onUnsaveRequested(item)}
				className="absolute top-2 right-0 flex size-11 items-center justify-center rounded-full text-fz-accent transition-colors hover:bg-fz-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-fz-accent-soft"
				aria-label={`Bỏ lưu ${product.title}`}
			>
				<Heart aria-hidden className="size-4 fill-current" />
			</button>
		</article>
	);
}
