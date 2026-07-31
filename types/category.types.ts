export interface Category {
	id: number;
	name: string;
	slug: string;
	parentId: number | null;
	createdAt: string;
	updatedAt: string;
	children?: Category[];
	// Only present on GET /products/:id — the leaf category's parent, for
	// a "Danh mục cha/Danh mục con" line on the detail page.
	parent?: Category | null;
}
