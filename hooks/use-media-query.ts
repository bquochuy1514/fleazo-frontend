'use client';

import { useCallback, useSyncExternalStore } from 'react';

// A CSS media query read from JS, for the cases where the two branches can't
// both be in the DOM — a Popover and a Dialog rendering the same list would
// duplicate its content for screen readers, so one of them has to not exist.
// Prefer plain responsive classes over this hook whenever hiding one branch
// with CSS is actually acceptable.
//
// Server and hydration both answer `false`; the real value lands on the first
// commit after. That's what keeps it hydration-safe, and it means **the
// `false` branch must be the one that survives being server-rendered** — treat
// `false` as "not known yet", not as "definitely no match".
export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			const mql = window.matchMedia(query);
			mql.addEventListener('change', onStoreChange);
			return () => mql.removeEventListener('change', onStoreChange);
		},
		[query],
	);

	const getSnapshot = useCallback(
		() => window.matchMedia(query).matches,
		[query],
	);

	return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
