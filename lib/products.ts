import { api } from '@/lib/api';
import type {
	Product,
	ProductCondition,
	ProductDetail,
} from '@/types/product.types';

// Field names must match CreateProductDto exactly (fleazo-backend
// src/modules/products/dto/create-product.dto.ts) — reused to type
// ApiErrorResponse<ProductField> for field-level errors on dang-tin.
export type ProductField =
	| 'title'
	| 'description'
	| 'price'
	| 'provinceCode'
	| 'provinceName'
	| 'wardCode'
	| 'wardName'
	| 'addressDetail'
	| 'condition'
	| 'categoryId';

export type ProductFormPayload = {
	title: string;
	description: string;
	price?: number;
	provinceCode?: number;
	provinceName?: string;
	wardCode?: number;
	wardName?: string;
	addressDetail?: string;
	condition?: ProductCondition | '';
	categoryId?: number;
};

function buildProductFormData(payload: ProductFormPayload, images: File[]) {
	const formData = new FormData();
	Object.entries(payload).forEach(([key, value]) => {
		if (value === undefined || value === '') return;
		formData.append(key, String(value));
	});
	images.forEach((file) => formData.append('images', file));
	return formData;
}

export async function createProduct(
	payload: ProductFormPayload,
	images: File[],
): Promise<Product> {
	const { data } = await api.post<Product>(
		'/products',
		buildProductFormData(payload, images),
	);
	return data;
}

export async function createDraft(
	payload: ProductFormPayload,
	images: File[],
): Promise<Product> {
	const { data } = await api.post<Product>(
		'/products/draft',
		buildProductFormData(payload, images),
	);
	return data;
}

// Plain text/image edits only (PATCH /products/:id) — never changes status.
// deleteImageIds is the only image instruction sent; imagesOrder is
// deliberately omitted, so the backend falls back to its own default order
// (remaining existing images, then new uploads in upload order).
export async function updateProduct(
	id: number,
	payload: ProductFormPayload,
	newImages: File[],
	deleteImageIds: number[] = [],
): Promise<Product> {
	const formData = buildProductFormData(payload, newImages);
	if (deleteImageIds.length > 0) {
		formData.append('deleteImageIds', JSON.stringify(deleteImageIds));
	}
	const { data } = await api.patch<Product>(`/products/${id}`, formData);
	return data;
}

// quan-ly-tin (not built yet) hands the full Product object to dang-tin's
// edit mode through sessionStorage ahead of navigating here — avoids a
// second fetch, and there's no "get one of my products regardless of
// status" endpoint (GET /products/:id is ACTIVE-only). Only a reader exists
// so far; add the writer (setEditProductCache) alongside quan-ly-tin once
// that page is built.
const EDIT_CACHE_KEY = 'fz:edit-product';

export function getEditProductCache(id: number): Product | null {
	const raw = sessionStorage.getItem(EDIT_CACHE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as Product;
		return parsed.id === id ? parsed : null;
	} catch {
		return null;
	}
}

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

// Public detail (GET /products/:id) — ACTIVE-only, includes `seller` and the
// viewer-specific `isSaved`. Throws (404) for a missing/non-ACTIVE product;
// callers on a page route should catch that and call notFound().
export async function getProduct(id: number): Promise<ProductDetail> {
	const { data } = await api.get<ProductDetail>(`/products/${id}`);
	return data;
}

// Bookmark ("Lưu tin") a listing — distinct from createDraft's "Lưu nháp",
// an unrelated concept (an unpublished listing vs. a buyer's saved list).
export async function saveProduct(id: number): Promise<void> {
	await api.post(`/products/${id}/save`);
}

export async function unsaveProduct(id: number): Promise<void> {
	await api.delete(`/products/${id}/save`);
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
