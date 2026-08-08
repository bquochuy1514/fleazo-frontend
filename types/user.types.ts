// Shape returned by GET /users/profile — sensitive fields (password,
// tokens, OTP) omitted. Reused anywhere a user entity is displayed.
export type User = {
	id: number;
	email: string;
	fullName: string;
	phone: string | null;
	avatar: string;
	role: 'CUSTOMER' | 'ADMIN';
	provinceCode: number | null;
	provinceName: string | null;
	wardCode: number | null;
	wardName: string | null;
	addressDetail: string | null;
	universityId: number | null;
	university: { id: number; name: string } | null;
	isActive: boolean;
	isBanned: boolean;
	avgRating: number;
	completionRate: number;
	responseRate: number;
	hasPassword: boolean;
	createdAt: string;
	updatedAt: string;
};

// GET /users/:id/public — fully public, no auth required. Deliberately thin:
// no phone/university/addressDetail. avgRating/reviewCount are computed live
// from the reviews table (see ReviewsService.getSellerRatingSummary on the
// backend) — always present, 0 when the seller has no reviews yet.
export type PublicUser = {
	id: number;
	fullName: string;
	avatar: string;
	provinceName: string | null;
	wardName: string | null;
	createdAt: string;
	avgRating: number;
	reviewCount: number;
};
