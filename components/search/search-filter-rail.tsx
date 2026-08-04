'use client';

import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { LocationPicker as ListingLocationPicker } from '@/components/location/location-picker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRODUCT_CONDITION_LABELS, type ProductCondition } from '@/types/product.types';
import type { Category } from '@/types/category.types';
import type { User } from '@/types/user.types';
import type { ProvinceWithWards } from '@/lib/locations';
import type { SearchFilters } from './search-types';

const CONDITIONS = Object.keys(PRODUCT_CONDITION_LABELS) as ProductCondition[];

export function SearchFilterRail({
	filters,
	categories,
	provinces,
	university,
	onChange,
	onReset,
}: {
	filters: SearchFilters;
	categories: Category[];
	provinces: ProvinceWithWards[];
	university: User['university'];
	onChange: (filters: SearchFilters) => void;
	onReset: () => void;
}) {
	return (
		<aside className="hidden lg:block">
			<div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto pr-3 scrollbar-refined">
				<div className="flex items-center justify-between border-b border-border pb-4">
					<h2 className="font-heading text-base font-semibold tracking-tight text-fz-ink">
						Lọc tin đăng
					</h2>
					<Button type="button" variant="ghost" size="sm" onClick={onReset}>
						<RotateCcw aria-hidden className="size-3.5" />
						Đặt lại
					</Button>
				</div>
				<SearchFilterControls
					filters={filters}
					categories={categories}
					provinces={provinces}
					university={university}
					onChange={onChange}
				/>
			</div>
		</aside>
	);
}

