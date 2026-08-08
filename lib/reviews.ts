import { api } from '@/lib/api';
import type { PaginatedReviews, Review } from '@/types/review.types';

// Upsert — reviewing the same seller again overwrites the existing review
// instead of creating a second one (backend enforces one row per
// reviewer-seller pair). Requires the reviewer to have exchanged at least
// one message with the seller; the backend returns errorCode
// NOT_ELIGIBLE_TO_REVIEW / CANNOT_REVIEW_SELF otherwise.
export async function createOrUpdateReview(payload: {
	sellerId: number;
	rating: number;
	comment?: string;
}): Promise<Review> {
	const { data } = await api.post<Review>('/reviews', payload);
	return data;
}

export async function getSellerReviews(
	sellerId: number,
	params?: { page?: number; limit?: number },
): Promise<PaginatedReviews> {
	const { data } = await api.get<PaginatedReviews>(`/reviews/seller/${sellerId}`, {
		params,
	});
	return data;
}
