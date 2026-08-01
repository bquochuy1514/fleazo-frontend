'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Search, X } from 'lucide-react';
import {
	ALL_PROVINCES_LABEL,
	LocationPicker,
} from '@/components/layout/location-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Province } from '@/lib/locations';
import {
	getProvinceServerSnapshot,
	getProvinceSnapshot,
	setSavedProvince,
	subscribeToProvince,
} from '@/lib/province-store';
import { cn } from '@/lib/utils';

const PLACEHOLDER = 'Tìm sách, laptop, xe đạp…';
// The trigger button is ~145px wide once the logo and the account button have
// taken their share, which leaves room for about eleven characters. The full
// placeholder goes in the sheet, where the field is 233px.
const TRIGGER_HINT = 'Tìm đồ cũ…';

export function HeaderSearch({
	provinces,
	className,
}: {
	provinces: Province[];
	className?: string;
}) {
	const saved = useSyncExternalStore(
		subscribeToProvince,
		getProvinceSnapshot,
		getProvinceServerSnapshot,
	);
	const provinceCode = saved === null ? null : Number(saved);

	const [sheetOpen, setSheetOpen] = useState(false);
	const sheetInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!sheetOpen) return;
		// Explicit focus rather than the autoFocus attribute: the field is
		// mounted by a state flip, and React's autoFocus is unreliable on
		// nodes that appear that way.
		sheetInputRef.current?.focus();
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setSheetOpen(false);
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [sheetOpen]);

	const provinceField = provinceCode !== null && (
		<input type="hidden" name="provinceCode" value={provinceCode} />
	);

	return (
		<div className={cn('min-w-0', className)}>
			{/* ── Desktop: one pill holding two things — where you're looking
			    and what you're looking for. Not two controls side by side: a
			    marketplace search reads as a sentence, and the hairline is the
			    only thing separating the halves. */}
			<form
				action="/tim-kiem"
				role="search"
				className="hidden h-11 w-full max-w-md items-center rounded-full border border-border bg-card pr-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 md:flex"
			>
				<LocationPicker
					provinces={provinces}
					value={provinceCode}
					onChange={setSavedProvince}
				/>
				<span aria-hidden className="h-5 w-px shrink-0 bg-border" />

				<Search className="pointer-events-none mr-2 ml-3 size-4 shrink-0 text-muted-foreground" />
				<Input
					name="q"
					type="search"
					placeholder={PLACEHOLDER}
					aria-label="Tìm kiếm sản phẩm"
					autoComplete="off"
					className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 focus-visible:border-0 focus-visible:ring-0"
				/>
				{provinceField}
				<Button
					type="submit"
					size="icon"
					aria-label="Tìm kiếm"
					className="size-9"
				>
					<Search className="size-4" />
				</Button>
			</form>

			{/* ── Below md, a full-screen sheet instead. Inline, the same pill
			    leaves the text field ~19px at 640px and ~100px at 375px once
			    the logo and the location segment have taken their share — a
			    field that narrow can't even show its own placeholder. The
			    cutover is md, not sm, because the inline version only stops
			    being cramped somewhere around 750px. A different layout for
			    small screens, not the desktop one squeezed. */}
			<button
				type="button"
				onClick={() => setSheetOpen(true)}
				aria-label="Mở ô tìm kiếm"
				className="flex h-11 w-full items-center gap-2.5 rounded-full border border-border bg-card pr-4 pl-4 text-left transition-colors md:hidden"
			>
				<Search className="size-4 shrink-0 text-muted-foreground" />
				<span className="truncate text-sm text-muted-foreground">
					{TRIGGER_HINT}
				</span>
			</button>

			{sheetOpen && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="Tìm kiếm"
					className="fixed inset-0 z-50 bg-background md:hidden"
				>
					<div className="flex items-center gap-2 px-4 pt-4">
						<form
							action="/tim-kiem"
							role="search"
							className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30"
						>
							<Search className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
							<Input
								ref={sheetInputRef}
								name="q"
								type="search"
								placeholder={PLACEHOLDER}
								aria-label="Tìm kiếm sản phẩm"
								autoComplete="off"
								className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 focus-visible:border-0 focus-visible:ring-0"
							/>
							{provinceField}
						</form>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Đóng"
							className="size-11"
							onClick={() => setSheetOpen(false)}
						>
							<X className="size-5" />
						</Button>
					</div>

					{/* The location choice moves in here, where it has room to
					    be a labelled control instead of a 135px segment eating
					    the text field. */}
					<div className="px-4 pt-6">
						<p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
							Khu vực
						</p>
						<div className="mt-2 inline-flex h-11 items-center rounded-full border border-border bg-card">
							<LocationPicker
								provinces={provinces}
								value={provinceCode}
								onChange={setSavedProvince}
							/>
						</div>
						<p className="mt-3 text-sm text-muted-foreground">
							{provinceCode === null
								? `Đang tìm trên ${ALL_PROVINCES_LABEL.toLowerCase()}.`
								: 'Chỉ hiện tin đăng trong khu vực này.'}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
