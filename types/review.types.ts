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
