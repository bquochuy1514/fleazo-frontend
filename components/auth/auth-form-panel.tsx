'use client';

import { createContext, useCallback, useContext, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const ScrollTopContext = createContext<(() => void) | null>(null);

// Any (auth) page can pull this to force its own scroll region back to the
// top — see the call site in dang-nhap/page.tsx for why that's needed.
// Returns a no-op outside the provider rather than throwing: a page that
// hasn't wired up the effect yet shouldn't crash for it.
export function useAuthFormScrollTop() {
	return useContext(ScrollTopContext) ?? (() => {});
}

// The one scroll region on an (auth) page — everything outside it (the
// AuthVisual photo panel, the floating card's own frame) is pinned by
// (auth)/layout.tsx's `h-svh` shell and never moves. Split out of that
// layout, which is a Server Component, because owning the ref + the
// scroll-to-top function both require a client boundary; keeping it this
// small means the rest of the layout doesn't have to become one too.
export function AuthFormPanel({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const pathname = usePathname();

	// Stable identity via useCallback — a page consuming this through
	// `useAuthFormScrollTop` puts it in a `useEffect` dependency array, and a
	// function that's a new reference every render would fire that effect on
	// every render too, not just when its actual trigger changes.
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
				{/* my-auto, not justify-center on the scroll container above —
				    justify-content centers by pushing HALF of any overflow
				    into negative scroll territory, which a scrollable element
				    can never reach: once an error banner pushes this taller
				    than the viewport, scrollTo({top:0}) lands partway through
				    the h1 instead of above it, with no way to scroll further
				    up to see the rest (reported: heading permanently clipped
				    after a failed submit). Auto margins center the same way
				    when there's slack but collapse to 0 the instant content
				    overflows, so the true top always stays reachable. */}
				{/* fz-rise once on entrance, same primitive the homepage hero
				    uses — reused rather than a second bespoke animation, so
				    the whole site shares one motion language. Applied to
				    this one wrapper (logo + content together) as a single
				    unit, not per-field like the hero's stagger: a login
				    form is a task, not a story to reveal line by line —
				    staggering every label/input would read as the generic
				    "AOS fade-up on everything" pattern this is deliberately
				    avoiding, not as polish.
				    key={pathname}: without it, switching between /dang-nhap
				    and /dang-ky is a CLIENT navigation within this same
				    layout — React patches this div's children in place
				    rather than recreating it, so the CSS animation (which
				    only plays on the element's own mount) fires once for
				    whichever auth page loads first in the session and never
				    again for the other. Keying by route forces a fresh node
				    — and therefore a fresh entrance — on every switch. */}
				<div
					key={pathname}
					className="fz-rise my-auto flex w-full flex-col items-center"
				>
					{/* Stands in for AuthVisual's photo-panel logo, which no
					    longer renders on mobile (see that file's comment) —
					    without this, a mobile visitor would see no Fleazo
					    mark anywhere on the screen. md:hidden because the
					    photo panel's own logo takes over from `md` up. */}
					<div className="mb-6 shrink-0 md:hidden">
						<Logo size="lg" />
					</div>

					<div className="w-full max-w-sm">{children}</div>
				</div>
			</div>
		</ScrollTopContext.Provider>
	);
}
