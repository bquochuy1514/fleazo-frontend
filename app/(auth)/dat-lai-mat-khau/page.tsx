import type { Metadata } from 'next';
import { ResetPasswordPageClient } from './dat-lai-mat-khau-client';

export const metadata: Metadata = {
	title: 'Đặt lại mật khẩu — Fleazo',
	description: 'Tạo mật khẩu mới cho tài khoản Fleazo của bạn.',
	robots: { index: false },
};

export default function ResetPasswordPage() {
	return <ResetPasswordPageClient />;
}
