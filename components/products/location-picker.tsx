'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import {
	Picker,
	PickerEmpty,
	PickerOption,
} from '@/components/ui/picker';
import type { ProvinceWithWards, Ward } from '@/lib/locations';
import { cn } from '@/lib/utils';

export type LocationValue = {
	provinceCode: number | null;
	provinceName: string;
	wardCode: number | null;
	wardName: string;
};

const EMPTY_VALUE: LocationValue = {
	provinceCode: null,
	provinceName: '',
	wardCode: null,
	wardName: '',
};

// The dataset returns full administrative names — "Thành phố Hà Nội",
// "Phường Bến Nghé". Trimmed for the trigger label only; the raw name is
// still what's sent to the backend (see LocationValue below), matching what
// `fleazo-frontend` (v1) stored — the shortening is a display-only change.
const shortName = (name: string) =>
	name.replace(/^(Thành phố|Tỉnh|Phường|Xã|Đặc khu)\s+/i, '');

const norm = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/đ/gi, 'd')
		.toLowerCase();

// Ward-level (depth=2) picker for the listing form — a different data need
// than the header's province-only chip (components/layout/location-picker.tsx),
// which only goes to depth=1 server-side. No backend location endpoint
// exists, so this reads the same third-party dataset — but server-fetched
// and cached once (lib/locations.ts → getProvincesWithWards, revalidated
// daily) and passed down as a prop, rather than each mount of this
// component re-fetching it client-side.
export function LocationPicker({
	provinces,
	value,
	onChange,
}: {
	provinces: ProvinceWithWards[];
	// Externally-set default (e.g. the seller's saved address, or the product
	// being edited) — resolved once the list loads. Only applies until the
	// seller picks manually.
	value?: { provinceCode: number | null; wardCode: number | null } | null;
	onChange?: (value: LocationValue) => void;
}) {
	const [province, setProvince] = useState<ProvinceWithWards | null>(null);
	const [ward, setWard] = useState<Ward | null>(null);

	const [provinceOpen, setProvinceOpen] = useState(false);
	const [provinceQuery, setProvinceQuery] = useState('');
	const [wardOpen, setWardOpen] = useState(false);
	const [wardQuery, setWardQuery] = useState('');

	// Applies only while nothing's been picked locally yet (`!province`) —
	// once the seller touches the province picker (including clearing it),
	// this stops re-applying.
	useEffect(() => {
		if (!value?.provinceCode || provinces.length === 0 || province) return;
		const found = provinces.find((p) => p.code === value.provinceCode);
		if (!found) return;
		const foundWard = value.wardCode
			? (found.wards.find((w) => w.code === value.wardCode) ?? null)
			: null;

		// queueMicrotask avoids react-hooks/set-state-in-effect
		queueMicrotask(() => {
			setProvince(found);
			setWard(foundWard);
			onChange?.({
				provinceCode: found.code,
				provinceName: found.name,
				wardCode: foundWard?.code ?? null,
				wardName: foundWard?.name ?? '',
			});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value?.provinceCode, value?.wardCode, provinces, province]);

	const pickProvince = (next: ProvinceWithWards) => {
		setProvince(next);
		setWard(null);
		onChange?.({
			provinceCode: next.code,
			provinceName: next.name,
			wardCode: null,
			wardName: '',
		});
		setProvinceOpen(false);
	};

	const pickWard = (next: Ward) => {
		setWard(next);
		onChange?.({
			provinceCode: province?.code ?? null,
			provinceName: province?.name ?? '',
			wardCode: next.code,
			wardName: next.name,
		});
		setWardOpen(false);
	};

	const provinceMatches = useMemo(() => {
		const q = norm(provinceQuery.trim());
		if (!q) return provinces;
		return provinces.filter((p) => norm(p.name).includes(q));
	}, [provinces, provinceQuery]);

	const wardMatches = useMemo(() => {
		const wards = province?.wards ?? [];
		const q = norm(wardQuery.trim());
		if (!q) return wards;
		return wards.filter((w) => norm(w.name).includes(q));
	}, [province, wardQuery]);

	return (
		<div className="space-y-3">
			<Picker
				open={provinceOpen}
				onOpenChange={(next) => {
					setProvinceOpen(next);
					if (!next) setProvinceQuery('');
				}}
				trigger={
					<Trigger
						icon={MapPin}
						label={
							province ? shortName(province.name) : 'Tỉnh/thành phố'
						}
						placeholder={!province}
						disabled={provinces.length === 0}
					/>
				}
				title="Chọn tỉnh/thành phố"
				search={
					provinces.length > 0
						? {
								value: provinceQuery,
								onChange: setProvinceQuery,
								placeholder: 'Tìm tỉnh, thành phố…',
								label: 'Tìm tỉnh, thành phố',
							}
						: undefined
				}
			>
				{provinces.length === 0 ? (
					<PickerEmpty>
						Chưa tải được danh sách tỉnh/thành. Thử lại sau nhé.
					</PickerEmpty>
				) : provinceMatches.length === 0 ? (
					<PickerEmpty>Không tìm thấy tỉnh/thành nào.</PickerEmpty>
				) : (
					provinceMatches.map((p) => (
						<PickerOption
							key={p.code}
							label={shortName(p.name)}
							selected={p.code === province?.code}
							onSelect={() => pickProvince(p)}
						/>
					))
				)}
			</Picker>

			<Picker
				open={wardOpen}
				onOpenChange={(next) => {
					setWardOpen(next);
					if (!next) setWardQuery('');
				}}
				trigger={
					<Trigger
						icon={MapPin}
						label={ward ? shortName(ward.name) : 'Phường/xã'}
						placeholder={!ward}
						disabled={!province}
					/>
				}
				title="Chọn phường/xã"
				search={
					(province?.wards.length ?? 0) > 0
						? {
								value: wardQuery,
								onChange: setWardQuery,
								placeholder: 'Tìm phường, xã…',
								label: 'Tìm phường, xã',
							}
						: undefined
				}
			>
				{wardMatches.length === 0 ? (
					<PickerEmpty>Không tìm thấy phường/xã nào.</PickerEmpty>
				) : (
					wardMatches.map((w) => (
						<PickerOption
							key={w.code}
							label={shortName(w.name)}
							selected={w.code === ward?.code}
							onSelect={() => pickWard(w)}
						/>
					))
				)}
			</Picker>
		</div>
	);
}

// forwardRef + ...rest, not just the four props this actually renders with:
// Picker passes this to `<PopoverTrigger asChild>`/`<SheetTrigger asChild>`,
// which is a Radix Slot — it clones onClick/ref/aria-expanded/data-state
// etc. onto whatever element `asChild` wraps. A component that destructures
// only its own props and drops the rest silently eats that onClick, so the
// trigger renders but never opens anything.
const Trigger = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<'button'> & {
		icon: typeof MapPin;
		label: string;
		placeholder: boolean;
	}
>(function Trigger(
	{ icon: Icon, label, placeholder, disabled, className, ...props },
	ref,
) {
	return (
		<button
			ref={ref}
			type="button"
			disabled={disabled}
			aria-label={label}
			// h-11/rounded-lg — matches Input's own height/radius exactly, so
			// this reads as one field among Địa chỉ chi tiết and the other
			// h-11 fields around it, not a taller "card" control (that
			// min-h-13/rounded-2xl row style belongs to the header's own
			// province chip, a different, more spacious context).
			className={cn(
				'flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-input bg-transparent px-2.5 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		>
			<span className="flex min-w-0 items-center gap-2.5">
				<Icon className="size-4 shrink-0 text-muted-foreground" />
				<span
					className={cn(
						'truncate text-[15px]',
						placeholder
							? 'text-muted-foreground'
							: 'font-medium text-fz-ink',
					)}
				>
					{label}
				</span>
			</span>
			<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
		</button>
	);
});

export { EMPTY_VALUE as EMPTY_LOCATION_VALUE };
