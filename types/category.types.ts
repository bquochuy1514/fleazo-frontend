export interface Category {
	id: number;
	name: string;
	slug: string;
	parentId: number | null;
	createdAt: string;
	updatedAt: string;
	children?: Category[];
	// Only present on GET /products/:id — leaf category's parent.
	parent?: Category | null;
}
