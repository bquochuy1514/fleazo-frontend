import { cache } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { isAxiosError } from '@/lib/api';
import { getPublicUserProfile } from '@/lib/users';
import { getProducts } from '@/lib/products';
import { getSellerReviews } from '@/lib/reviews';
import { formatJoinDate, formatCount } from '@/lib/format';
import { StarRatingDisplay } from './_components/star-rating';
import { MessageSellerButton } from './_components/message-seller-button';
import { SellerListingsGrid } from './_components/seller-listings-grid';
import { ReviewsSection } from './_components/reviews-section';

const LISTINGS_LIMIT = 12;

type PageProps = { params: Promise<{ id: string }> };

// Dedupes the fetch between generateMetadata and the page body (axios isn't
// auto-memoized like the built-in `fetch`) — same pattern as san-pham/[id].
const getCachedPublicUser = cache(async (id: number) => {
	try {
		return await getPublicUserProfile(id);
	} catch (err) {
		if (isAxiosError(err) && err.response?.status === 404) return null;
		throw err;
	}
});

function parseId(raw: string): number | null {
	const id = Number(raw);
	return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const id = parseId((await params).id);
	const seller = id ? await getCachedPublicUser(id) : null;
	if (!seller) return {};

	return {
		title: `${seller.fullName} — Fleazo`,
		description: `Xem hồ sơ và tin đang bán của ${seller.fullName} trên Fleazo.`,
	};
}

// pt-24: clears the fixed Header, same as san-pham/[id].
export default async function SellerProfilePage({ params }: PageProps) {
	const id = parseId((await params).id);
	const seller = id ? await getCachedPublicUser(id) : null;
	if (!seller) notFound();

	const [listings, reviews] = await Promise.all([
		getProducts({ sellerId: seller.id, limit: LISTINGS_LIMIT }),
		getSellerReviews(seller.id, { limit: 20 }),
	]);
	const location = [seller.wardName, seller.provinceName].filter(Boolean).join(', ');

	return (
		<div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
			<div className="fz-rise rounded-2xl border border-border bg-card p-6 shadow-sm shadow-fz-ink/5 sm:p-8">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4 sm:gap-5">
						<Image
							src={seller.avatar}
							alt={seller.fullName}
							width={80}
							height={80}
							className="size-20 shrink-0 rounded-2xl object-cover sm:size-24"
						/>
						<div className="min-w-0">
							<h1 className="font-heading text-2xl font-bold tracking-tight text-fz-ink sm:text-3xl">
								{seller.fullName}
							</h1>
							<div className="mt-1.5 flex items-center gap-2">
								<StarRatingDisplay rating={seller.avgRating} />
								<span className="text-sm font-medium text-fz-ink">
									{seller.avgRating > 0 ? seller.avgRating.toFixed(1) : 'Chưa có đánh giá'}
								</span>
								{seller.reviewCount > 0 && (
									<span className="text-sm text-muted-foreground">
										({formatCount(seller.reviewCount)})
									</span>
								)}
							</div>
							{location && (
								<p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
									<MapPin aria-hidden className="size-3.5 shrink-0" />
									{location}
								</p>
							)}
							<p className="mt-1 text-sm text-muted-foreground">
								Tham gia từ {formatJoinDate(seller.createdAt)}
							</p>
						</div>
					</div>

					<MessageSellerButton sellerId={seller.id} />
				</div>
			</div>

			<section className="mt-10 sm:mt-12">
				<h2 className="font-heading text-xl font-bold tracking-tight text-fz-ink sm:text-2xl">
					Tin đang bán
				</h2>
				{listings.data.length === 0 ? (
					<p className="mt-3 text-sm text-muted-foreground">
						{seller.fullName} chưa có tin nào đang hiển thị.
					</p>
				) : (
					<SellerListingsGrid initialProducts={listings.data} />
				)}
			</section>

			<section className="mt-10 sm:mt-12">
				<h2 className="font-heading text-xl font-bold tracking-tight text-fz-ink sm:text-2xl">
					Đánh giá
				</h2>
				<ReviewsSection
					sellerId={seller.id}
					sellerName={seller.fullName}
					initialReviews={reviews}
				/>
			</section>
		</div>
	);
}
