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

// Strips the "Thành phố"/"Tỉnh" prefix — same on every row, no info value,
// was truncating names in the header chip (e.g. "Thành ph…").
const shortName = (name: string) => name.replace(/^(Thành phố|Tỉnh)\s+/i, '');

// Diacritics stripped for matching, so "da nang" finds "Đà Nẵng".
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
	presentation = 'auto',
}: {
	provinces: Province[];
	value: number | null;
	onChange: (code: number | null) => void;
	// The pill loses its background over the hero photo, so this must invert
	// with it. `chip` only — `row` never sits on a photo.
	onDark?: boolean;
	// `chip`: segment of the header pill, no own border/radius/background.
	// `row`: standalone full-width control for a sheet.
	variant?: 'chip' | 'row';
	// Search's mobile filter is already a Sheet; an anchored picker avoids
	// nesting a second modal sheet inside it.
	presentation?: 'auto' | 'popover';
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
				// Height from padding + min-h floor, not a fixed h-*; padding
				// alone already clears the 44px touch minimum.
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
				// Fixed max-width, not width-to-content: growing with the name
				// would resize the text field on every switch. truncate is the backstop.
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
				{/* Different durations on purpose: colour rides the header's
				    300ms flip, rotation is a snappier 200ms click response. */}
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
				// Cleared on close, not on pick, so the list doesn't look like it emptied.
				if (!next) setQuery('');
			}}
			trigger={trigger}
			title="Chọn khu vực"
			presentation={presentation}
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
				// Province list is third-party — say so rather than showing
				// an empty menu.
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
