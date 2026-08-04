import { api } from './api';

export type Province = {
	code: number;
	name: string;
};

export type Ward = { code: number; name: string };
export type ProvinceWithWards = { code: number; name: string; wards: Ward[] };

// Locations are seeded and served by Fleazo's backend. The header needs only
// provinces; form and filter pickers request the same snapshot with its wards.
const LOCATIONS_PATH = '/locations/provinces';

export async function getProvinces(): Promise<Province[]> {
	try {
		const { data } = await api.get<Province[]>(LOCATIONS_PATH);
		return data;
	} catch (err) {
		console.error('[getProvinces] failed:', err);
		return [];
	}
}

export async function getProvincesWithWards(): Promise<ProvinceWithWards[]> {
	try {
		const { data } = await api.get<ProvinceWithWards[]>(LOCATIONS_PATH, {
			params: { includeWards: true },
		});
		return data;
	} catch (err) {
		console.error('[getProvincesWithWards] failed:', err);
		return [];
	}
}
