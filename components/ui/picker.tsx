'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Hand-written, not `shadcn add`ed — don't expect the CLI to know about it.
//
// One control, two presentations: an anchored popover with a pointer, a bottom
// sheet without one. A popover assumes things a phone doesn't have — a cursor
// that hits a 38px row, no keyboard eating half the screen, and content near
// the trigger because the eye is already there. On a phone the trigger sits at
// the top, which is where the thumb reaches worst, and a popover anchored to it
// puts a scrollable list inside another scrollable surface.
//
// The sheet answers all three: it's anchored to the bottom of the viewport
// rather than to the trigger, so the keyboard pushes it instead of covering it;
// it's full-width, so rows can be 52px; and it owns the only scroll region on
// screen while it's open.

// Same cutover as the header search's inline-pill/sheet split. Keeping them on
// one breakpoint is deliberate: a viewport should never get the desktop search
// pill with the mobile picker, or the reverse.
const DESKTOP = '(min-width: 768px)';

type Search = {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	/** Accessible name — the field has no visible label in either presentation. */
	label: string;
};

export function Picker({
	open,
	onOpenChange,
	trigger,
	title,
	search,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trigger: React.ReactNode;
	/** Visible heading on mobile; the popover is anchored, so it shows none. */
	title: string;
	/** Omit to render a picker with no filter field. */
	search?: Search;
	children: React.ReactNode;
}) {
	const isDesktop = useMediaQuery(DESKTOP);

	if (isDesktop) {
		return (
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>{trigger}</PopoverTrigger>
				<PopoverContent className="w-72">
					{search && (
						<div className="mb-1">
							<SearchField {...search} />
						</div>
					)}
					<PickerList open={open} className="max-h-72">
						{children}
					</PickerList>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			{/* p-0/gap-0 because this lays its own regions out: the header and
			    filter stay put while only the list scrolls. A cap rather than a
			    fixed height so a short list stays short — a picker with four
			    options shouldn't claim most of the screen.
			    svh, never dvh: Radix locks the page while this is open, and with
			    the page unscrollable iOS keeps the URL bar retracted, which is
			    the state dvh resolves LARGER in. The cap would then exceed the
			    area actually on screen. svh is the bars-visible height, so it
			    always fits. */}
			<SheetContent
				side="bottom"
				showCloseButton={false}
				className="max-h-[85svh] gap-0 rounded-t-3xl p-0"
			>
				<div
					aria-hidden
					className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border"
				/>

				<div className="flex shrink-0 items-center justify-between gap-2 pt-3 pr-2 pb-2 pl-5">
					<SheetTitle>{title}</SheetTitle>
					<SheetClose asChild>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Đóng"
							className="size-11"
						>
							<X className="size-5" />
						</Button>
					</SheetClose>
				</div>

				{search && (
					<div className="shrink-0 px-4 pb-3">
						<SearchField {...search} />
					</div>
				)}

				{/* The safe-area pad matches BottomNav's — this sheet covers it,
				    so it inherits the same home-indicator problem.
				    The height cap is on the LIST, not left to it shrinking
				    inside the sheet's cap: `flex-1` shrinking against a
				    container whose height comes from max-height works in Blink
				    and does not in WebKit, where the list keeps its full content
				    height instead. A 34-province list then made the sheet ~1900px
				    tall, anchored to bottom-0, so its top ran far off screen and
				    overflow never engaged — nothing to scroll. Capping the
				    scroller directly needs no shrinking from anyone.
				    55svh + the fixed regions above stays under the sheet's own
				    85svh cap. */}
				<PickerList
					open={open}
					className="max-h-[55svh] px-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
				>
					{children}
				</PickerList>
			</SheetContent>
		</Sheet>
	);
}

// A `PickerOption`'s two sizes are plain responsive classes rather than
// anything read off the Picker: only one presentation is ever mounted, and the
// breakpoint that decides which is the same one these classes switch on.
export function PickerOption({
	label,
	selected,
	onSelect,
}: {
	label: string;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			// Read back by PickerList to scroll the current choice into view.
			data-selected={selected}
			onClick={onSelect}
			className={cn(
				'flex w-full items-center justify-between gap-2 rounded-full px-4 py-3.5 text-left text-[15px] transition-colors outline-none hover:bg-muted focus-visible:bg-muted md:py-2.5 md:text-sm',
				selected ? 'font-semibold text-fz-ink' : 'text-fz-ink/80',
			)}
		>
			<span className="truncate">{label}</span>
			{/* A checkmark carries the selected state, not colour on its own. */}
			{selected && <Check className="size-4 shrink-0 text-fz-ink" />}
		</button>
	);
}

export function PickerEmpty({ children }: { children: React.ReactNode }) {
	return (
		<p className="px-4 py-8 text-center text-sm text-muted-foreground">
			{children}
		</p>
	);
}

function SearchField({ value, onChange, placeholder, label }: Search) {
	return (
		// No autoFocus. On mobile that raises the keyboard the instant the sheet
		// opens, covering the list the user came to look at — and most picks are
		// made by scrolling, not typing. Tapping the field is the opt-in.
		//
		// text-base is 16px and must stay ≥16px at every width below md: iOS
		// Safari zooms the whole page when a focused field is smaller, and it
		// does not zoom back out. Step down only from md up, where there is no
		// iOS to worry about.
		<input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			aria-label={label}
			className="h-11 w-full rounded-full border border-input bg-transparent px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring md:h-10 md:text-sm"
		/>
	);
}

function PickerList({
	open,
	className,
	children,
}: {
	open: boolean;
	className?: string;
	children: React.ReactNode;
}) {
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!open) return;
		// Opening a 34-row list at the top hides the current choice more often
		// than not. Scrolled by assigning scrollTop rather than calling
		// scrollIntoView, which also walks up and scrolls ancestor scrollers —
		// on desktop that means the page jumps behind an open popover.
		//
		// One frame late because the panel is still animating in on the tick
		// this runs, and offsetTop inside a zero-height box is meaningless.
		const frame = requestAnimationFrame(() => {
			const list = ref.current;
			const active = list?.querySelector<HTMLElement>(
				'[data-selected="true"]',
			);
			if (!list || !active) return;
			list.scrollTop =
				active.offsetTop -
				list.clientHeight / 2 +
				active.offsetHeight / 2;
		});
		return () => cancelAnimationFrame(frame);
	}, [open]);

	return (
		// relative so the options' offsetTop is measured against this box.
		// overscroll-contain stops a flick at either end from scrolling whatever
		// is behind the panel. No flex sizing here on purpose — every caller
		// passes an explicit max-height instead.
		<div
			ref={ref}
			className={cn(
				'relative overflow-y-auto overscroll-contain',
				className,
			)}
		>
			{children}
		</div>
	);
}
