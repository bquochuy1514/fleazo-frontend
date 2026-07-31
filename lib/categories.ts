import { api } from './api';
import type { Category } from '@/types/category.types';

// Root categories with children (GET /categories) — used by Header/Home to
// render category navigation. Falls back to [] on failure rather than
// throwing — a category fetch failing shouldn't take the whole page down.
export async function getCategories(): Promise<Category[]> {
	try {
		const { data } = await api.get<Category[]>('/categories');
		return data;
	} catch (err) {
		console.error('[getCategories] failed:', err);
		return [];
	}
}
