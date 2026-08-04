'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ListingCard, type ProductMatchBadge } from '@/components/listings/listing-card';
import { getProducts, firstImageUrl, locationLabel } from '@/lib/products';
import type { RelatedProductItem } from '@/lib/products';

// Buffer per backfill query — the dataset can be small, so asking for just
// `limit` more after dedup/exclusion often comes up short.
const BACKFILL_QUERY_LIMIT = 30;

// Auth resolves client-side only (no server session — see personalized-feed.tsx),
// so filtering out the viewer's own listings has to happen here rather than in
// the server-rendered getRelatedProducts. Seeing your own tin in "Có thể bạn
// cũng thích" is a confusing, meaningless suggestion — but excluding it
// server-side would just silently shrink the row below `limit`, so this also
// backfills from the same category → parent category → newest tiers to make
// up the difference.
export function RelatedListings({
	related,
	limit,
	productId,
	categoryId,
	categoryName,
	parentCategoryId,
}: {
	related: RelatedProductItem[];
	limit: number;
	productId: number;
	categoryId: number;
	categoryName: string;
	parentCategoryId?: number;
}) {
	const { user, isLoading } = useAuth();

	const ownFiltered = user
		? related.filter(({ product }) => product.sellerId !== user.id)
		: related;

	const [items, setItems] = useState<RelatedProductItem[]>(ownFiltered);

	useEffect(() => {
		if (isLoading || !user || ownFiltered.length >= limit) {
			setItems(ownFiltered);
			return;
		}

		let cancelled = false;

		(async () => {
			const merged = [...ownFiltered];
			const seen = new Set<number>([
				productId,
				...related.map(({ product }) => product.id),
			]);

			const addAll = (products: RelatedProductItem['product'][], badge?: ProductMatchBadge) => {
				for (const p of products) {
					if (merged.length >= limit) break;
					if (seen.has(p.id)) continue;
					seen.add(p.id);
					if (p.sellerId === user.id) continue;
					merged.push({ product: p, badge });
				}
			};

			if (merged.length < limit) {
				const res = await getProducts({
					categoryId,
					limit: BACKFILL_QUERY_LIMIT,
				});
				addAll(res.data, 'category');
			}

			if (merged.length < limit && parentCategoryId) {
				const res = await getProducts({
					categoryId: parentCategoryId,
					limit: BACKFILL_QUERY_LIMIT,
				});
				addAll(res.data, 'parentCategory');
			}

			if (merged.length < limit) {
				const res = await getProducts({ limit: BACKFILL_QUERY_LIMIT });
				addAll(res.data);
			}

			if (!cancelled) setItems(merged);
		})();

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, user, limit, categoryId, parentCategoryId, productId]);

	if (items.length === 0) return null;

	return (
		<div className="mt-16">
			<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
				Gợi ý thêm
			</p>
			<h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-fz-ink sm:text-3xl">
				Có thể bạn cũng thích
			</h2>
			<p className="mt-2 text-base leading-7 text-muted-foreground">
				Từ người bán này, cùng danh mục hoặc cùng nhóm ngành.
			</p>
			<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
				{items.map(({ product: relatedProduct, badge }, i) => (
					<ScrollReveal key={relatedProduct.id} delay={(i % 5) * 70}>
						<ListingCard
							id={relatedProduct.id}
							title={relatedProduct.title}
							price={relatedProduct.price}
							imageUrl={firstImageUrl(relatedProduct)}
							condition={relatedProduct.condition}
							categoryLabel={relatedProduct.category?.name}
							locationLabel={locationLabel(relatedProduct)}
							saveCount={relatedProduct.saveCount}
							matchBadge={badge}
						/>
					</ScrollReveal>
				))}
			</div>

			<ScrollReveal delay={0}>
				<Link
					href={`/tim-kiem?categoryId=${categoryId}`}
					className="group mt-4 flex items-center justify-between rounded-2xl border border-border px-5 py-4 transition-colors hover:border-fz-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:rounded-3xl sm:px-6 sm:py-5"
				>
					<span className="font-heading text-base font-semibold tracking-tight text-fz-ink sm:text-lg">
						Xem thêm tin danh mục {categoryName}
					</span>
					<ArrowUpRight
						aria-hidden
						className="size-5 text-fz-ink transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
					/>
				</Link>
			</ScrollReveal>
		</div>
	);
}
