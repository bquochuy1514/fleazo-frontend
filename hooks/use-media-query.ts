'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Use only when both branches can't coexist in the DOM (e.g. duplicate a11y
// content). Prefer CSS-based responsive hiding otherwise.
// SSR/hydration always return false; treat false as "not known yet", and
// make sure the false branch is the one safe to server-render.
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
