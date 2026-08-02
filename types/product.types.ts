import type { Category } from './category.types';

// Mirrors backend's ProductCondition enum
export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

export const PRODUCT_CONDITION_LABELS: Record<ProductCondition, string> = {
	NEW: 'Mới',
	LIKE_NEW: 'Như mới',
	GOOD: 'Tốt',
	FAIR: 'Khá',
	POOR: 'Cũ',
};

// Response shape of POST /products/listing-assistant/suggest (fleazo-ai)
export type ListingSuggestion = {
	title: string;
	description: string;
	categoryId: number;
};

export type ProductStatus =
	| 'DRAFT'
	| 'PENDING'
	| 'ACTIVE'
	| 'REJECTED'
	| 'SOLD'
	| 'EXPIRED'
	| 'BANNED'
	| 'CANCELLED';

export type ProductImage = {
	id: number;
	url: string;
	publicId: string;
	order: number;
};

// Confirmed against ProductsService.findAll (fleazo-backend
// src/modules/products/products.service.ts) — `include: { category: true,
// images: true }`. No `seller` field here — that only appears on
// GET /products/:id (findOne), not this list endpoint.
export type Product = {
	id: number;
	title: string;
	description: string;
	// Prisma Decimal serializes to string in JSON — see formatPrice.
	price: string;
	condition: ProductCondition;
	status: ProductStatus;
	categoryId: number;
	category: Category;
	provinceCode: number;
	provinceName: string;
	wardCode: number;
	wardName: string;
	addressDetail: string;
	images: ProductImage[];
	qualityScore: number;
	saveCount: number;
	sellerId: number;
	createdAt: string;
	updatedAt: string;
};

// Public seller info attached to GET /products/:id only — mirrors the
// `select` in ProductsService.findOne (fleazo-backend). No email/address:
// that endpoint deliberately exposes only what a buyer needs to decide
// whether to reach out.
export type ProductSeller = {
	id: number;
	fullName: string;
	avatar: string;
	phone: string;
	avgRating: number;
	responseRate: number;
	university: { id: number; name: string } | null;
};

// GET /products/:id's actual shape: the list endpoint's Product plus
// `seller` and the viewer-specific `isSaved` (false for a signed-out
// viewer — see ProductsService.findOne). `category.parent` is also only
// ever populated here, not on the list endpoint.
export type ProductDetail = Product & {
	seller: ProductSeller;
	isSaved: boolean;
};
