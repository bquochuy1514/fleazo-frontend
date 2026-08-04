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
