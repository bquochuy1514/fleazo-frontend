import { api } from '@/lib/api';
import type { PendingProduct, PendingRevision } from '@/types/product.types';

export type PaginatedQueue<T> = {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type QueueQuery = { page?: number; limit?: number };

// GET /products/admin/pending — every PENDING product across all sellers,
// oldest first. Admin-only (RolesGuard) — 403s for a non-admin caller.
export async function getPendingProducts(
	query: QueueQuery = {},
): Promise<PaginatedQueue<PendingProduct>> {
	const { data } = await api.get<PaginatedQueue<PendingProduct>>(
		'/products/admin/pending',
		{ params: query },
	);
	return data;
}

// GET /products/admin/revisions — every ACTIVE listing with a staged edit
// waiting on approval, oldest first.
export async function getPendingRevisions(
	query: QueueQuery = {},
): Promise<PaginatedQueue<PendingRevision>> {
	const { data } = await api.get<PaginatedQueue<PendingRevision>>(
		'/products/admin/revisions',
		{ params: query },
	);
	return data;
}

export async function adminApproveProduct(id: number): Promise<void> {
	await api.patch(`/products/${id}/approve`);
}

export async function adminRejectProduct(
	id: number,
	reason: string,
): Promise<void> {
	await api.patch(`/products/${id}/reject`, { reason });
}

// Both revision endpoints key off the PRODUCT id, not the ProductRevision
// row's own id — pass PendingRevision.product.id, not PendingRevision.id.
export async function adminApproveRevision(productId: number): Promise<void> {
	await api.patch(`/products/${productId}/revision/approve`);
}

export async function adminRejectRevision(
	productId: number,
	reason: string,
): Promise<void> {
	await api.patch(`/products/${productId}/revision/reject`, { reason });
}
