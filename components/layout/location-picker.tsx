'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import {
	Picker,
	PickerEmpty,
	PickerOption,
} from '@/components/ui/picker';
import type { Province } from '@/lib/locations';
import { cn } from '@/lib/utils';

export const ALL_PROVINCES_LABEL = 'Toàn quốc';

// The dataset returns full administrative names — "Thành phố Hà Nội", "Tỉnh
// Lào Cai". That prefix is the same two words on every row, so it carries no
// information while taking the space that does: in the header chip it was
// pushing "Thành phố Hà Nội" out as "Thành ph…". Dropped in the list too, where
// 34 rows all starting the same way are just harder to scan.
const shortName = (name: string) => name.replace(/^(Thành phố|Tỉnh)\s+/i, '');

// Vietnamese place names are matched with diacritics stripped, so "da nang"
// finds "Đà Nẵng" — nobody types the marks into a filter. \p{Diacritic} rather
// than a literal combining-mark range so the source stays plain ASCII.
const norm = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/đ/gi, 'd')
		.toLowerCase();

export function LocationPicker({
	provinces,
	value,
	onChange,
	onDark = false,
	variant = 'chip',
}: {
	provinces: Province[];
	value: number | null;
	onChange: (code: number | null) => void;
	// The pill this sits in loses its background over the hero photo, so the
	// segment has to invert with it. `chip` only — `row` never sits on a photo.
	onDark?: boolean;
	// `chip` is a segment of the header's search pill and owns no border,
	// radius or background of its own — the pill supplies all three so the two
	// read as one object. `row` is a standalone full-width control for a sheet,
	// where a 145px chip is both a small target and visibly adrift.
	variant?: 'chip' | 'row';
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');

	const selected = provinces.find((p) => p.code === value);
	const label = selected ? shortName(selected.name) : ALL_PROVINCES_LABEL;

	const matches = useMemo(() => {
		const q = norm(query.trim());
		if (!q) return provinces;
		return provinces.filter((p) => norm(p.name).includes(q));
	}, [provinces, query]);

	const pick = (code: number | null) => {
		onChange(code);
		setOpen(false);
	};

	const triggerLabel = `Khu vực: ${label}. Đổi khu vực`;

	const trigger =
		variant === 'row' ? (
			<button
				type="button"
				aria-label={triggerLabel}
				// Height comes from padding with min-h as the floor, not from a
				// fixed h-*: a single height utility is one class away from
				// collapsing this to a hairline, and padding alone already
				// clears the 44px touch minimum.
				className="flex min-h-13 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted"
			>
				<span className="flex min-w-0 items-center gap-2.5">
					<MapPin className="size-4 shrink-0 text-muted-foreground" />
					<span className="truncate text-[15px] font-medium text-fz-ink">
						{label}
					</span>
				</span>
				<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
			</button>
		) : (
			<button
				type="button"
				aria-label={triggerLabel}
				// Fixed cap, not width-to-content: letting the chip grow with
				// the chosen name would resize the text field every time you
				// switch province. truncate is the backstop for the few names
				// still long after the prefix comes off.
				className={cn(
					'flex h-full max-w-[10.5rem] shrink-0 items-center gap-1.5 pr-3 pl-4 text-sm font-medium transition-colors duration-300 ease-out outline-none motion-reduce:transition-none',
					onDark
						? 'text-white hover:text-white/75 focus-visible:text-white/75'
						: 'text-fz-ink hover:text-fz-ink/70 focus-visible:text-fz-ink/70',
				)}
			>
				<MapPin
					className={cn(
						'size-4 shrink-0 transition-colors duration-300 ease-out motion-reduce:transition-none',
						onDark ? 'text-white/70' : 'text-muted-foreground',
					)}
				/>
				<span className="truncate">{label}</span>
				{/* Two different durations on purpose: the colour rides the
				    header's 300ms flip, the rotation is a 200ms response to
				    your own click and must not feel that slow. */}
				<ChevronDown
					className={cn(
						'size-3.5 shrink-0 transition-[transform,color] duration-200 motion-reduce:transition-none',
						onDark ? 'text-white/70' : 'text-muted-foreground',
						open && 'rotate-180',
					)}
				/>
			</button>
		);

	return (
		<Picker
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				// Cleared on close, not on pick: a filtered list that empties
				// itself the moment you choose looks like the choice failed.
				if (!next) setQuery('');
			}}
			trigger={trigger}
			title="Chọn khu vực"
			search={
				provinces.length > 0
					? {
							value: query,
							onChange: setQuery,
							placeholder: 'Tìm tỉnh, thành phố…',
							label: 'Tìm tỉnh, thành phố',
						}
					: undefined
			}
		>
			{provinces.length === 0 ? (
				// The province list is third-party (see lib/locations.ts). Say
				// so, rather than showing an empty menu that just looks broken.
				<PickerEmpty>
					Chưa tải được danh sách khu vực. Thử lại sau nhé.
				</PickerEmpty>
			) : (
				<>
					<PickerOption
						label={ALL_PROVINCES_LABEL}
						selected={value === null}
						onSelect={() => pick(null)}
					/>
					{matches.map((p) => (
						<PickerOption
							key={p.code}
							label={shortName(p.name)}
							selected={p.code === value}
							onSelect={() => pick(p.code)}
						/>
					))}
					{matches.length === 0 && (
						<PickerEmpty>Không tìm thấy khu vực nào.</PickerEmpty>
					)}
				</>
			)}
		</Picker>
	);
}
