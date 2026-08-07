import type { Metadata } from 'next';
import { TinNhanPageClient } from './tin-nhan-client';

export const metadata: Metadata = {
	title: 'Tin nhắn — Fleazo',
	description: 'Trò chuyện với người mua và người bán trên Fleazo.',
};

export default function TinNhanPage() {
	return <TinNhanPageClient />;
}
