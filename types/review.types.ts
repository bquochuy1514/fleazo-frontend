export type Review = {
	id: number;
	reviewerId: number;
	sellerId: number;
	rating: number;
	comment: string | null;
	createdAt: string;
	updatedAt: string;
	reviewer: {
		id: number;
		fullName: string;
		avatar: string;
	};
};

export type PaginatedReviews = {
	data: Review[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

// A review I wrote about a seller — same row as Review, but joined with the
// seller instead of the reviewer (I already know I'm the reviewer).
export type GivenReview = {
	id: number;
	reviewerId: number;
	sellerId: number;
	rating: number;
	comment: string | null;
	createdAt: string;
	updatedAt: string;
	seller: {
		id: number;
		fullName: string;
		avatar: string;
	};
};

export type PaginatedGivenReviews = {
	data: GivenReview[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};
