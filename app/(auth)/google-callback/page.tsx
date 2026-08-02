import type { Metadata } from 'next';
import { GoogleCallbackPageClient } from './google-callback-client';

export const metadata: Metadata = {
	title: 'Đang đăng nhập — Fleazo',
	description: 'Đang hoàn tất đăng nhập bằng Google.',
	robots: { index: false },
};

export default function GoogleCallbackPage() {
	return <GoogleCallbackPageClient />;
}
