'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Category } from '@/types/category.types';

type CategoryPickerProps = {
	onChange?: (categoryId: number | null) => void;
};

export function CategoryPicker({ onChange }: CategoryPickerProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [parentId, setParentId] = useState<number | null>(null);
	const [childId, setChildId] = useState<number | null>(null);

	useEffect(() => {
		api.get<Category[]>('/categories')
			.then(({ data }) => setCategories(data))
			.finally(() => setIsLoading(false));
	}, []);

	const parents = categories.filter((c) => c.parentId === null);
	const children = parents.find((p) => p.id === parentId)?.children ?? [];

	const handleParentChange = (value: string) => {
		const id = value ? Number(value) : null;
		setParentId(id);
		setChildId(null);
		onChange?.(null);
	};

	const handleChildChange = (value: string) => {
		const id = value ? Number(value) : null;
		setChildId(id);
		onChange?.(id);
	};

	const selectClassName =
		'h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-fz-ink outline-none focus:border-fz-primary disabled:opacity-50';

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<select
				value={parentId ?? ''}
				onChange={(e) => handleParentChange(e.target.value)}
				disabled={isLoading}
				className={selectClassName}
			>
				<option value="">
					{isLoading ? 'Đang tải...' : 'Chọn danh mục'}
				</option>
				{parents.map((p) => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>

			<select
				value={childId ?? ''}
				onChange={(e) => handleChildChange(e.target.value)}
				disabled={!parentId}
				className={selectClassName}
			>
				<option value="">Chọn danh mục con</option>
				{children.map((c) => (
					<option key={c.id} value={c.id}>
						{c.name}
					</option>
				))}
			</select>
		</div>
	);
}
