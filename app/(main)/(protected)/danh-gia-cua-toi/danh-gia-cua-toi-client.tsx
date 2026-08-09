'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StarRatingDisplay } from '@/components/reviews/star-rating';
import { useAuth } from '@/hooks/use-auth';
import { getMyGivenReviews, getSellerReviews } from '@/lib/reviews';
import { getPublicUserProfile } from '@/lib/users';
import { formatCount, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { GivenReview, Review } from '@/types/review.types';

const PAGE_LIMIT = 20;

type TabKey = 'received' | 'given';

const TABS: { key: TabKey; label: string }[] = [
	{ key: 'received', label: 'Nhận được' },
	{ key: 'given', label: 'Đã gửi' },
];

// Both tabs render the same card shape — normalize reviewer/seller into one
// "counterpart" field so the list markup doesn't branch per tab.
type ReviewItem = {
	id: number;
	rating: number;
	comment: string | null;
	createdAt: string;
	counterpart: { id: number; fullName: string; avatar: string };
};

const toReceivedItem = (review: Review): ReviewItem => ({
	id: review.id,
	rating: review.rating,
	comment: review.comment,
	createdAt: review.createdAt,
	counterpart: review.reviewer,
});

const toGivenItem = (review: GivenReview): ReviewItem => ({
	id: review.id,
	rating: review.rating,
	comment: review.comment,
	createdAt: review.createdAt,
	counterpart: review.seller,
});

async function fetchPage(tab: TabKey, userId: number, limit: number) {
	if (tab === 'received') {
		const response = await getSellerReviews(userId, { limit });
		return { items: response.data.map(toReceivedItem), total: response.total };
	}
	const response = await getMyGivenReviews({ limit });
	return { items: response.data.map(toGivenItem), total: response.total };
}

function ReviewsSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 4 }, (_, index) => (
				<div
					key={index}
					className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-fz-ink/5"
				>
					<div className="flex items-center gap-3">
						<div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
						<div className="flex-1 space-y-2">
							<div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
							<div className="h-2.5 w-1/5 animate-pulse rounded bg-muted" />
						</div>
					</div>
					<div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-muted" />
				</div>
			))}
		</div>
	);
}

// useSearchParams needs a Suspense boundary (Next build requirement) — same
// pattern as /dang-tin.
export function DanhGiaCuaToiClient() {
	return (
		<Suspense fallback={null}>
			<DanhGiaCuaToiView />
		</Suspense>
	);
}

