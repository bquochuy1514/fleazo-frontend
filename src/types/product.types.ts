// Mirrors backend's ProductCondition enum (generated/prisma/client) — see
// fleazo-backend AGENTS.md → Design System → Signature element for the
// "tag treo" condition badge this also feeds.
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

// Best-effort based on CreateProductDto + Product Schema Decisions in
// fleazo-backend AGENTS.md — not confirmed against the actual service
// response shape yet.
export type Product = {
	id: number;
	title: string;
	description: string;
	price: number;
	condition: ProductCondition;
	status: ProductStatus;
	categoryId: number;
	provinceCode: number;
	provinceName: string;
	wardCode: number;
	wardName: string;
	addressDetail: string;
	images: ProductImage[];
	qualityScore: number;
	rejectedReason: string | null;
	sellerId: number;
	createdAt: string;
	updatedAt: string;
};
