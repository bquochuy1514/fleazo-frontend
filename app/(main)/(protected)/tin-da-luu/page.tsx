import type { Metadata } from 'next';
import { SavedListingsClient } from './saved-listings-client';

export const metadata: Metadata = {
	title: 'Tin đã lưu — Fleazo',
	description: 'Những tin bạn đã lưu để xem lại trên Fleazo.',
};

export default function SavedListingsPage() {
	return <SavedListingsClient />;
}
