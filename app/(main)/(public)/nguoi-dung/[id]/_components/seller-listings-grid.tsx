'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ListingCard } from '@/components/listings/listing-card';
import { getProduct, firstImageUrl, locationLabel } from '@/lib/products';
import type { Product } from '@/types/product.types';

// The server-rendered fetch in page.tsx has no bearer token (no localStorage
// in a server component), so every card's `isSaved` starts false regardless
// of the real state. Once the client resolves who's logged in, this re-fetches
// each product (which DOES carry the viewer's real isSaved) and corrects the
// heart fill in place — same pattern as related-listings.tsx.
export function SellerListingsGrid({ initialProducts }: { initialProducts: Product[] }) {
	const { user, isLoading } = useAuth();
	const [products, setProducts] = useState(initialProducts);

	useEffect(() => {
		if (isLoading || !user) return;
		let cancelled = false;

		Promise.all(initialProducts.map((p) => getProduct(p.id).catch(() => null))).then(
			(details) => {
				if (cancelled) return;
				setProducts((prev) =>
					prev.map((p, i) => {
						const detail = details[i];
						return detail ? { ...p, isSaved: detail.isSaved } : p;
					}),
				);
			},
		);

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, user]);

	return (
		<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
			{products.map((product, i) => (
				<ScrollReveal key={product.id} delay={(i % 5) * 70}>
					<ListingCard
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
					/>
				</ScrollReveal>
			))}
		</div>
	);
}