export function SearchFilterControls({
	filters,
	categories,
	provinces,
	university,
	onChange,
	pickerPresentation,
}: {
	filters: SearchFilters;
	categories: Category[];
	provinces: ProvinceWithWards[];
	university: User['university'];
	onChange: (filters: SearchFilters) => void;
	pickerPresentation?: 'auto' | 'popover';
}) {
	const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
	const update = (next: Partial<SearchFilters>) =>
		onChange({ ...filters, ...next, page: 1 });
	return (
		<div className="divide-y divide-border">
			{university && (
				<section className="py-5" aria-labelledby="search-filter-campus">
					<h3 id="search-filter-campus" className="text-sm font-semibold text-fz-ink">
						Quanh trường bạn
					</h3>
					<p className="mt-1 text-xs text-muted-foreground">{university.name}</p>
					<div className="mt-2">
						<FilterChoice
							label="Chỉ xem tin cùng trường"
							active={filters.sellerUniversityId === university.id}
							onClick={() =>
								update({
									sellerUniversityId:
										filters.sellerUniversityId === university.id ? null : university.id,
								})
							}
						/>
					</div>
				</section>
			)}
			<section className="py-5" aria-labelledby="search-filter-category">
				<h3
					id="search-filter-category"
					className="text-sm font-semibold text-fz-ink"
				>
					Danh mục
				</h3>
				<div className="mt-3 space-y-1">
					<FilterChoice
						label="Tất cả danh mục"
						active={filters.categoryId === null}
						onClick={() => update({ categoryId: null })}
					/>
					{categories.map((category) => {
						const childSelected = category.children?.some(
							(child) => child.id === filters.categoryId,
						);
						const isExpanded = expanded.has(category.id) || childSelected;
						return (
							<div key={category.id}>
								<div className="flex items-center gap-1">
									<FilterChoice
										label={category.name}
										active={filters.categoryId === category.id}
										onClick={() => update({ categoryId: category.id })}
										className="min-w-0 flex-1"
									/>
									{(category.children?.length ?? 0) > 0 && (
										<button
											type="button"
											onClick={() =>
												setExpanded((current) => {
													const next = new Set(current);
													if (next.has(category.id)) next.delete(category.id);
													else next.add(category.id);
													return next;
												})
											}
											aria-label={`Mở nhóm ${category.name}`}
											aria-expanded={isExpanded}
											className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-fz-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
										>
											<ChevronDown
												aria-hidden
												className={cn('size-4 transition-transform duration-200 motion-reduce:transition-none', isExpanded && 'rotate-180')}
											/>
										</button>
									)}
								</div>
								{isExpanded && category.children && (
									<div className="ml-3 border-l border-border pl-2">
										{category.children.map((child) => (
											<FilterChoice
												key={child.id}
												label={child.name}
												active={filters.categoryId === child.id}
												onClick={() => update({ categoryId: child.id })}
												className="pl-3 text-muted-foreground"
											/>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</section>

			<section className="py-5" aria-labelledby="search-filter-location">
				<h3 id="search-filter-location" className="text-sm font-semibold text-fz-ink">
					Khu vực
				</h3>
				<div className="mt-3 space-y-2.5">
					<ListingLocationPicker
						key={`${filters.provinceCode ?? ''}-${filters.wardCode ?? ''}`}
						provinces={provinces}
						value={{
							provinceCode: filters.provinceCode,
							wardCode: filters.wardCode,
						}}
						notifyOnInitialValue={false}
						pickerPresentation={pickerPresentation}
						onChange={({ provinceCode, wardCode }) =>
							update({ provinceCode, wardCode })
						}
					/>
				</div>
			</section>

			<section className="py-5" aria-labelledby="search-filter-condition">
				<h3 id="search-filter-condition" className="text-sm font-semibold text-fz-ink">
					Tình trạng
				</h3>
				<div className="mt-3 space-y-1">
					<FilterChoice
						label="Tất cả tình trạng"
						active={filters.condition === null}
						onClick={() => update({ condition: null })}
					/>
					{CONDITIONS.map((condition) => (
						<FilterChoice
							key={condition}
							label={PRODUCT_CONDITION_LABELS[condition]}
							active={filters.condition === condition}
							onClick={() => update({ condition })}
						/>
					))}
				</div>
			</section>

			<section className="py-5" aria-labelledby="search-filter-price">
				<h3 id="search-filter-price" className="text-sm font-semibold text-fz-ink">
					Khoảng giá
				</h3>
				<PriceBands
					key={`${filters.minPrice ?? ''}-${filters.maxPrice ?? ''}`}
					minPrice={filters.minPrice}
					maxPrice={filters.maxPrice}
					onChange={(minPrice, maxPrice) => update({ minPrice, maxPrice })}
				/>
			</section>
		</div>
	);
}

function FilterChoice({
	label,
	active,
	onClick,
	className,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				'flex min-h-9 w-full items-center rounded-lg px-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
				active ? 'font-semibold text-fz-ink' : 'text-fz-ink/75',
				className,
			)}
		>
			<span className="truncate">{label}</span>
		</button>
	);
}

const PRICE_BANDS = [
	{ label: 'Tất cả mức giá', min: null, max: null },
	{ label: 'Dưới 500k', min: null, max: 500_000 },
	{ label: '500k – 2 triệu', min: 500_000, max: 2_000_000 },
	{ label: '2 – 5 triệu', min: 2_000_000, max: 5_000_000 },
	{ label: '5 – 10 triệu', min: 5_000_000, max: 10_000_000 },
	{ label: 'Trên 10 triệu', min: 10_000_000, max: null },
] as const;

function PriceBands({
	minPrice,
	maxPrice,
	onChange,
}: {
	minPrice: number | null;
	maxPrice: number | null;
	onChange: (minPrice: number | null, maxPrice: number | null) => void;
}) {
	const matchedBand = PRICE_BANDS.find(
		(band) => band.min === minPrice && band.max === maxPrice,
	);
	const [customOpen, setCustomOpen] = useState(!matchedBand);
	const commitCustom = (min: string, max: string) => {
		const nextMin = Number(min);
		const nextMax = Number(max);
		onChange(
			min === '' || !Number.isFinite(nextMin) || nextMin < 0 ? null : nextMin,
			max === '' || !Number.isFinite(nextMax) || nextMax < 0 ? null : nextMax,
		);
	};

	return (
		<div className="mt-3 space-y-1">
			{PRICE_BANDS.map((band) => (
				<FilterChoice
					key={band.label}
					label={band.label}
					active={matchedBand?.label === band.label && !customOpen}
					onClick={() => {
						setCustomOpen(false);
						onChange(band.min, band.max);
					}}
				/>
			))}
			<button
				type="button"
				onClick={() => setCustomOpen((open) => !open)}
				aria-expanded={customOpen}
				className={cn(
					'flex min-h-9 w-full items-center rounded-lg px-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
					customOpen ? 'font-semibold text-fz-ink' : 'text-fz-ink/75',
				)}
			>
				Tự chọn khoảng giá
			</button>
			{customOpen && (
				<div className="grid grid-cols-2 gap-2 border-l border-border py-2 pl-3">
					<label>
						<span className="mb-1 block text-xs text-muted-foreground">Từ</span>
						<input
							type="number"
							min="0"
							inputMode="numeric"
							defaultValue={minPrice ?? ''}
							placeholder="0"
							onBlur={(event) =>
								commitCustom(event.currentTarget.value, String(maxPrice ?? ''))
							}
							className="h-10 w-full rounded-lg border border-border bg-card px-2.5 text-base tabular-nums text-fz-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
						/>
					</label>
					<label>
						<span className="mb-1 block text-xs text-muted-foreground">Đến</span>
						<input
							type="number"
							min="0"
							inputMode="numeric"
							defaultValue={maxPrice ?? ''}
							placeholder="Không giới hạn"
							onBlur={(event) =>
								commitCustom(String(minPrice ?? ''), event.currentTarget.value)
							}
							className="h-10 w-full rounded-lg border border-border bg-card px-2.5 text-base tabular-nums text-fz-ink outline-none placeholder:text-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
						/>
					</label>
				</div>
			)}
		</div>
	);
}
