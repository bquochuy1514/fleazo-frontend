import type { Metadata } from 'next';
import { DanhGiaCuaToiClient } from './danh-gia-cua-toi-client';

export const metadata: Metadata = {
	title: 'Đánh giá của tôi — Fleazo',
	description: 'Đánh giá bạn đã nhận được và đã gửi trên Fleazo.',
};

export default function DanhGiaCuaToiPage() {
	return <DanhGiaCuaToiClient />;
}
