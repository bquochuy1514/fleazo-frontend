export type Province = {
	code: number;
	name: string;
};

// No backend location module — provinces come from a public dataset.
// Server-fetched and cached for a day since the header renders this on
// every page; depth=1 only (no wards, that's the filter panel's job).
// Falls back to [] so a third-party outage doesn't take the header down.
const SOURCE = 'https://provinces.open-api.vn/api/v2/?depth=1';
const ONE_DAY = 60 * 60 * 24;

export async function getProvinces(): Promise<Province[]> {
	try {
		const res = await fetch(SOURCE, { next: { revalidate: ONE_DAY } });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = (await res.json()) as { code: number; name: string }[];
		return data.map(({ code, name }) => ({ code, name }));
	} catch (err) {
		console.error('[getProvinces] failed:', err);
		return [];
	}
}

export type Ward = { code: number; name: string };
export type ProvinceWithWards = { code: number; name: string; wards: Ward[] };

// depth=2 (wards included) for the listing form's picker — heavier payload,
// kept as a separate fetch/cache entry from getProvinces above.
const DEPTH2_SOURCE = 'https://provinces.open-api.vn/api/v2/?depth=2';

export async function getProvincesWithWards(): Promise<ProvinceWithWards[]> {
	try {
		const res = await fetch(DEPTH2_SOURCE, { next: { revalidate: ONE_DAY } });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = (await res.json()) as {
			code: number;
			name: string;
			wards: { code: number; name: string }[];
		}[];
		return data.map(({ code, name, wards }) => ({
			code,
			name,
			wards: wards.map((w) => ({ code: w.code, name: w.name })),
		}));
	} catch (err) {
		console.error('[getProvincesWithWards] failed:', err);
		return [];
	}
}
