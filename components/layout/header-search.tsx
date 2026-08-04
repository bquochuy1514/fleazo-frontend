'use client';

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import {
	ALL_PROVINCES_LABEL,
	LocationPicker,
} from '@/components/layout/location-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import type { Province } from '@/lib/locations';
import {
	getProvinceServerSnapshot,
	getProvinceSnapshot,
	resolveProvinceCode,
	setSavedProvince,
	subscribeToProvince,
} from '@/lib/province-store';
import { cn } from '@/lib/utils';

const PLACEHOLDER = 'Tìm sách, laptop, xe đạp…';
// Trigger button is ~145px wide (~11 chars); full placeholder goes in the sheet.
const TRIGGER_HINT = 'Tìm đồ cũ…';

const shortProvinceName = (name: string) =>
	name.replace(/^(Thành phố|Tỉnh)\s+/i, '');

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
	const { user } = useAuth();
	const viewerId = user?.id ?? null;
	const getSnapshot = useCallback(
		() => getProvinceSnapshot(viewerId),
		[viewerId],
	);
	const saved = useSyncExternalStore(
		subscribeToProvince,
		getSnapshot,
		getProvinceServerSnapshot,
	);
	// The per-account snapshot starts empty after auth hydrates, so it falls
	// back to the profile location instead of an earlier browser-wide choice.
	const provinceCode = resolveProvinceCode(saved, user?.provinceCode);
	const selectedProvince = provinces.find(
		(province) => province.code === provinceCode,
	);
	const mobileTriggerHint = selectedProvince
		? `Tìm ở ${shortProvinceName(selectedProvince.name)}…`
		: TRIGGER_HINT;

	const [sheetOpen, setSheetOpen] = useState(false);
	const sheetInputRef = useRef<HTMLInputElement>(null);

	// Hand-rolled overlay (not Radix Dialog) — page behind stays scrollable,
	// which iOS needs since it can scroll content out from under focus.
	useScrollLock(sheetOpen);

	useEffect(() => {
		if (!sheetOpen) return;
		// Explicit focus, not autoFocus — unreliable on nodes mounted via state
		// flip. preventScroll: field is already visible inside the fixed overlay.
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
			{/* Desktop: one pill combining location + search, separated by a hairline. */}
			{/* Glass skin tied to `bare` (scroll position) only — no focus-flip
			    to opaque, which used to make the pill change for two unrelated
			    reasons. Contrast while typing comes from the header scrim +
			    backdrop-blur instead. */}
			<form
				action="/tim-kiem"
				role="search"
				className={cn(
					// duration-300 ease-out matches the header's own pill transition
					// so both flip on scroll at the same speed.
					'hidden h-11 w-full max-w-md items-center rounded-full border pr-1 transition-colors duration-300 ease-out focus-within:ring-1 motion-reduce:transition-none md:flex',
					// Ring colour switches with the skin — it's the focus signal
					// over the photo, where the default dark ring is near invisible.
					bare
						? 'border-white/25 bg-white/10 backdrop-blur-sm focus-within:border-white/70 focus-within:ring-white/70'
						: 'border-border bg-card focus-within:border-ring focus-within:ring-ring/45',
				)}
			>
				<LocationPicker
					provinces={provinces}
					value={provinceCode}
					onChange={(code) => setSavedProvince(code, viewerId)}
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
				{/* Inverts to a white chip on the photo, same as the Đăng tin CTA. */}
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

			{/* Below md: full-screen sheet instead — inline pill leaves too
			    little room for the text field once logo + location take theirs.
			    Cutover at md since inline only stops being cramped near 750px. */}
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
					{mobileTriggerHint}
				</span>
			</button>

			{/* Portalled to <body>: header pill gets backdrop-blur-md once past
			    the hero, and a backdrop-filter ancestor becomes the containing
			    block for `position: fixed` descendants, breaking `inset-0`. */}
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

					{/* Location choice gets room to be a labelled control here. */}
					<div className="px-4 pt-6">
						<p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
							Khu vực
						</p>
						<div className="mt-2">
							<LocationPicker
								variant="row"
								provinces={provinces}
								value={provinceCode}
								onChange={(code) => setSavedProvince(code, viewerId)}
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
