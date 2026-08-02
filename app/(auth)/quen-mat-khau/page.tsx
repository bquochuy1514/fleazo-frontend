import type { Metadata } from 'next';
import { ForgotPasswordPageClient } from './quen-mat-khau-client';

export const metadata: Metadata = {
	title: 'Quên mật khẩu — Fleazo',
	description: 'Nhập email để nhận mã xác thực đặt lại mật khẩu Fleazo.',
	robots: { index: false },
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordPageClient />;
}
