import { api } from '@/lib/api';
import type { Product, ProductCondition } from '@/types/product.types';

export type PaginatedProducts = {
	data: Product[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type ProductQuery = {
	// A parent category id aggregates every child's listings server-side —
	// see ProductsService.findAll. A leaf/child id filters to just that one.
	categoryId?: number;
	provinceCode?: number;
	wardCode?: number;
	condition?: ProductCondition;
	minPrice?: number;
	maxPrice?: number;
	keyword?: string;
	page?: number;
	limit?: number;
};

// Public listing (GET /products) — ACTIVE-only, newest first. Used by the
// homepage's "Tin mới đăng" section.
export async function getProducts(
	query: ProductQuery = {},
): Promise<PaginatedProducts> {
	const { data } = await api.get<PaginatedProducts>('/products', {
		params: query,
	});
	return data;
}

// Ward + province when both are set, province alone otherwise.
export function locationLabel(product: Product): string | undefined {
	if (product.wardName && product.provinceName) {
		return `${product.wardName}, ${product.provinceName}`;
	}
	return product.provinceName || undefined;
}

// order=0 is the thumbnail — same convention wherever a product's cover
// image is shown.
export function firstImageUrl(product: Product): string | undefined {
	return [...product.images].sort((a, b) => a.order - b.order)[0]?.url;
}
