// motion-reduce:animate-none on every pulsing block is load-bearing: the
// prefers-reduced-motion rule in globals.css only covers .fz-rise/.fz-drift/
// .fz-pulse, not Tailwind's animate-pulse.
const BLOCK = 'animate-pulse rounded-full bg-muted motion-reduce:animate-none';

export function ListingRowSkeleton() {
	return (
		<li
			aria-hidden
			className="flex gap-3 rounded-2xl border border-border bg-card p-3 sm:gap-4 sm:rounded-3xl sm:p-4"
		>
			<div className="size-20 shrink-0 animate-pulse rounded-xl bg-muted motion-reduce:animate-none sm:size-28 sm:rounded-2xl" />
			<div className="min-w-0 flex-1 space-y-2 py-1">
				<div className={`h-4 w-24 ${BLOCK}`} />
				<div className={`h-4 w-4/5 ${BLOCK}`} />
				<div className={`h-4 w-1/3 ${BLOCK}`} />
				<div className={`h-3 w-1/2 ${BLOCK}`} />
			</div>
		</li>
	);
}

export function ListingListSkeleton({ rows = 4 }: { rows?: number }) {
	return (
		<ul
			role="status"
			aria-busy="true"
			className="mt-6 flex flex-col gap-3 sm:mt-8 sm:gap-4"
		>
			<span className="sr-only">Đang tải tin đăng…</span>
			{Array.from({ length: rows }, (_, i) => (
				<ListingRowSkeleton key={i} />
			))}
		</ul>
	);
}
