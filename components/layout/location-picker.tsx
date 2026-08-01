'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
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

// Left segment of the header's search pill — not a control of its own. It has
// no border, no radius and no background of its own: the pill around it
// supplies all three, so the two read as one object (same rule the hero's
// search field follows).
export function LocationPicker({
	provinces,
	value,
	onChange,
}: {
	provinces: Province[];
	value: number | null;
	onChange: (code: number | null) => void;
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
		setQuery('');
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={`Khu vực: ${label}. Đổi khu vực`}
					// Fixed cap, not width-to-content: letting the chip grow with
					// the chosen name would resize the text field every time you
					// switch province. truncate is the backstop for the few
					// names still long after the prefix comes off.
					className="flex h-full max-w-[10.5rem] shrink-0 items-center gap-1.5 pr-3 pl-4 text-sm font-medium text-fz-ink transition-colors outline-none hover:text-fz-ink/70 focus-visible:text-fz-ink/70"
				>
					<MapPin className="size-4 shrink-0 text-muted-foreground" />
					<span className="truncate">{label}</span>
					<ChevronDown
						className={cn(
							'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
							open && 'rotate-180',
						)}
					/>
				</button>
			</PopoverTrigger>

			<PopoverContent className="w-72">
				{provinces.length === 0 ? (
					// The province list is third-party (see lib/locations.ts).
					// Say so, rather than showing an empty menu that just looks
					// broken.
					<p className="px-3 py-6 text-center text-sm text-muted-foreground">
						Chưa tải được danh sách khu vực. Thử lại sau nhé.
					</p>
				) : (
					<>
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Tìm tỉnh, thành phố…"
							aria-label="Tìm tỉnh, thành phố"
							className="mb-1 h-10 w-full rounded-full border border-input bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
						/>
						<div className="max-h-72 overflow-y-auto overscroll-contain">
							<Option
								label={ALL_PROVINCES_LABEL}
								active={value === null}
								onSelect={() => pick(null)}
							/>
							{matches.map((p) => (
								<Option
									key={p.code}
									label={shortName(p.name)}
									active={p.code === value}
									onSelect={() => pick(p.code)}
								/>
							))}
							{matches.length === 0 && (
								<p className="px-3 py-6 text-center text-sm text-muted-foreground">
									Không tìm thấy khu vực nào.
								</p>
							)}
						</div>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}

function Option({
	label,
	active,
	onSelect,
}: {
	label: string;
	active: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			// A checkmark carries the selected state, not colour on its own.
			className={cn(
				'flex w-full items-center justify-between gap-2 rounded-full px-4 py-2.5 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted',
				active ? 'font-semibold text-fz-ink' : 'text-fz-ink/80',
			)}
		>
			<span className="truncate">{label}</span>
			{active && <Check className="size-4 shrink-0 text-fz-ink" />}
		</button>
	);
}
