import type { Metadata } from 'next';
import { SearchResultsClient } from './search-results-client';
import { DEFAULT_SEARCH_FILTERS, type SearchFilters } from '@/components/search/search-types';
import { getCategories } from '@/lib/categories';
import { getProvincesWithWards } from '@/lib/locations';
import { getProducts, type PaginatedProducts, type ProductQuery } from '@/lib/products';
import { PRODUCT_CONDITION_LABELS, type ProductCondition } from '@/types/product.types';

export const metadata: Metadata = {
	title: 'Tìm kiếm tin đăng — Fleazo',
	description: 'Tìm và lọc các món đồ sinh viên đang được trao tay trên Fleazo.',
};

// axios is not part of Next's fetch cache; keep results fresh as new listings land.
export const revalidate = 60;

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

function positiveInt(value: string | undefined): number | null {
	if (!value || !/^\d+$/.test(value)) return null;
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function price(value: string | undefined): number | null {
	if (!value || !/^\d+$/.test(value)) return null;
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function parseFilters(params: RawSearchParams): SearchFilters {
	const condition = first(params.condition) as ProductCondition | undefined;
	return {
		q: first(params.q)?.trim() ?? '',
		categoryId: positiveInt(first(params.categoryId)),
		sellerUniversityId: positiveInt(first(params.sellerUniversityId)),
		provinceCode: positiveInt(first(params.provinceCode)),
		wardCode: positiveInt(first(params.wardCode)),
		condition:
			condition && condition in PRODUCT_CONDITION_LABELS ? condition : null,
		minPrice: price(first(params.minPrice)),
		maxPrice: price(first(params.maxPrice)),
		page: positiveInt(first(params.page)) ?? DEFAULT_SEARCH_FILTERS.page,
	};
}

function productQuery(filters: SearchFilters): ProductQuery {
	return {
		keyword: filters.q || undefined,
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

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	const filters = parseFilters(await searchParams);
	const [categories, provinces, response] = await Promise.all([
		getCategories(),
		getProvincesWithWards(),
		getProducts(productQuery(filters))
			.then((result) => ({ result, error: null as string | null }))
			.catch(() => ({
				result: null as PaginatedProducts | null,
				error: 'Không thể tải tin đăng. Vui lòng thử lại.',
			})),
	]);

	const selectedCategory = categories
		.flatMap((category) => [category, ...(category.children ?? [])])
		.find((category) => category.id === filters.categoryId);
	const key = JSON.stringify(filters);

	return (
		<SearchResultsClient
			key={key}
			filters={filters}
			categories={categories}
			provinces={provinces}
			initialResult={response.result}
			initialError={response.error}
			contextLabel={selectedCategory?.name}
		/>
	);
}
