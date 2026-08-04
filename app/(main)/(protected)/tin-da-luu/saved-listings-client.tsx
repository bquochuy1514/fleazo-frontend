'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Heart, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ListingCard } from '@/components/listings/listing-card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import {
	firstImageUrl,
	getSavedProducts,
	locationLabel,
	unsaveProduct,
} from '@/lib/products';
import { formatCount } from '@/lib/format';
import type { SavedProduct } from '@/types/product.types';

const PAGE_LIMIT = 20;

type ShelfGroup = 'today' | 'recent' | 'earlier';

const GROUP_LABELS: Record<ShelfGroup, string> = {
	today: 'Hôm nay',
	recent: '7 ngày qua',
	earlier: 'Trước đó',
};

function getShelfGroup(savedAt: string): ShelfGroup {
	const saved = dayjs(savedAt);
	const now = dayjs();
	if (saved.isSame(now, 'day')) return 'today';
	if (saved.isAfter(now.subtract(7, 'day'), 'day')) return 'recent';
	return 'earlier';
}

function SavedListingsSkeleton() {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-5">
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

export function SavedListingsClient() {
	const [items, setItems] = useState<SavedProduct[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const [pendingUnsave, setPendingUnsave] = useState<SavedProduct | null>(
		null,
	);
	const [isRemoving, setIsRemoving] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const loadInitialSavedProducts = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await getSavedProducts({ limit: PAGE_LIMIT });
				if (cancelled) return;
				setItems(response.data);
				setTotal(response.total);
			} catch {
				if (!cancelled) {
					setError('Không thể tải tin đã lưu. Vui lòng thử lại.');
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void loadInitialSavedProducts();

		return () => {
			cancelled = true;
		};
	}, [retryKey]);

	const groups = useMemo(() => {
		const next: Record<ShelfGroup, SavedProduct[]> = {
			today: [],
			recent: [],
			earlier: [],
		};
		for (const item of items) next[getShelfGroup(item.savedAt)].push(item);
		return next;
	}, [items]);

	const loadMore = async () => {
		if (isLoadingMore || items.length >= total) return;
		setIsLoadingMore(true);

		try {
			const response = await getSavedProducts({
				// Re-read from the start so removal cannot create a page-offset gap.
				limit: items.length + PAGE_LIMIT,
			});
			setItems((current) => {
				const existingIds = new Set(
					current.map((item) => item.product.id),
				);
				return [
					...current,
					...response.data.filter(
						(item) => !existingIds.has(item.product.id),
					),
				];
			});
			setTotal(response.total);
		} catch {
			toast.error('Không thể tải thêm tin. Vui lòng thử lại.');
		} finally {
			setIsLoadingMore(false);
		}
	};

	const confirmUnsave = async () => {
		if (!pendingUnsave || isRemoving) return;
		setIsRemoving(true);

		try {
			await unsaveProduct(pendingUnsave.product.id);
			setItems((current) =>
				current.filter(
					(item) => item.product.id !== pendingUnsave.product.id,
				),
			);
			setTotal((current) => Math.max(0, current - 1));
			setPendingUnsave(null);
			toast.success('Đã bỏ lưu tin.');
		} catch {
			toast.error('Không thể bỏ lưu tin. Vui lòng thử lại.');
		} finally {
			setIsRemoving(false);
		}
	};

	const canLoadMore = items.length < total;

	return (
		<section className="mx-auto min-h-[calc(100dvh+3rem)] max-w-6xl px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-20">
			<header className="max-w-xl">
				<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
					Kệ để dành
				</p>
				<h1 className="mt-2 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
					Tin đã lưu
				</h1>
				<p className="mt-3 text-base leading-7 text-muted-foreground">
					Bạn đang để dành {total} tin còn đang hiển thị.
				</p>
			</header>

			{isLoading ? (
				<div className="mt-10 sm:mt-12">
					<SavedListingsSkeleton />
				</div>
			) : error ? (
				<EmptyState
					className="mt-10 min-h-[calc(100dvh-21rem)] rounded-none border-x-0 bg-transparent sm:mt-12"
					icon={RefreshCw}
					title="Chưa tải được kệ để dành"
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
					className="mt-10 min-h-[calc(100dvh-21rem)] rounded-none border-x-0 bg-transparent sm:mt-12"
					icon={Heart}
					title="Chưa có tin nào trong kệ để dành"
					description="Lưu lại những món bạn muốn quay lại xem sau."
					action={
						<Link
							href="/tim-kiem"
							className={buttonVariants({ variant: 'default' })}
						>
							Khám phá chợ
						</Link>
					}
				/>
			) : (
				<div className="mt-8 space-y-10 sm:mt-10 sm:space-y-12">
					{(Object.keys(GROUP_LABELS) as ShelfGroup[]).map(
						(group) => {
							const groupItems = groups[group];
							if (groupItems.length === 0) return null;

							return (
								<section
									key={group}
									aria-labelledby={`saved-group-${group}`}
									className="border-t border-border pt-4 sm:pt-5"
								>
									<div className="flex items-baseline justify-between gap-4">
										<h2
											id={`saved-group-${group}`}
											className="font-heading text-sm font-semibold tracking-tight text-fz-ink"
										>
											{GROUP_LABELS[group]}
										</h2>
										<p className="shrink-0 text-xs tabular-nums text-muted-foreground">
											{formatCount(groupItems.length)} tin
										</p>
									</div>
									<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-5">
										{groupItems.map((savedItem) => {
											const { product } = savedItem;
											return (
												<ListingCard
													key={product.id}
													id={product.id}
													title={product.title}
													price={product.price}
													imageUrl={firstImageUrl(
														product,
													)}
													condition={
														product.condition
													}
													categoryLabel={
														product.category.name
													}
													locationLabel={locationLabel(
														product,
													)}
													saveCount={
														product.saveCount
													}
													initialSaved
													onUnsaveRequested={() =>
														setPendingUnsave(
															savedItem,
														)
													}
												/>
											);
										})}
									</div>
								</section>
							);
						},
					)}

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
									<Loader2
										aria-hidden
										className="animate-spin"
									/>
								)}
								Tải thêm tin đã lưu
							</Button>
						</div>
					)}
				</div>
			)}

			<ConfirmDialog
				open={pendingUnsave !== null}
				onOpenChange={(open) => {
					if (!open && !isRemoving) setPendingUnsave(null);
				}}
				title="Bỏ lưu tin này?"
				description={
					pendingUnsave ? (
						<>
							“
							<span className="font-medium text-fz-ink">
								{pendingUnsave.product.title}
							</span>
							” sẽ không còn trong kệ để dành.
						</>
					) : null
				}
				confirmLabel="Bỏ lưu"
				cancelLabel="Giữ lại"
				isLoading={isRemoving}
				onConfirm={() => void confirmUnsave()}
			/>
		</section>
	);
}
