export type Province = {
	code: number;
	name: string;
};

// The Fleazo backend has no location module — listings only carry
// `provinceCode`/`wardCode` (see types/product.types.ts), and there is no
// endpoint that lists provinces. So the list comes from the same public
// dataset `fleazo-frontend` (v1) used in its LocationPicker.
//
// Two differences from v1, both because the header renders this on EVERY page
// rather than only inside the post-a-listing form:
//   - fetched server-side and cached for a day, so it costs one outbound call
//     per revalidation window instead of one per page view
//   - depth=1 (provinces only, no wards). The header chip's job is "narrow to
//     my city"; ward-level filtering belongs in the page's own filter panel,
//     where there's room for a second step.
//
// Falls back to [] rather than throwing — a third-party list being down must
// not take the header, and therefore every page, down with it.
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
