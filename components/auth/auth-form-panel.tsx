'use client';

import { createContext, useCallback, useContext, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const ScrollTopContext = createContext<(() => void) | null>(null);

// Lets an (auth) page force its scroll region back to top. No-op outside the
// provider so an unwired page doesn't crash.
export function useAuthFormScrollTop() {
	return useContext(ScrollTopContext) ?? (() => {});
}

// The one scroll region on an (auth) page; rest is pinned by (auth)/layout.tsx.
// Split into its own client component so the ref/scroll-to-top logic doesn't
// force the whole (Server) layout to become client too.
export function AuthFormPanel({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const pathname = usePathname();

	// useCallback for a stable identity — consumers put this in an effect dep array.
	const scrollToTop = useCallback(() => {
		const reduceMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;
		ref.current?.scrollTo({
			top: 0,
			behavior: reduceMotion ? 'instant' : 'smooth',
		});
	}, []);

	return (
		<ScrollTopContext.Provider value={scrollToTop}>
			<div
				ref={ref}
				className={cn(
					'scrollbar-refined flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-10 sm:px-6 md:py-12',
					className,
				)}
			>
				{/* my-auto, not justify-center: justify-content can push overflow
				    into unreachable negative scroll, clipping the top when
				    content grows taller than the viewport. Auto margins collapse
				    to 0 on overflow instead, keeping true top reachable. */}
				{/* fz-rise once on entrance, applied to the whole wrapper (not
				    per-field) — a login form isn't a story to reveal line by line.
				    key={pathname} forces remount on route switch so the CSS
				    entrance animation replays (client nav would otherwise patch
				    children in place and skip it). */}
				<div
					key={pathname}
					className="fz-rise my-auto flex w-full flex-col items-center"
				>
					{/* Stands in for AuthVisual's logo, which doesn't render on
					    mobile. md:hidden once the photo panel takes over. */}
					<div className="mb-6 shrink-0 md:hidden">
						<Logo size="lg" />
					</div>

					<div className="w-full max-w-sm">{children}</div>
				</div>
			</div>
		</ScrollTopContext.Provider>
	);
}
