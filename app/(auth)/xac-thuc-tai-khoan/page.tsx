import type { Metadata } from 'next';
import { VerifyAccountPageClient } from './xac-thuc-tai-khoan-client';

export const metadata: Metadata = {
	title: 'Xác thực tài khoản — Fleazo',
	description: 'Nhập mã OTP để xác thực tài khoản Fleazo.',
	robots: { index: false },
};

export default function VerifyAccountPage() {
	return <VerifyAccountPageClient />;
}
