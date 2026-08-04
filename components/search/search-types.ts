import type { ProductCondition } from '@/types/product.types';

export type SearchFilters = {
	q: string;
	categoryId: number | null;
	sellerUniversityId: number | null;
	provinceCode: number | null;
	wardCode: number | null;
	condition: ProductCondition | null;
	minPrice: number | null;
	maxPrice: number | null;
	page: number;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
	q: '',
	categoryId: null,
	sellerUniversityId: null,
	provinceCode: null,
	wardCode: null,
	condition: null,
	minPrice: null,
	maxPrice: null,
	page: 1,
};

export function searchHref(filters: SearchFilters): string {
	const params = new URLSearchParams();
	if (filters.q.trim()) params.set('q', filters.q.trim());
	if (filters.categoryId !== null) {
		params.set('categoryId', String(filters.categoryId));
	}
	if (filters.sellerUniversityId !== null) {
		params.set('sellerUniversityId', String(filters.sellerUniversityId));
	}
	if (filters.provinceCode !== null) {
		params.set('provinceCode', String(filters.provinceCode));
	}
	if (filters.wardCode !== null) params.set('wardCode', String(filters.wardCode));
	if (filters.condition) params.set('condition', filters.condition);
	if (filters.minPrice !== null) params.set('minPrice', String(filters.minPrice));
	if (filters.maxPrice !== null) params.set('maxPrice', String(filters.maxPrice));
	if (filters.page > 1) params.set('page', String(filters.page));

	const query = params.toString();
	return query ? `/tim-kiem?${query}` : '/tim-kiem';
}

export function filterCount(filters: SearchFilters): number {
	let count = 0;
	if (filters.categoryId !== null) count += 1;
	if (filters.sellerUniversityId !== null) count += 1;
	if (filters.provinceCode !== null || filters.wardCode !== null) count += 1;
	if (filters.condition) count += 1;
	if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
	return count;
}
