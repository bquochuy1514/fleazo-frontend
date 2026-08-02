import type { Metadata } from 'next';
import { RegisterPageClient } from './dang-ky-client';

export const metadata: Metadata = {
	title: 'Đăng ký — Fleazo',
	description: 'Tạo tài khoản Fleazo để bắt đầu mua bán đồ cũ.',
	robots: { index: false },
};

export default function RegisterPage() {
	return <RegisterPageClient />;
}
