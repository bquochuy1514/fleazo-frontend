// Ambient background for --color-dark-surface panels: drifting blurred blobs
// + a repeating "tag treo" silhouette (see AGENTS.md → Design System →
// Signature element). Decorative only, motion disabled under
// prefers-reduced-motion (globals.css). Used by Header, Footer, the
// (auth) dark panel, the 404 page, and toast notifications (see
// src/lib/toast.tsx) — surfaces vary a lot in size, so blob size/offset
// is responsive: full desktop size assumes a full-height panel, mobile
// size is scaled down so blobs don't get clipped by a short container.
export function DarkSurfaceAmbient() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0"
		>
			<div
				className="fz-ambient-blob absolute -top-12 -left-8 size-40 rounded-full bg-fz-accent/20 blur-3xl md:-top-24 md:-left-16 md:size-72"
				style={{ animationName: 'fz-ambient-drift-1' }}
			/>
			<div
				className="fz-ambient-blob absolute -right-6 -bottom-14 size-36 rounded-full bg-fz-primary/15 blur-3xl md:-right-10 md:-bottom-28 md:size-64"
				style={{
					animationName: 'fz-ambient-drift-2',
					animationDelay: '-7s',
				}}
			/>
			<svg className="absolute inset-0 h-full w-full opacity-[0.07]">
				<defs>
					<pattern
						id="fz-tag-pattern"
						width="72"
						height="72"
						patternUnits="userSpaceOnUse"
						patternTransform="rotate(-12)"
					>
						<path
							d="M4 14 L20 14 L30 24 L20 34 L4 34 Z"
							fill="none"
							stroke="white"
							strokeWidth="1.5"
						/>
						<circle cx="9" cy="19" r="1.6" fill="white" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#fz-tag-pattern)" />
			</svg>
		</div>
	);
}
