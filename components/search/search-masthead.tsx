import type { ReactNode } from 'react';
import type { SearchFilters } from './search-types';

export function SearchMasthead({
	filters,
	contextLabel,
	toolbar,
}: {
	filters: SearchFilters;
	contextLabel?: string;
	toolbar?: ReactNode;
}) {
	const heading = filters.q
		? `Kết quả cho “${filters.q}”`
		: contextLabel
			? `Tin trong ${contextLabel}`
			: 'Tất cả tin đăng';

	return (
		<header className="border-b border-border pb-5 sm:pb-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
				<h1 className="font-heading text-3xl leading-none font-bold tracking-[-0.045em] text-fz-ink sm:text-4xl">
					{heading}
				</h1>
				{toolbar}
			</div>
		</header>
	);
}
