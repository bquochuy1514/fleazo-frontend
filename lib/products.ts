import { api } from '@/lib/api';
import type { ProductMatchBadge } from '@/components/listings/listing-card';
import type {
	MyProduct,
	Product,
	ProductCondition,
	ProductDetail,
	SavedProduct,
	ProductStatus,
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

export type ProductImageOrderItem =
	| { type: 'existing'; id: number }
	| { type: 'new'; fileIndex: number };

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
// A complete imagesOrder lets the seller promote any image to the cover slot.
export async function updateProduct(
	id: number,
	payload: ProductFormPayload,
	newImages: File[],
	deleteImageIds: number[] = [],
	imagesOrder: ProductImageOrderItem[] = [],
): Promise<Product> {
	const formData = buildProductFormData(payload, newImages);
	if (deleteImageIds.length > 0) {
		formData.append('deleteImageIds', JSON.stringify(deleteImageIds));
	}
	if (imagesOrder.length > 0) {
		formData.append('imagesOrder', JSON.stringify(imagesOrder));
	}
	const { data } = await api.patch<Product>(`/products/${id}`, formData);
	return data;
}

// quan-ly-tin hands the full Product to dang-tin through sessionStorage rather
// than a fetch: GET /products/me returns every status, but GET /products/:id is
// ACTIVE-only, so there's no way to re-fetch one DRAFT/PENDING listing by id on
// a cold load. Must be the complete object — dang-tin reads `category.name` and
// `images` off it, which a trimmed projection would drop.
const EDIT_CACHE_KEY = 'fz:edit-product';

export function setEditProductCache(product: Product): void {
	sessionStorage.setItem(EDIT_CACHE_KEY, JSON.stringify(product));
}

// Deliberately never cleared after a read: dang-tin's mount effect runs twice
// under StrictMode, and clearing on the first pass left the second one empty.
// The id check below is what actually guards against a stale entry.
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
	// Filters to listings whose seller belongs to this university.
	sellerUniversityId?: number;
	sellerId?: number;
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

export type MyProductQuery = {
	status?: ProductStatus;
	keyword?: string;
	page?: number;
	limit?: number;
};

export type PaginatedMyProducts = Omit<PaginatedProducts, 'data'> & {
	data: MyProduct[];
};

// The signed-in seller's own listings (GET /products/me) — unlike GET /products
// this returns every status, and adds `rejectedReason` + `revision`. Omitting
// `status` returns all of them. Always sorted createdAt desc; no sort param.
export async function getMyProducts(
	query: MyProductQuery = {},
): Promise<PaginatedMyProducts> {
	const { data } = await api.get<PaginatedMyProducts>('/products/me', {
		params: query,
	});
	return data;
}

// Every seller-side state change goes through this one endpoint: publishing a
// draft, marking sold, and withdrawing a listing are all just transitions.
// JSON body, unlike the multipart create/update calls above.
export async function updateProductStatus(
	id: number,
	status: ProductStatus,
): Promise<Product> {
	const { data } = await api.patch<Product>(`/products/${id}/status`, {
		status,
	});
	return data;
}

// Mirrors the backend's own whitelist — anything omitted here is a dead end the
// seller can't leave (REJECTED can't be resubmitted; SOLD/CANCELLED are final).
export const SELLER_STATUS_TRANSITIONS: Record<ProductStatus, ProductStatus[]> =
	{
		DRAFT: ['PENDING', 'CANCELLED'],
		PENDING: ['CANCELLED'],
		ACTIVE: ['SOLD', 'CANCELLED'],
		REJECTED: [],
		SOLD: [],
		EXPIRED: [],
		CANCELLED: [],
		BANNED: [],
	};

// Bookmark ("Lưu tin") — distinct from createDraft's "Lưu nháp" (unpublished listing vs. saved list).
export async function saveProduct(id: number): Promise<void> {
	await api.post(`/products/${id}/save`);
}

export async function unsaveProduct(id: number): Promise<void> {
	await api.delete(`/products/${id}/save`);
}

export type SavedProductQuery = {
	page?: number;
	limit?: number;
};

export type PaginatedSavedProducts = Omit<PaginatedProducts, 'data'> & {
	data: SavedProduct[];
};

export async function getSavedProducts(
	query: SavedProductQuery = {},
): Promise<PaginatedSavedProducts> {
	const { data } = await api.get<PaginatedSavedProducts>('/products/saved', {
		params: query,
	});
	return data;
}

export type RelatedProductItem = { product: Product; badge?: ProductMatchBadge };

// Product-context related items for a detail page: same seller → same leaf
// category → same parent category (broader sibling group) → newest,
// deduped, excluding the product itself. Pure product-context (no viewer
// identity involved) — unlike the homepage feed, this can run entirely
// server-side.
//
// `product.category.parent` is only populated by GET /products/:id (see
// `Category.parent` in types/category.types.ts) — callers must pass a
// product fetched via `getProduct`, not a bare list item from `getProducts`.
export async function getRelatedProducts(
	product: Product,
	limit: number,
): Promise<RelatedProductItem[]> {
	const merged: RelatedProductItem[] = [];
	const seen = new Set<number>([product.id]);

	const addAll = (products: Product[], badge?: ProductMatchBadge) => {
		for (const p of products) {
			if (merged.length >= limit) break;
			if (seen.has(p.id)) continue;
			seen.add(p.id);
			merged.push({ product: p, badge });
		}
	};

	const bySeller = await getProducts({
		sellerId: product.sellerId,
		limit: limit + 1,
	});
	addAll(bySeller.data, 'seller');

	if (merged.length < limit) {
		const byCategory = await getProducts({
			categoryId: product.categoryId,
			limit: limit + 1,
		});
		addAll(byCategory.data, 'category');
	}

	const parentCategoryId = product.category.parent?.id;
	if (merged.length < limit && parentCategoryId) {
		const byParentCategory = await getProducts({
			categoryId: parentCategoryId,
			limit: limit + 1,
		});
		addAll(byParentCategory.data, 'parentCategory');
	}

	if (merged.length < limit) {
		const newest = await getProducts({ limit: limit + 1 });
		addAll(newest.data);
	}

	return merged;
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
