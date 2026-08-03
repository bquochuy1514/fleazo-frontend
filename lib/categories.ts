import { api } from './api';
import type { Category } from '@/types/category.types';

// Root categories with children, for Header/Home nav. Falls back to []
// instead of throwing so a failed fetch doesn't take the page down.
export async function getCategories(): Promise<Category[]> {
	try {
		const { data } = await api.get<Category[]>('/categories');
		return data;
	} catch (err) {
		console.error('[getCategories] failed:', err);
		return [];
	}
}
