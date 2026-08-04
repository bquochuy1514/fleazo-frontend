'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/format';
import { PRODUCT_CONDITION_LABELS } from '@/types/product.types';
import type { Category } from '@/types/category.types';
import type { ProvinceWithWards } from '@/lib/locations';
import { filterCount, type SearchFilters } from './search-types';

type FilterPatch = Partial<SearchFilters>;

type ActiveFilter = {
	key: string;
	label: string;
	clear: FilterPatch;
};

function compactPrice(value: number): string {
	if (value < 1_000_000) return `${Math.round(value / 1_000)}k`;
	const millions = value / 1_000_000;
	return `${Number.isInteger(millions) ? millions : millions.toFixed(1).replace('.', ',')}tr`;
}

function activeFilters(
	filters: SearchFilters,
	categories: Category[],
	provinces: ProvinceWithWards[],
): ActiveFilter[] {
	const active: ActiveFilter[] = [];
	if (filters.sellerUniversityId !== null) {
		active.push({ key: 'university', label: 'Cùng trường', clear: { sellerUniversityId: null } });
	}
	if (filters.categoryId !== null) {
		const root = categories.find((category) => category.id === filters.categoryId);
		const child = categories
			.flatMap((category) => category.children ?? [])
			.find((category) => category.id === filters.categoryId);
		const category = root ?? child;
		active.push({
			key: 'category',
			label: category?.name ?? 'Danh mục đã chọn',
			clear: { categoryId: null },
		});
	}
	if (filters.provinceCode !== null) {
		const province = provinces.find((item) => item.code === filters.provinceCode);
		const ward = province?.wards.find((item) => item.code === filters.wardCode);
		active.push({
			key: 'location',
			label: ward?.name ?? province?.name ?? 'Khu vực đã chọn',
			clear: { provinceCode: null, wardCode: null },
		});
	}
	if (filters.condition) {
		active.push({
			key: 'condition',
			label: PRODUCT_CONDITION_LABELS[filters.condition],
			clear: { condition: null },
		});
	}
	if (filters.minPrice !== null || filters.maxPrice !== null) {
		const label =
			filters.minPrice !== null && filters.maxPrice !== null
				? `${compactPrice(filters.minPrice)} – ${compactPrice(filters.maxPrice)}`
				: filters.minPrice !== null
					? `Từ ${compactPrice(filters.minPrice)}`
					: `Đến ${compactPrice(filters.maxPrice ?? 0)}`;
		active.push({
			key: 'price',
			label,
			clear: { minPrice: null, maxPrice: null },
		});
	}
	return active;
}

export function SearchToolbar({
	total,
	filters,
	categories,
	provinces,
	onOpenFilters,
	onClear,
	onRemove,
}: {
	total: number;
	filters: SearchFilters;
	categories: Category[];
	provinces: ProvinceWithWards[];
	onOpenFilters: () => void;
	onClear: () => void;
	onRemove: (patch: FilterPatch) => void;
}) {
	const count = filterCount(filters);
	const active = activeFilters(filters, categories, provinces);

	return (
		<div className="space-y-2.5">
			<div className="flex items-center gap-2.5">
				<p className="font-heading text-base font-semibold tracking-tight text-fz-ink">
					{formatCount(total)} tin
				</p>

				<div className="ml-auto flex shrink-0 items-center gap-1.5">
					{count > 0 && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onClear}
							className="hidden lg:inline-flex"
						>
							<X aria-hidden className="size-3.5" />
							Xóa tất cả
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

			{active.length > 0 && (
				<div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
					<div className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
						{active.map((filter) => (
							<button
								key={filter.key}
								type="button"
								onClick={() => onRemove(filter.clear)}
								aria-label={`Bỏ lọc ${filter.label}`}
								className="inline-flex h-11 max-w-[15rem] items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-fz-ink transition-colors hover:border-fz-ink/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-xs"
							>
								<span className="truncate">{filter.label}</span>
								<X aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