function DanhGiaCuaToiView() {
	const { user } = useAuth();
	const searchParams = useSearchParams();
	const tab: TabKey = searchParams.get('tab') === 'given' ? 'given' : 'received';

	const [items, setItems] = useState<ReviewItem[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	// User.avgRating (from useAuth) is a stale DB column never updated on new
	// reviews — the live number only exists via GET /users/:id/public (see
	// ReviewsService.getSellerRatingSummary on the backend).
	const [summary, setSummary] = useState<{ avgRating: number; reviewCount: number } | null>(
		null,
	);

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		getPublicUserProfile(user.id)
			.then((profile) => {
				if (!cancelled) {
					setSummary({ avgRating: profile.avgRating, reviewCount: profile.reviewCount });
				}
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [user, retryKey]);

	useEffect(() => {
		if (!user) return;
		let cancelled = false;

		const load = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const { items: nextItems, total: nextTotal } = await fetchPage(
					tab,
					user.id,
					PAGE_LIMIT,
				);
				if (cancelled) return;
				setItems(nextItems);
				setTotal(nextTotal);
			} catch {
				if (!cancelled) {
					setError('Không thể tải đánh giá. Vui lòng thử lại.');
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, [tab, user, retryKey]);

	const loadMore = async () => {
		if (!user || isLoadingMore || items.length >= total) return;
		setIsLoadingMore(true);

		try {
			const { items: nextItems, total: nextTotal } = await fetchPage(
				tab,
				user.id,
				items.length + PAGE_LIMIT,
			);
			setItems(nextItems);
			setTotal(nextTotal);
		} catch {
			setError('Không thể tải thêm đánh giá. Vui lòng thử lại.');
		} finally {
			setIsLoadingMore(false);
		}
	};

	const canLoadMore = items.length < total;

	const subtitle = useMemo(() => {
		if (isLoading || error) return 'Những đánh giá liên quan đến bạn trên Fleazo.';
		return tab === 'received'
			? `Bạn đã nhận được ${formatCount(total)} đánh giá.`
			: `Bạn đã gửi ${formatCount(total)} đánh giá.`;
	}, [isLoading, error, tab, total]);

	if (!user) return null;

	return (
		<section className="mx-auto min-h-[calc(100dvh+3rem)] max-w-3xl px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-20">
			<header className="max-w-2xl">
				<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
					Uy tín
				</p>
				<h1 className="mt-3 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
					Đánh giá của tôi
				</h1>
				<p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
					{subtitle}
				</p>
			</header>

			<div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-fz-ink/5 sm:p-5">
				<div className="flex items-center gap-3">
					<StarRatingDisplay rating={summary?.avgRating ?? 0} />
					<span className="text-sm font-medium text-fz-ink">
						{summary && summary.avgRating > 0
							? summary.avgRating.toFixed(1)
							: 'Chưa có đánh giá'}
					</span>
				</div>
				<Link
					href={`/nguoi-dung/${user.id}`}
					className="shrink-0 text-sm font-medium text-fz-ink underline underline-offset-4 hover:text-fz-muted"
				>
					Xem hồ sơ công khai
				</Link>
			</div>

			<nav aria-label="Loại đánh giá" className="mt-6 flex gap-2">
				{TABS.map(({ key, label }) => (
					<Link
						key={key}
						href={
							key === 'received'
								? '/danh-gia-cua-toi'
								: '/danh-gia-cua-toi?tab=given'
						}
						aria-current={tab === key ? 'page' : undefined}
						className={cn(
							'inline-flex min-h-11 shrink-0 items-center rounded-lg border px-4 font-heading text-sm font-semibold tracking-tight transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
							tab === key
								? 'border-transparent bg-fz-ink text-fz-paper'
								: 'border-border text-fz-muted hover:border-fz-ink hover:text-fz-ink',
						)}
					>
						{label}
					</Link>
				))}
			</nav>

			<div className="mt-6">
				{isLoading ? (
					<ReviewsSkeleton />
				) : error ? (
					<EmptyState
						icon={RefreshCw}
						title="Chưa tải được đánh giá"
						description={error}
						action={
							<Button
								type="button"
								onClick={() => setRetryKey((key) => key + 1)}
							>
								Thử lại
							</Button>
						}
					/>
				) : items.length === 0 ? (
					<EmptyState
						icon={Star}
						title={
							tab === 'received'
								? 'Chưa có đánh giá nào'
								: 'Bạn chưa đánh giá ai'
						}
						description={
							tab === 'received'
								? 'Đánh giá từ người mua sẽ xuất hiện ở đây sau khi họ giao dịch với bạn.'
								: 'Nhắn tin và giao dịch với người bán, sau đó để lại đánh giá trên trang hồ sơ của họ.'
						}
					/>
				) : (
					<div className="space-y-4">
						{items.map((item, index) => (
							<ScrollReveal key={item.id} delay={Math.min(index, 8) * 40}>
								<div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-fz-ink/5">
									<div className="flex items-center gap-3">
										<Image
											src={item.counterpart.avatar}
											alt={item.counterpart.fullName}
											width={36}
											height={36}
											className="size-9 shrink-0 rounded-full object-cover"
										/>
										<div className="min-w-0 flex-1">
											<Link
												href={`/nguoi-dung/${item.counterpart.id}`}
												className="truncate text-sm font-medium text-fz-ink hover:underline"
											>
												{item.counterpart.fullName}
											</Link>
											<p className="text-xs text-muted-foreground">
												{timeAgo(item.createdAt)}
											</p>
										</div>
										<StarRatingDisplay rating={item.rating} />
									</div>
									{item.comment && (
										<p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-fz-ink">
											{item.comment}
										</p>
									)}
									{tab === 'given' && (
										<Link
											href={`/nguoi-dung/${item.counterpart.id}`}
											className="mt-3 inline-block text-xs font-medium text-fz-ink underline underline-offset-4 hover:text-fz-muted"
										>
											Sửa đánh giá
										</Link>
									)}
								</div>
							</ScrollReveal>
						))}

						{canLoadMore && (
							<div className="flex justify-center border-t border-border pt-8">
								<Button
									type="button"
									variant="outline"
									size="lg"
									disabled={isLoadingMore}
									onClick={() => void loadMore()}
									className="min-h-11 px-5"
								>
									{isLoadingMore && (
										<Loader2 aria-hidden className="animate-spin" />
									)}
									Tải thêm đánh giá
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	);
}
