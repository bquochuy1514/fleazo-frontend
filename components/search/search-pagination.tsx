'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function visiblePages(current: number, total: number): (number | 'ellipsis')[] {
	if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
	const middle = [current - 1, current, current + 1].filter(
		(page) => page > 1 && page < total,
	);
	return [1, ...(middle[0] > 2 ? ['ellipsis' as const] : []), ...middle, ...(middle.at(-1)! < total - 1 ? ['ellipsis' as const] : []), total];
}

export function SearchPagination({
	page,
	totalPages,
	onChange,
}: {
	page: number;
	totalPages: number;
	onChange: (page: number) => void;
}) {
	if (totalPages <= 1) return null;

	return (
		<nav aria-label="Phân trang" className="mt-10 border-t border-border pt-6 sm:mt-12">
			<div className="flex items-center justify-between gap-3 md:hidden">
				<Button
					type="button"
					variant="outline"
					size="lg"
					disabled={page === 1}
					onClick={() => onChange(page - 1)}
				>
					<ChevronLeft aria-hidden className="size-4" />
					Trang trước
				</Button>
				<p className="text-sm tabular-nums text-muted-foreground">
					{page}/{totalPages}
				</p>
				<Button
					type="button"
					variant="outline"
					size="lg"
					disabled={page === totalPages}
					onClick={() => onChange(page + 1)}
				>
					Trang tiếp
					<ChevronRight aria-hidden className="size-4" />
				</Button>
			</div>

			<div className="hidden items-center justify-center gap-1 md:flex">
				<Button
					type="button"
					variant="ghost"
					size="icon-lg"
					disabled={page === 1}
					onClick={() => onChange(page - 1)}
					aria-label="Trang trước"
				>
					<ChevronLeft aria-hidden className="size-4" />
				</Button>
				{visiblePages(page, totalPages).map((item, index) =>
					item === 'ellipsis' ? (
						<span key={`ellipsis-${index}`} className="flex size-9 items-center justify-center text-muted-foreground">
							<MoreHorizontal aria-hidden className="size-4" />
						</span>
					) : (
						<Button
							key={item}
							type="button"
							variant={item === page ? 'default' : 'ghost'}
							size="icon-lg"
							onClick={() => onChange(item)}
							aria-current={item === page ? 'page' : undefined}
							className={cn(item !== page && 'text-muted-foreground')}
						>
							{item}
						</Button>
					),
				)}
				<Button
					type="button"
					variant="ghost"
					size="icon-lg"
					disabled={page === totalPages}
					onClick={() => onChange(page + 1)}
					aria-label="Trang tiếp"
				>
					<ChevronRight aria-hidden className="size-4" />
				</Button>
			</div>
		</nav>
	);
}
