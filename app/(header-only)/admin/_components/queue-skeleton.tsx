const BLOCK = 'animate-pulse rounded-full bg-muted motion-reduce:animate-none';

function QueueRowSkeleton() {
	return (
		<li
			aria-hidden
			className="flex gap-4 rounded-2xl border border-border bg-card p-4 sm:rounded-3xl sm:p-5"
		>
			<div className="size-24 shrink-0 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
			<div className="min-w-0 flex-1 space-y-2 py-1">
				<div className={`h-4 w-4/5 ${BLOCK}`} />
				<div className={`h-3 w-1/2 ${BLOCK}`} />
				<div className={`h-3 w-full ${BLOCK}`} />
				<div className={`h-3 w-2/3 ${BLOCK}`} />
			</div>
		</li>
	);
}

export function QueueSkeleton({ rows = 3 }: { rows?: number }) {
	return (
		<ul
			role="status"
			aria-busy="true"
			className="flex flex-col gap-3 sm:gap-4"
		>
			<span className="sr-only">Đang tải hàng chờ duyệt…</span>
			{Array.from({ length: rows }, (_, i) => (
				<QueueRowSkeleton key={i} />
			))}
		</ul>
	);
}
