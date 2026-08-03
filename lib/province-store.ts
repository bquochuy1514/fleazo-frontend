// The header's chosen province, kept in localStorage.
// Read via useSyncExternalStore instead of an effect+state copy, to get
// the honest SSR snapshot and skip the extra render.
// localStorage not a cookie: a server-read cookie would opt every `(main)`
// page out of static rendering for one chip. Label starts at "Toàn quốc"
// and settles post-hydration.
const KEY = 'fz:province';

// Absent key = "never touched" (fall back to user's own province).
// ALL_VALUE = visitor explicitly picked "Toàn quốc", must stick regardless.
const ALL_VALUE = 'all';

const listeners = new Set<() => void>();

export function subscribeToProvince(onChange: () => void) {
	listeners.add(onChange);
	// `storage` fires in other tabs; same-tab changes go through setSavedProvince.
	window.addEventListener('storage', onChange);
	return () => {
		listeners.delete(onChange);
		window.removeEventListener('storage', onChange);
	};
}

// Raw string (not a parsed object) so snapshots are comparable by value.
export function getProvinceSnapshot(): string | null {
	return window.localStorage.getItem(KEY);
}

export function getProvinceServerSnapshot(): string | null {
	return null;
}

export function setSavedProvince(code: number | null) {
	window.localStorage.setItem(KEY, code === null ? ALL_VALUE : String(code));
	listeners.forEach((notify) => notify());
}

// Turns a raw snapshot into the province to filter by; keeps ALL_VALUE
// encoding private to this module.
export function resolveProvinceCode(
	raw: string | null,
	userProvinceCode: number | null | undefined,
): number | null {
	if (raw === null) return userProvinceCode ?? null;
	if (raw === ALL_VALUE) return null;
	return Number(raw);
}
