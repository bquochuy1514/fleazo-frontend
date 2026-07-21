// Shape returned by GET /users/profile (handleGetProfile in users.service.ts)
// — full User model minus password/hashedRefreshToken/codeOtp/
// codeOtpExpiration/isOtpVerified. Dates arrive as ISO strings over JSON.
// Reused anywhere a user entity is displayed — profile, chat participant,
// product seller info, admin panel, review author — not auth-specific.
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
	isActive: boolean;
	isBanned: boolean;
	avgRating: number;
	completionRate: number;
	responseRate: number;
	createdAt: string;
	updatedAt: string;
};
