'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, RefreshCw } from 'lucide-react';
import { SearchFilterRail } from '@/components/search/search-filter-rail';
import { SearchFilterSheet } from '@/components/search/search-filter-sheet';
import { SearchMasthead } from '@/components/search/search-masthead';
import { SearchPagination } from '@/components/search/search-pagination';
import {
	SearchResultsGrid,
	SearchResultsSkeleton,
} from '@/components/search/search-results-grid';
import { SearchToolbar } from '@/components/search/search-toolbar';
import {
	DEFAULT_SEARCH_FILTERS,
	filterCount,
	searchHref,
	type SearchFilters,
} from '@/components/search/search-types';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { parseApiError } from '@/lib/api';
import { getProducts, type PaginatedProducts, type ProductQuery } from '@/lib/products';
import type { Category } from '@/types/category.types';
import type { ProvinceWithWards } from '@/lib/locations';

function toProductQuery(filters: SearchFilters): ProductQuery {
	return {
		keyword: filters.q.trim() || undefined,
		categoryId: filters.categoryId ?? undefined,
		sellerUniversityId: filters.sellerUniversityId ?? undefined,
		provinceCode: filters.provinceCode ?? undefined,
		wardCode: filters.wardCode ?? undefined,
		condition: filters.condition ?? undefined,
		minPrice: filters.minPrice ?? undefined,
		maxPrice: filters.maxPrice ?? undefined,
		page: filters.page,
		limit: 20,
	};
}

export function SearchResultsClient({
	filters,
	categories,
	provinces,
	initialResult,
	initialError,
	contextLabel,
}: {
	filters: SearchFilters;
	categories: Category[];
	provinces: ProvinceWithWards[];
	initialResult: PaginatedProducts | null;
	initialError: string | null;
	contextLabel?: string;
}) {
	const router = useRouter();
	const { user, isLoading: isAuthLoading } = useAuth();
	const [result, setResult] = useState(initialResult);
	const [error, setError] = useState(initialError);
	const [isRetrying, setIsRetrying] = useState(false);
	const [filterSheetOpen, setFilterSheetOpen] = useState(false);

	// Category/home links can preserve their previous scroll position because
	// they stay inside the same marketplace layout. Results are a fresh browse
	// workspace, so every route entry starts at its title rather than mid-grid.
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const navigate = (next: SearchFilters, scroll = false) => {
		router.push(searchHref(next), { scroll });
	};

	const refreshForViewer = async () => {
		setIsRetrying(true);
		setError(null);
		try {
			const next = await getProducts(toProductQuery(filters));
			setResult(next);
		} catch (err) {
			setError(
				parseApiError(err).message ??
					'Không thể tải tin đăng. Vui lòng thử lại.',
			);
		} finally {
			setIsRetrying(false);
		}
	};

	// The server cannot read the bearer token in browser storage. Re-fetch only
	// after auth resolves so `isSaved` is viewer-correct without delaying SSR.
	useEffect(() => {
		if (isAuthLoading || !user) return;

		let cancelled = false;
		const refreshSavedState = async () => {
			try {
				const next = await getProducts(toProductQuery(filters));
				if (!cancelled) setResult(next);
			} catch {
				// Keep the server-rendered catalogue available if this enhancement fails.
			}
		};

		void refreshSavedState();
		return () => {
			cancelled = true;
		};
	}, [
		filters.categoryId,
		filters.condition,
		filters.maxPrice,
		filters.minPrice,
		filters.page,
		filters.provinceCode,
		filters.q,
		filters.sellerUniversityId,
		filters.wardCode,
		isAuthLoading,
		user,
	]);

	const appliedFilterCount = filterCount(filters);
	const clearFilters = () =>
		navigate({ ...DEFAULT_SEARCH_FILTERS, q: filters.q });
	const clearSearch = () => navigate({ ...DEFAULT_SEARCH_FILTERS });
	const hasResultsContext = appliedFilterCount > 0 || !!filters.q;

	return (
		<section className="mx-auto min-h-[calc(100dvh+3rem)] max-w-6xl px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-20">
			<SearchMasthead
				filters={filters}
				contextLabel={contextLabel}
			/>
			{result && (
				<div className="mt-3">
					<SearchToolbar
						total={result.total}
						filters={filters}
						categories={categories}
						provinces={provinces}
						onOpenFilters={() => setFilterSheetOpen(true)}
						onClear={clearFilters}
						onRemove={(patch) => navigate({ ...filters, ...patch, page: 1 })}
					/>
				</div>
			)}

			{result ? (
				<>
					<div className="mt-6 grid gap-8 lg:mt-7 lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-10">
						<SearchFilterRail
							filters={filters}
							categories={categories}
							provinces={provinces}
							university={user?.university ?? null}
							onChange={(next) => navigate(next)}
							onReset={clearFilters}
						/>

						<div className="min-w-0">
							{result.data.length > 0 ? (
								<>
									<SearchResultsGrid
										products={result.data}
										viewerId={user?.id ?? null}
										viewerUniversityId={user?.universityId ?? null}
									/>
									<SearchPagination
										page={result.page}
										totalPages={result.totalPages}
										onChange={(page) =>
											navigate({ ...filters, page }, true)
										}
									/>
								</>
							) : (
								<EmptyState
									className="min-h-[26rem] rounded-none border-x-0 bg-transparent"
									icon={Package}
									title="Không tìm thấy món đồ phù hợp"
									description={
										hasResultsContext
											? 'Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm tin.'
											: 'Tin mới sẽ xuất hiện ở đây khi chợ có thêm món đồ được duyệt.'
									}
									action={
										hasResultsContext ? (
											<Button
												type="button"
												onClick={appliedFilterCount > 0 ? clearFilters : clearSearch}
											>
												{appliedFilterCount > 0 ? 'Xóa bộ lọc' : 'Xóa tìm kiếm'}
											</Button>
										) : undefined
									}
								/>
							)}
						</div>
					</div>
				</>
			) : error ? (
				<EmptyState
					className="mt-10 min-h-[calc(100dvh-22rem)] rounded-none border-x-0 bg-transparent"
					icon={RefreshCw}
					title="Chưa tải được chợ"
					description={error}
					action={
						<Button type="button" disabled={isRetrying} onClick={() => void refreshForViewer()}>
							Thử lại
						</Button>
					}
				/>
			) : (
				<div className="mt-10">
					<SearchResultsSkeleton />
				</div>
			)}

			<SearchFilterSheet
				open={filterSheetOpen}
				onOpenChange={setFilterSheetOpen}
				filters={filters}
				categories={categories}
				provinces={provinces}
				university={user?.university ?? null}
				onApply={(next) => navigate(next)}
			/>
		</section>
	);
}
