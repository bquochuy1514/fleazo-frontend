// The header's chosen province, kept in localStorage.
//
// Read through useSyncExternalStore rather than an effect that copies it into
// state: localStorage is exactly the "external store" that hook exists for, the
// server snapshot gives the honest SSR answer (nothing chosen yet), and it
// avoids the extra render an effect-then-setState pass would cost on every
// page load.
//
// localStorage, not a cookie, on purpose: reading a cookie server-side would
// opt every page in `(main)` out of static rendering for the sake of one chip.
// The cost is that the label starts at "Toàn quốc" and settles on the saved
// province right after hydration. Revisit if the choice ever has to affect
// server-rendered content.
const KEY = 'fz:province';

const listeners = new Set<() => void>();

export function subscribeToProvince(onChange: () => void) {
	listeners.add(onChange);
	// `storage` fires in OTHER tabs, so a change made in one keeps the rest in
	// sync; same-tab changes are announced by setSavedProvince below.
	window.addEventListener('storage', onChange);
	return () => {
		listeners.delete(onChange);
		window.removeEventListener('storage', onChange);
	};
}

// Snapshots must be comparable by value — hence the raw string, parsed by the
// caller, rather than an object rebuilt on every read.
export function getProvinceSnapshot(): string | null {
	return window.localStorage.getItem(KEY);
}

export function getProvinceServerSnapshot(): string | null {
	return null;
}

export function setSavedProvince(code: number | null) {
	if (code === null) window.localStorage.removeItem(KEY);
	else window.localStorage.setItem(KEY, String(code));
	listeners.forEach((notify) => notify());
}
