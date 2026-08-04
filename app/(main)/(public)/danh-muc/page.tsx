import type { Metadata } from 'next';
import { CategoryDirectory } from '@/components/categories/category-directory';
import { getCategories } from '@/lib/categories';

export const metadata: Metadata = {
	title: 'Danh mục — Fleazo',
	description: 'Khám phá các loại đồ đang được trao tay trong chợ Fleazo.',
};

// axios is not tracked by Next's fetch cache, so keep this aligned with Home.
export const revalidate = 60;

export default async function CategoriesPage() {
	const categories = await getCategories();

	return <CategoryDirectory categories={categories} />;
}
