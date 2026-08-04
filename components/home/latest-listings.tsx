'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
	getProducts,
	firstImageUrl,
	locationLabel as getLocationLabel,
} from '@/lib/products';
import {
	ListingCard,
	type ProductMatchBadge,
} from '@/components/listings/listing-card';
import type { Product } from '@/types/product.types';

const FEED_LIMIT = 10;

type FeedItem = { product: Product; badge?: ProductMatchBadge };

// Home is a Server Component with no session — it server-renders this feed's
// `initialProducts` (newest-first, everyone) so guests see content instantly.
// This client wrapper then quietly checks the already-resolved auth profile
// and, only if the viewer has a university/province on file, refetches a
// blended tier1 (same university) → tier2 (same province) → tier3 (the
// original newest list) feed and swaps it in. Guests and brand-new accounts
// with neither field set never trigger a refetch — they just keep the
// server-rendered list.
export function LatestListings({
	initialProducts,
}: {
	initialProducts: Product[];
}) {
	const { user, isLoading } = useAuth();
	const [items, setItems] = useState<FeedItem[]>(() =>
		initialProducts.map((product) => ({ product })),
	);
	// Kept short and generic on purpose — the specific place/school name (which
	// can run long, e.g. "Thành phố Hồ Chí Minh") goes in `subcopy` below
	// instead, so it never has to wrap inside the tight-leading H2.
	const [heading, setHeading] = useState('Tin mới đăng');
	const [subcopy, setSubcopy] = useState('Những tin vừa được đăng gần đây.');
	// Drives the "Xem tất cả" link below — points wherever this feed's
	// current tier is actually pulling from.
	const [tier, setTier] = useState<'university' | 'province' | 'default'>(
		'default',
	);

	useEffect(() => {
		if (isLoading || !user) return;
		if (!user.university && !user.provinceCode) return;

		let cancelled = false;

		(async () => {
			const merged: FeedItem[] = [];
			const seen = new Set<number>();

			const addAll = (products: Product[], badge?: ProductMatchBadge) => {
				for (const product of products) {
					if (merged.length >= FEED_LIMIT) break;
					if (seen.has(product.id)) continue;
					seen.add(product.id);
					// Your own listing always matches "cùng trường" (it's your
					// own account) — that's a confusing, meaningless signal, so
					// it gets its own badge instead of pretending it's a match.
					const effectiveBadge =
						product.sellerId === user.id ? 'own' : badge;
					merged.push({ product, badge: effectiveBadge });
				}
			};

			if (user.university) {
				const res = await getProducts({
					sellerUniversityId: user.university.id,
					limit: FEED_LIMIT,
				});
				addAll(res.data, 'university');
			}

			if (merged.length < FEED_LIMIT && user.provinceCode) {
				const res = await getProducts({
					provinceCode: user.provinceCode,
					limit: FEED_LIMIT,
				});
				addAll(res.data, 'province');
			}

			if (merged.length < FEED_LIMIT) {
				addAll(initialProducts);
			}

			if (cancelled) return;
			setItems(merged);

			if (merged.some((item) => item.badge === 'university')) {
				setHeading('Tin mới ở trường bạn');
				setSubcopy(`Ưu tiên tin từ ${user.university!.name}.`);
				setTier('university');
			} else if (merged.some((item) => item.badge === 'province')) {
				setHeading('Tin mới gần bạn');
				setSubcopy(
					user.provinceName
						? `Ưu tiên tin ở ${user.provinceName}.`
						: 'Ưu tiên tin ở khu vực của bạn.',
				);
				setTier('province');
			} else {
				setHeading('Tin mới đăng');
				setSubcopy('Những tin vừa được đăng gần đây.');
				setTier('default');
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isLoading, user, initialProducts]);

	if (items.length === 0) return null;

	const showNudge =
		!isLoading && !!user && !user.university && !user.provinceCode;

	const viewAllHref =
		tier === 'university' && user?.university
			? `/tim-kiem?sellerUniversityId=${user.university.id}`
			: tier === 'province' && user?.provinceCode
				? `/tim-kiem?provinceCode=${user.provinceCode}`
				: '/tim-kiem';

	return (
		// CommunityBanner sits directly above and is a full-bleed image with no
		// padding of its own, so the gap after it has to come from here.
		<section className="mx-auto max-w-6xl px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-20">
			{/* Split row rather than Categories' stacked block above — the
			    eyebrow stays with the heading it labels; what earns the right
			    slot is the "Xem tất cả" action, which lives inline here instead
			    of as a full-width bar under the grid. */}
			<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-md">
					<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
						Ngay lúc này
					</p>
					<h2 className="mt-2 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
						{heading}
					</h2>
					<p className="mt-3 text-base leading-7 text-muted-foreground">
						{subcopy}
					</p>
				</div>
				<div className="flex shrink-0 flex-col items-start gap-2 sm:items-end sm:text-right">
					<Link
						href={viewAllHref}
						className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-5 font-heading text-sm font-semibold tracking-tight text-fz-ink transition-colors hover:border-fz-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						Xem tất cả tin đăng
						<ArrowUpRight
							aria-hidden
							className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
						/>
					</Link>
					{showNudge && (
						<p className="text-sm text-muted-foreground">
							<Link
								href="/ca-nhan"
								className="underline underline-offset-2 hover:text-fz-ink"
							>
								Cập nhật trường/khu vực
							</Link>{' '}
							để xem tin gần bạn hơn.
						</p>
					)}
				</div>
			</div>

			<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
				{items.map(({ product, badge }, i) => (
					<ScrollReveal
						key={product.id}
						delay={(i % 5) * 70}
						className={cn(
							i === items.length - 1 &&
								items.length % 2 === 1 &&
								'col-span-2 sm:col-span-1',
						)}
					>
						<ListingCard
							id={product.id}
							title={product.title}
							price={product.price}
							imageUrl={firstImageUrl(product)}
							condition={product.condition}
							categoryLabel={product.category?.name}
							locationLabel={getLocationLabel(product)}
							saveCount={product.saveCount}
							matchBadge={badge}
						/>
					</ScrollReveal>
				))}
			</div>

		</section>
	);
}
