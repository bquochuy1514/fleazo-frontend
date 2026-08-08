import type { Metadata } from 'next';
import { AdminGuard } from '@/components/auth/admin-guard';
import { AdminClient } from './admin-client';

export const metadata: Metadata = {
	title: 'Quản trị — Fleazo',
	description: 'Duyệt tin đăng và thay đổi đang chờ xử lý trên Fleazo.',
};

export default function AdminPage() {
	return (
		<AdminGuard>
			<AdminClient />
		</AdminGuard>
	);
}
