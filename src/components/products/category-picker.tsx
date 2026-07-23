'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Category } from '@/types/category.types';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

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

	const parentPlaceholder = isLoading ? 'Đang tải...' : 'Chọn danh mục';

	const handleParentChange = (value: string | null) => {
		const id = value ? Number(value) : null;
		setParentId(id);
		setChildId(null);
		onChange?.(null);
	};

	const handleChildChange = (value: string | null) => {
		const id = value ? Number(value) : null;
		setChildId(id);
		onChange?.(id);
	};

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<Select
				value={parentId ? String(parentId) : undefined}
				onValueChange={handleParentChange}
				disabled={isLoading}
			>
				<SelectTrigger className="w-full !h-11">
					<SelectValue placeholder={parentPlaceholder}>
						{(value: string | null) =>
							value
								? (parents.find((p) => String(p.id) === value)
										?.name ?? parentPlaceholder)
								: parentPlaceholder
						}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{parents.map((p) => (
						<SelectItem key={p.id} value={String(p.id)}>
							{p.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={childId ? String(childId) : undefined}
				onValueChange={handleChildChange}
				disabled={!parentId}
			>
				<SelectTrigger className="w-full !h-11">
					<SelectValue placeholder="Chọn danh mục con">
						{(value: string | null) =>
							value
								? (children.find((c) => String(c.id) === value)
										?.name ?? 'Chọn danh mục con')
								: 'Chọn danh mục con'
						}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{children.map((c) => (
						<SelectItem key={c.id} value={String(c.id)}>
							{c.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
