'use client';

import { useEffect, useState } from 'react';

type Ward = { code: number; name: string };
type Province = { code: number; name: string; wards: Ward[] };

type LocationValue = {
	provinceCode: number | null;
	provinceName: string;
	wardCode: number | null;
	wardName: string;
};

type LocationPickerProps = {
	onChange?: (value: LocationValue) => void;
};

export function LocationPicker({ onChange }: LocationPickerProps) {
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [provinceCode, setProvinceCode] = useState<number | null>(null);
	const [wardCode, setWardCode] = useState<number | null>(null);

	useEffect(() => {
		fetch('https://provinces.open-api.vn/api/v2/?depth=2')
			.then((res) => res.json())
			.then((data: Province[]) => setProvinces(data))
			.finally(() => setIsLoading(false));
	}, []);

	const selectedProvince = provinces.find((p) => p.code === provinceCode);
	const wards = selectedProvince?.wards ?? [];

	const handleProvinceChange = (value: string) => {
		const code = value ? Number(value) : null;
		const province = provinces.find((p) => p.code === code);
		setProvinceCode(code);
		setWardCode(null);
		onChange?.({
			provinceCode: code,
			provinceName: province?.name ?? '',
			wardCode: null,
			wardName: '',
		});
	};

	const handleWardChange = (value: string) => {
		const code = value ? Number(value) : null;
		const ward = wards.find((w) => w.code === code);
		setWardCode(code);
		onChange?.({
			provinceCode,
			provinceName: selectedProvince?.name ?? '',
			wardCode: code,
			wardName: ward?.name ?? '',
		});
	};

	const selectClassName =
		'h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-fz-ink outline-none focus:border-fz-primary disabled:opacity-50';

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<select
				value={provinceCode ?? ''}
				onChange={(e) => handleProvinceChange(e.target.value)}
				disabled={isLoading}
				className={selectClassName}
			>
				<option value="">
					{isLoading ? 'Đang tải...' : 'Tỉnh/Thành phố'}
				</option>
				{provinces.map((p) => (
					<option key={p.code} value={p.code}>
						{p.name}
					</option>
				))}
			</select>

			<select
				value={wardCode ?? ''}
				onChange={(e) => handleWardChange(e.target.value)}
				disabled={!provinceCode}
				className={selectClassName}
			>
				<option value="">Phường/Xã</option>
				{wards.map((w) => (
					<option key={w.code} value={w.code}>
						{w.name}
					</option>
				))}
			</select>
		</div>
	);
}
