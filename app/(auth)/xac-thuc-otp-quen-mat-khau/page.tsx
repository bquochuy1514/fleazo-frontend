import type { Metadata } from 'next';
import { VerifyForgotOtpPageClient } from './xac-thuc-otp-quen-mat-khau-client';

export const metadata: Metadata = {
	title: 'Xác thực mã OTP — Fleazo',
	description: 'Nhập mã OTP đã gửi tới email để đặt lại mật khẩu Fleazo.',
	robots: { index: false },
};

export default function VerifyForgotOtpPage() {
	return <VerifyForgotOtpPageClient />;
}
