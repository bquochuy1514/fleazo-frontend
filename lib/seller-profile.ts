import type { User } from '@/types/user.types';

// Mirrors the backend's seller-profile gate so the "complete your profile"
// modal can show instantly without an API round trip — a UX precheck only,
// the backend still enforces this server-side either way. universityId isn't
// included — not every seller is a university student.
export type MissingSellerField = 'phone' | 'address' | 'password';

export function getMissingSellerFields(user: User): MissingSellerField[] {
	const missing: MissingSellerField[] = [];

	if (!user.phone) missing.push('phone');
	if (user.provinceCode === null || user.wardCode === null) {
		missing.push('address');
	}
	if (!user.hasPassword) missing.push('password');

	return missing;
}
