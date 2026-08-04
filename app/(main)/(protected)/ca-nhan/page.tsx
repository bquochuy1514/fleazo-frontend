import type { Metadata } from 'next';
import { getProvincesWithWards } from '@/lib/locations';
import { ProfileClient } from './_components/profile-client';

export const metadata: Metadata = {
	title: 'Hồ sơ cá nhân — Fleazo',
	description: 'Cập nhật thông tin cá nhân trên Fleazo.',
};

// Location data is shared with the listing form and cached by its source.
export default async function PersonalProfilePage() {
	const provinces = await getProvincesWithWards();

	return <ProfileClient provinces={provinces} />;
}
