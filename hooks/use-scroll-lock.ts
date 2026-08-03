'use client';

import { useEffect } from 'react';

// Locks body scroll and restores position on release. Uses fixed positioning
// with a negative top offset, not `overflow: hidden`, because iOS Safari
// still allows touch scroll with overflow hidden and drifts the page on
// focus inside fixed overlays.
// Only needed for hand-rolled overlays — Radix Dialog-based ones (Sheet,
// Picker) already lock scroll themselves.
export function useScrollLock(locked: boolean) {
	useEffect(() => {
		if (!locked) return;

		const { body } = document;
		const y = window.scrollY;
		const restore = {
			position: body.style.position,
			top: body.style.top,
			left: body.style.left,
			right: body.style.right,
			width: body.style.width,
		};

		body.style.position = 'fixed';
		body.style.top = `-${y}px`;
		body.style.left = '0';
		body.style.right = '0';
		// The body is a flex column with min-h-full; pinning it would otherwise
		// let it collapse to its content's width.
		body.style.width = '100%';

		return () => {
			Object.assign(body.style, restore);
			// Instant — this is undoing a jump, not performing one.
			window.scrollTo({ top: y, behavior: 'instant' });
		};
	}, [locked]);
}
