'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/format';
import type { Category } from '@/types/category.types';
import type { ProvinceWithWards } from '@/lib/locations';
import { filterCount, type SearchFilters } from './search-types';

function activeLabel(
	filters: SearchFilters,
	categories: Category[],
	provinces: ProvinceWithWards[],
) {
	if (filters.sellerUniversityId !== null) return 'Cùng trường';
	if (filters.categoryId !== null) {
		const root = categories.find((category) => category.id === filters.categoryId);
		const child = categories
			.flatMap((category) => category.children ?? [])
			.find((category) => category.id === filters.categoryId);
		return (root ?? child)?.name;
	}
	if (filters.provinceCode !== null) {
		return provinces.find((province) => province.code === filters.provinceCode)?.name;
	}
	if (filters.condition) return 'Đã lọc theo tình trạng';
	if (filters.minPrice !== null || filters.maxPrice !== null) return 'Đã lọc theo giá';
	return null;
}

export function SearchToolbar({
	total,
	filters,
	categories,
	provinces,
	onOpenFilters,
	onClear,
}: {
	total: number;
	filters: SearchFilters;
	categories: Category[];
	provinces: ProvinceWithWards[];
	onOpenFilters: () => void;
	onClear: () => void;
}) {
	const count = filterCount(filters);
	const label = activeLabel(filters, categories, provinces);

	return (
		<div className="flex items-center justify-between gap-4 sm:min-w-[16rem] sm:justify-end">
			<div className="min-w-0">
				<p className="font-heading text-base font-semibold tracking-tight text-fz-ink sm:text-right">
					{formatCount(total)} tin
				</p>
				{label && (
					<p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-right">{label}</p>
				)}
			</div>

			<div className="flex shrink-0 items-center gap-1.5">
				{count > 0 && (
					<Button type="button" variant="ghost" size="sm" onClick={onClear}>
						<X aria-hidden className="size-3.5" />
						Xóa lọc
					</Button>
				)}
				<Button
					type="button"
					variant="outline"
					size="lg"
					onClick={onOpenFilters}
					className="h-10 px-4 lg:hidden"
				>
					<SlidersHorizontal aria-hidden className="size-4" />
					Bộ lọc{count > 0 ? ` · ${count}` : ''}
				</Button>
			</div>
		</div>
	);
}
