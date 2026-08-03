import type { User } from '@/types/user.types';

// Mirrors the backend's seller-profile gate for an instant UX precheck;
// backend still enforces server-side. universityId excluded (not required).
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
