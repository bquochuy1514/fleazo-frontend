import type { Metadata } from 'next';
import { getProvincesWithWards } from '@/lib/locations';
import { DangTinPageClient } from './dang-tin-client';

export const metadata: Metadata = {
	title: 'Đăng tin bán — Fleazo',
	description:
		'Đăng tin bán đồ cũ miễn phí trên Fleazo — chợ đồ cũ dành cho sinh viên.',
};

export default async function DangTinPage() {
	const provinces = await getProvincesWithWards();

	return <DangTinPageClient provinces={provinces} />;
}
