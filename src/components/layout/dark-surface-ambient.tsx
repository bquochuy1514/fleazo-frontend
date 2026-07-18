// Ambient background for --color-dark-surface panels: drifting blurred blobs
// + a repeating "tag treo" silhouette (see AGENTS.md → Design System →
// Signature element). Decorative only, motion disabled under
// prefers-reduced-motion (globals.css). Shared by Header and Footer — both
// sit on the same dark surface, so they get the same ambient treatment.
export function DarkSurfaceAmbient() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0"
		>
			<div
				className="fz-ambient-blob absolute -top-24 -left-16 size-72 rounded-full bg-fz-accent/20 blur-3xl"
				style={{ animationName: 'fz-ambient-drift-1' }}
			/>
			<div
				className="fz-ambient-blob absolute -right-10 -bottom-28 size-64 rounded-full bg-fz-primary/15 blur-3xl"
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
