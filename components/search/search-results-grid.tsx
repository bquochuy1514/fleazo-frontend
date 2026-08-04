import { ListingCard } from '@/components/listings/listing-card';
import { firstImageUrl, locationLabel } from '@/lib/products';
import type { Product } from '@/types/product.types';

export function SearchResultsGrid({
	products,
	viewerId,
	viewerUniversityId,
}: {
	products: Product[];
	viewerId: number | null;
	viewerUniversityId: number | null;
}) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
			{products.map((product) => (
				<ListingCard
					key={product.id}
					id={product.id}
					sellerId={product.sellerId}
					title={product.title}
					price={product.price}
					imageUrl={firstImageUrl(product)}
					condition={product.condition}
					categoryLabel={product.category.name}
					locationLabel={locationLabel(product)}
					saveCount={product.saveCount}
					initialSaved={product.isSaved ?? false}
					matchBadge={
						viewerUniversityId !== null &&
						product.sellerId !== viewerId &&
						product.sellerUniversityId === viewerUniversityId
							? 'university'
							: undefined
					}
				/>
			))}
		</div>
	);
}

export function SearchResultsSkeleton() {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
			{Array.from({ length: 8 }, (_, index) => (
				<div
					key={index}
					className="overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl"
				>
					<div className="aspect-square animate-pulse bg-muted" />
					<div className="space-y-3 p-3.5">
						<div className="h-5 w-2/5 animate-pulse rounded bg-muted" />
						<div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
						<div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}
