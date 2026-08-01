'use client';

import { useEffect } from 'react';

// Freezes the page behind a full-screen overlay and — the part `overflow:
// hidden` alone does not do — puts the reader back exactly where they were on
// release.
//
// Two iOS Safari behaviours make the naive version fail, neither reproducible
// in a desktop browser's device emulator:
//
//  1. `overflow: hidden` on <body> does not stop touch scrolling.
//  2. Focusing a field scrolls the DOCUMENT to reveal it, even when the field
//     sits inside a `position: fixed` overlay. A fixed element has no document
//     position to scroll to, so Safari settles near the top — open an overlay,
//     close it, and the page has moved. Repeat and it walks to the top.
//
// Pinning the body at a negative offset removes the scroll there was to make.
//
// Only needed for hand-rolled overlays: anything built on Radix's Dialog (our
// Sheet, and Picker through it) already brings its own lock.
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
