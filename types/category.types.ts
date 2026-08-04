export interface Category {
	id: number;
	name: string;
	slug: string;
	parentId: number | null;
	// Homepage category-circle cutout — root categories only, null until seeded.
	image: string | null;
	// ACTIVE-listing rollup across a root's children — only present on root
	// categories from GET /categories, undefined elsewhere (e.g. GET /products'
	// nested category, or leaf entries within `children`).
	productCount?: number;
	createdAt: string;
	updatedAt: string;
	children?: Category[];
	// Only present on GET /products/:id — leaf category's parent.
	parent?: Category | null;
}
