import { api } from '@/lib/api';
import type { ListingSuggestion } from '@/types/product.types';

export async function suggestListing(
	images: File[],
): Promise<ListingSuggestion> {
	const formData = new FormData();
	images.forEach((file) => formData.append('images', file));

	const { data } = await api.post<ListingSuggestion>(
		'/products/listing-assistant/suggest',
		formData,
	);
	return data;
}
