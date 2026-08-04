'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import type { Category } from '@/types/category.types';
import type { ProvinceWithWards } from '@/lib/locations';
import type { User } from '@/types/user.types';
import { DEFAULT_SEARCH_FILTERS, type SearchFilters } from './search-types';
import { SearchFilterControls } from './search-filter-rail';

export function SearchFilterSheet({
	open,
	onOpenChange,
	filters,
	categories,
	provinces,
	university,
	onApply,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: SearchFilters;
	categories: Category[];
	provinces: ProvinceWithWards[];
	university: User['university'];
	onApply: (filters: SearchFilters) => void;
}) {
	const [draft, setDraft] = useState(filters);

	return (
		<Sheet
			open={open}
			onOpenChange={(next) => {
				if (next) setDraft(filters);
				onOpenChange(next);
			}}
		>
			<SheetContent
				side="bottom"
				className="max-h-[90svh] gap-0 rounded-t-3xl p-0 lg:hidden"
			>
				<SheetHeader className="shrink-0 border-b border-border px-5 pt-5 pb-4">
					<SheetTitle className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight text-fz-ink">
						<SlidersHorizontal aria-hidden className="size-4" />
						Bộ lọc
					</SheetTitle>
				</SheetHeader>
				<div className="overflow-y-auto px-5 scrollbar-refined">
					<SearchFilterControls
						key={JSON.stringify(draft)}
						filters={draft}
						categories={categories}
						provinces={provinces}
						university={university}
						onChange={setDraft}
					/>
				</div>
				<SheetFooter className="shrink-0 border-t border-border bg-card px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={() => setDraft({ ...DEFAULT_SEARCH_FILTERS, q: filters.q })}
							className="flex-1"
						>
							Đặt lại
						</Button>
						<Button
							type="button"
							size="lg"
							onClick={() => {
								onApply(draft);
								onOpenChange(false);
							}}
							className="flex-1"
						>
							Áp dụng
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
