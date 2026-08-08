const BLOCK = 'animate-pulse rounded-full bg-muted motion-reduce:animate-none';

export function MembershipSkeleton() {
	return (
		<div aria-busy="true" role="status">
			<span className="sr-only">Đang tải gói thành viên…</span>

			<div className={`h-3 w-32 ${BLOCK}`} />
			<div className={`mt-3 h-9 w-48 ${BLOCK}`} />

			<div className="fz-card mt-8 rounded-2xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6">
				<div className={`h-4 w-40 ${BLOCK}`} />
				<div className={`mt-3 h-6 w-56 ${BLOCK}`} />
			</div>

			<div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3">
				{Array.from({ length: 3 }, (_, i) => (
					<div
						key={i}
						className="fz-card flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:rounded-3xl"
					>
						<div className={`h-4 w-20 ${BLOCK}`} />
						<div className={`h-8 w-24 ${BLOCK}`} />
						<div className={`h-3 w-full ${BLOCK}`} />
						<div className={`h-3 w-4/5 ${BLOCK}`} />
						<div className={`h-3 w-3/5 ${BLOCK}`} />
						<div className={`mt-2 h-11 w-full rounded-full ${BLOCK}`} />
					</div>
				))}
			</div>
		</div>
	);
}
