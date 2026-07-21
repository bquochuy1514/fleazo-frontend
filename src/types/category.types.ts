export interface Category {
	id: number;
	name: string;
	slug: string;
	icon: string;
	parentId: number | null;
	createdAt: string;
	updatedAt: string;
	children?: Category[];
}
