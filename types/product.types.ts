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

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
	DRAFT: 'Nháp',
	PENDING: 'Chờ duyệt',
	ACTIVE: 'Đang hiển thị',
	REJECTED: 'Bị từ chối',
	SOLD: 'Đã bán',
	EXPIRED: 'Hết hạn',
	BANNED: 'Bị khoá',
	CANCELLED: 'Đã huỷ',
};

export type ProductImage = {
	id: number;
	url: string;
	publicId: string;
	order: number;
};

// List shape: includes category + images, no `seller` (that's detail-only).
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
	// Public product lists receive this viewer-specific flag when the request
	// includes a valid bearer token; it is false for signed-out visitors.
	isSaved?: boolean;
	sellerId: number;
	// Public lists expose this minimal seller attribute so the browse experience
	// can identify listings from the viewer's university without exposing a profile.
	sellerUniversityId?: number | null;
	createdAt: string;
	updatedAt: string;
};

// Public seller info attached to GET /products/:id only. No email/address —
// only what a buyer needs to decide whether to reach out.
export type ProductSeller = {
	id: number;
	fullName: string;
	avatar: string;
	phone: string;
	avgRating: number;
	responseRate: number;
	university: { id: number; name: string } | null;
};

// GET /products/:id shape: Product plus `seller` and viewer-specific
// `isSaved` (false when signed out). `category.parent` only populated here.
export type ProductDetail = Product & {
	seller: ProductSeller;
	isSaved: boolean;
};

// GET /products/saved keeps the bookmark's timestamp alongside the usual
// public listing shape, so the client can group a user's saved shelf by time.
export type SavedProduct = {
	product: Product;
	savedAt: string;
};

// A pending edit staged against an ACTIVE listing — PATCH /products/:id doesn't
// apply live edits, it queues them for moderation. Only the ref is returned by
// GET /products/me, never the staged content itself.
export type ProductRevisionRef = { id: number; updatedAt: string };

// GET /products/me shape: Product plus the two seller-only moderation fields.
// Kept off `Product` on purpose — the public GET /products never returns them,
// so putting them there would either break every list caller (if required) or
// misrepresent this endpoint (if optional).
export type MyProduct = Product & {
	rejectedReason: string | null;
	revision: ProductRevisionRef | null;
	// Set once the listing is approved into ACTIVE (see backend AGENTS.md →
	// Re-review Flow); null for every other status.
	expiresAt: string | null;
};
