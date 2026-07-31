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
