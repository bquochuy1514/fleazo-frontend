'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import {
	ALL_PROVINCES_LABEL,
	LocationPicker,
} from '@/components/layout/location-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useScrollLock } from '@/hooks/use-scroll-lock';
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
	bare = false,
	className,
}: {
	provinces: Province[];
	// True while the header is sitting transparent over a hero photo.
	bare?: boolean;
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

	// This overlay is hand-rolled rather than a Radix Dialog, so the page
	// behind it is still live and still scrollable — including to iOS, which
	// will scroll it out from under the reader the moment the field takes
	// focus.
	useScrollLock(sheetOpen);

	useEffect(() => {
		if (!sheetOpen) return;
		// Explicit focus rather than the autoFocus attribute: the field is
		// mounted by a state flip, and React's autoFocus is unreliable on
		// nodes that appear that way.
		//
		// preventScroll because the field is inside a fixed overlay: it is
		// already fully visible, so every scroll the browser performs to
		// "reveal" it is pure damage.
		sheetInputRef.current?.focus({ preventScroll: true });
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
			{/* The glass skin is tied to `bare` alone — scroll position, nothing
			    else. Focusing the field used to flip it back to the opaque
			    surface for legibility while typing; that made the pill change
			    twice for two unrelated reasons and read as a glitch. Contrast
			    while typing on the photo is carried by the header's own scrim
			    plus the field's backdrop-blur instead. */}
			<form
				action="/tim-kiem"
				role="search"
				className={cn(
					// duration-300 ease-out, not the default 150ms: this pill sits
					// INSIDE the header's own pill, and the two flip on the same
					// scroll event. At different speeds you see the field finish
					// first and the surround catch up — the one artifact that
					// gives away that they're separate elements.
					'hidden h-11 w-full max-w-md items-center rounded-full border pr-1 transition-colors duration-300 ease-out focus-within:ring-1 motion-reduce:transition-none md:flex',
					// The ring colour has to switch with the skin. Now that the
					// pill no longer goes opaque on focus, this ring IS the focus
					// signal over the photo — and the default dark ring is close
					// to invisible there.
					bare
						? 'border-white/25 bg-white/10 backdrop-blur-sm focus-within:border-white/70 focus-within:ring-white/70'
						: 'border-border bg-card focus-within:border-ring focus-within:ring-ring/45',
				)}
			>
				<LocationPicker
					provinces={provinces}
					value={provinceCode}
					onChange={setSavedProvince}
					onDark={bare}
				/>
				<span
					aria-hidden
					className={cn(
						'h-5 w-px shrink-0 transition-colors duration-300 ease-out motion-reduce:transition-none',
						bare ? 'bg-white/25' : 'bg-border',
					)}
				/>

				<Search
					className={cn(
						'pointer-events-none mr-2 ml-3 size-4 shrink-0 transition-colors duration-300 ease-out motion-reduce:transition-none',
						bare ? 'text-white/70' : 'text-muted-foreground',
					)}
				/>
				<Input
					name="q"
					type="search"
					placeholder={PLACEHOLDER}
					aria-label="Tìm kiếm sản phẩm"
					autoComplete="off"
					className={cn(
						'h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 transition-colors duration-300 ease-out focus-visible:border-0 focus-visible:ring-0 motion-reduce:transition-none',
						bare && 'text-white placeholder:text-white/65',
					)}
				/>
				{provinceField}
				{/* Inverts to a white chip on the photo, the same move the
				    Đăng tin CTA makes — the two read as a pair marking the
				    header's two real actions. */}
				<Button
					type="submit"
					size="icon"
					aria-label="Tìm kiếm"
					className={cn(
						'size-9 transition-colors duration-300 ease-out motion-reduce:transition-none',
						bare &&
							'bg-white text-fz-ink hover:bg-white/85 focus-visible:ring-white/50',
					)}
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
			{/* No focus-flip here — tapping opens the sheet, which has its own
			    opaque surface, so nothing is ever typed against the photo. */}
			<button
				type="button"
				onClick={() => setSheetOpen(true)}
				aria-label="Mở ô tìm kiếm"
				className={cn(
					'flex h-11 w-full items-center gap-2.5 rounded-full border pr-4 pl-4 text-left transition-colors duration-300 ease-out motion-reduce:transition-none md:hidden',
					bare
						? 'border-white/25 bg-white/10 backdrop-blur-sm'
						: 'border-border bg-card',
				)}
			>
				<Search
					className={cn(
						'size-4 shrink-0 transition-colors duration-300 ease-out motion-reduce:transition-none',
						bare ? 'text-white/70' : 'text-muted-foreground',
					)}
				/>
				<span
					className={cn(
						'truncate text-sm transition-colors duration-300 ease-out motion-reduce:transition-none',
						bare ? 'text-white/75' : 'text-muted-foreground',
					)}
				>
					{TRIGGER_HINT}
				</span>
			</button>

			{/* Portalled to <body>, not left where it sits in the tree. Once the
			    header leaves the hero its pill gets backdrop-blur-md, and an
			    element with a backdrop-filter becomes the containing block for
			    its `position: fixed` descendants — `inset-0` then resolves
			    against the PILL. The overlay shrank to the pill's own 397×62 box
			    and read as a stray panel under the search field. Nothing about
			    this overlay is wrong; it just cannot be rendered inside a
			    filtered ancestor. */}
			{sheetOpen &&
				createPortal(
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
							className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring"
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
						<div className="mt-2">
							<LocationPicker
								variant="row"
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
					</div>,
					document.body,
				)}
		</div>
	);
}
