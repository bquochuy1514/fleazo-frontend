'use client';

import { useEffect, useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

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

	const provincePlaceholder = isLoading ? 'Đang tải...' : 'Tỉnh/Thành phố';

	const handleProvinceChange = (value: string | null) => {
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

	const handleWardChange = (value: string | null) => {
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

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<Select
				value={provinceCode ? String(provinceCode) : undefined}
				onValueChange={handleProvinceChange}
				disabled={isLoading}
			>
				<SelectTrigger className="w-full !h-11">
					<SelectValue placeholder={provincePlaceholder}>
						{(value: string | null) =>
							value
								? (provinces.find(
										(p) => String(p.code) === value,
									)?.name ?? provincePlaceholder)
								: provincePlaceholder
						}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{provinces.map((p) => (
						<SelectItem key={p.code} value={String(p.code)}>
							{p.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={wardCode ? String(wardCode) : undefined}
				onValueChange={handleWardChange}
				disabled={!provinceCode}
			>
				<SelectTrigger className="w-full !h-11">
					<SelectValue placeholder="Phường/Xã">
						{(value: string | null) =>
							value
								? (wards.find((w) => String(w.code) === value)
										?.name ?? 'Phường/Xã')
								: 'Phường/Xã'
						}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{wards.map((w) => (
						<SelectItem key={w.code} value={String(w.code)}>
							{w.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
