'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// `.fz-rise` (styles/globals.css) only fires once, at mount — perfect for the
// hero (above the fold, visible from first paint) but invisible for anything
// below a full-viewport hero: the ~0.6s animation is long over by the time a
// visitor actually scrolls down to it. This re-triggers it once the wrapped
// element enters the viewport instead, via a plain IntersectionObserver —
// disconnects after the first reveal, never re-plays on scroll back up.
export function ScrollReveal({
	children,
	delay = 0,
	className,
}: {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn('h-full', visible ? 'fz-rise' : 'opacity-0', className)}
			style={visible ? { animationDelay: `${delay}ms` } : undefined}
		>
			{children}
		</div>
	);
}
