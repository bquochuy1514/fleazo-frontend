import { api } from '@/lib/api';
import type { PublicUser } from '@/types/user.types';

// GET /users/:id/public — no auth required, works for both the profile page
// (server-rendered) and tin-nhan's ?sellerId= entry point (client-rendered).
export async function getPublicUserProfile(id: number): Promise<PublicUser> {
	const { data } = await api.get<PublicUser>(`/users/${id}/public`);
	return data;
}
