'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Tags } from 'lucide-react';
import { getCategories } from '@/lib/categories';
import {
	Picker,
	PickerEmpty,
	PickerOption,
} from '@/components/ui/picker';
import { FieldError } from '@/components/form/field-error';
import type { Category } from '@/types/category.types';

// Vietnamese category names are matched with diacritics stripped, so "sach"
// finds "Sách" — same convention as the header's province search.
const norm = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/đ/gi, 'd')
		.toLowerCase();

type CategoryPickerProps = {
	// Externally set the selected leaf category (e.g. from an AI suggestion) —
	// resolved against the already-fetched tree to find its parent. Not a
	// fully controlled value: only re-syncs when this changes, the seller's
	// own manual pick afterward isn't overridden until it changes again.
	value?: number | null;
	onChange?: (value: {
		categoryId: number | null;
		categoryName: string;
	}) => void;
	error?: string;
	disabled?: boolean;
};

export function CategoryPicker({
	value,
	onChange,
	error,
	disabled,
}: CategoryPickerProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [categoryId, setCategoryId] = useState<number | null>(null);

	useEffect(() => {
		getCategories().then(setCategories);
	}, []);

	const parents = useMemo(
		() => categories.filter((c) => c.parentId === null && c.children?.length),
		[categories],
	);

	const selected = useMemo(() => {
		for (const parent of parents) {
			const child = parent.children?.find((c) => c.id === categoryId);
			if (child) return { parent, child };
		}
		return null;
	}, [parents, categoryId]);

	// Sync from an externally-set leaf id (AI suggestion) once the tree is
	// loaded — mirrors the pick flow so onChange still fires for the caller.
	useEffect(() => {
		if (value == null || value === categoryId || categories.length === 0) {
			return;
		}
		for (const parent of parents) {
			const child = parent.children?.find((c) => c.id === value);
			if (!child) continue;
			// queueMicrotask avoids react-hooks/set-state-in-effect
			queueMicrotask(() => {
				setCategoryId(child.id);
				onChange?.({ categoryId: child.id, categoryName: child.name });
			});
			break;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, categories]);

	const pick = (id: number, name: string) => {
		setCategoryId(id);
		onChange?.({ categoryId: id, categoryName: name });
		setOpen(false);
	};

	const matchesQuery = norm(query.trim());
	const filteredParents = parents
		.map((parent) => ({
			parent,
			children: (parent.children ?? []).filter(
				(child) =>
					!matchesQuery ||
					norm(child.name).includes(matchesQuery) ||
					norm(parent.name).includes(matchesQuery),
			),
		}))
		.filter(({ children }) => children.length > 0);

	const label = selected
		? `${selected.parent.name} › ${selected.child.name}`
		: categories.length === 0
			? 'Đang tải...'
			: 'Chọn danh mục';

	return (
		<div>
			<Picker
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) setQuery('');
				}}
				trigger={
					<button
						type="button"
						disabled={disabled || categories.length === 0}
						aria-label={`Danh mục: ${label}. Đổi danh mục`}
						className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-input bg-transparent px-2.5 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid]:border-fz-danger"
						aria-invalid={!!error}
					>
						<span className="flex min-w-0 items-center gap-2.5">
							<Tags className="size-4 shrink-0 text-muted-foreground" />
							<span
								className={
									selected
										? 'truncate text-[15px] font-medium text-fz-ink'
										: 'truncate text-[15px] text-muted-foreground'
								}
							>
								{label}
							</span>
						</span>
						<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
					</button>
				}
				title="Chọn danh mục"
				search={{
					value: query,
					onChange: setQuery,
					placeholder: 'Tìm danh mục…',
					label: 'Tìm danh mục',
				}}
			>
				{filteredParents.length === 0 ? (
					<PickerEmpty>Không tìm thấy danh mục nào.</PickerEmpty>
				) : (
					filteredParents.map(({ parent, children }) => (
						<div key={parent.id}>
							<div className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
								{parent.name}
							</div>
							{children.map((child) => (
								<PickerOption
									key={child.id}
									label={child.name}
									selected={child.id === categoryId}
									onSelect={() => pick(child.id, child.name)}
								/>
							))}
						</div>
					))
				)}
			</Picker>
			<FieldError message={error} />
		</div>
	);
}
