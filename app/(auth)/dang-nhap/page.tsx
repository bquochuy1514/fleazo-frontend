import type { Metadata } from 'next';
import { LoginPageClient } from './dang-nhap-client';

export const metadata: Metadata = {
	title: 'Đăng nhập — Fleazo',
	description: 'Đăng nhập vào Fleazo để tiếp tục mua bán đồ cũ.',
	robots: { index: false },
};

export default function LoginPage() {
	return <LoginPageClient />;
}
