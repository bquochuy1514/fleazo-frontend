import { SearchResultsSkeleton } from '@/components/search/search-results-grid';

export default function SearchLoading() {
	return (
		<section className="mx-auto min-h-[calc(100dvh+3rem)] max-w-6xl px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-20">
			<div className="border-b border-border pb-8 sm:pb-10">
				<div className="h-3 w-40 animate-pulse rounded bg-muted" />
				<div className="mt-4 h-14 max-w-xl animate-pulse rounded bg-muted sm:h-16" />
				<div className="mt-5 h-6 max-w-lg animate-pulse rounded bg-muted" />
				<div className="mt-6 h-14 max-w-2xl animate-pulse rounded-2xl bg-muted sm:rounded-full" />
			</div>
			<div className="mt-5 h-12 animate-pulse border-y border-border bg-muted/50" />
			<div className="mt-8">
				<SearchResultsSkeleton />
			</div>
		</section>
	);
}
