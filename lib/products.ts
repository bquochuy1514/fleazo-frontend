import { api } from '@/lib/api';
import type {
	Product,
	ProductCondition,
	ProductDetail,
} from '@/types/product.types';

// Must match CreateProductDto field names exactly — used to type
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
// imagesOrder is omitted on purpose; backend defaults to its own order.
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

// quan-ly-tin (not built yet) will pass the full Product via sessionStorage
// before navigating to edit mode — no "get my product regardless of status"
// endpoint exists (GET /products/:id is ACTIVE-only). Reader only for now.
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
	// A parent category id aggregates every child's listings; a leaf id filters to just that one.
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

// Public listing (GET /products) — ACTIVE-only, newest first.
export async function getProducts(
	query: ProductQuery = {},
): Promise<PaginatedProducts> {
	const { data } = await api.get<PaginatedProducts>('/products', {
		params: query,
	});
	return data;
}

// Public detail (GET /products/:id) — ACTIVE-only. Throws 404 for
// missing/non-ACTIVE products; page routes should catch and call notFound().
export async function getProduct(id: number): Promise<ProductDetail> {
	const { data } = await api.get<ProductDetail>(`/products/${id}`);
	return data;
}

// Bookmark ("Lưu tin") — distinct from createDraft's "Lưu nháp" (unpublished listing vs. saved list).
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
