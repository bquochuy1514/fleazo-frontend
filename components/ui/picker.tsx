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

// Hand-written, not shadcn-generated.
//
// One control, two presentations: anchored popover on desktop, bottom sheet
// on mobile (avoids a popover's scroll-in-scroll and thumb-reach issues).

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
	presentation = 'auto',
	// w-72 fits most content; callers with wider content (e.g. long names) can override.
	popoverClassName = 'w-72',
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trigger: React.ReactNode;
	/** Visible heading on mobile; the popover is anchored, so it shows none. */
	title: string;
	/** Omit to render a picker with no filter field. */
	search?: Search;
	children: React.ReactNode;
	popoverClassName?: string;
	/** Force an anchored list when a picker is rendered inside another Sheet. */
	presentation?: 'auto' | 'popover';
}) {
	const isDesktop = useMediaQuery(DESKTOP);

	if (presentation === 'popover' || isDesktop) {
		return (
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>{trigger}</PopoverTrigger>
				{/* Cap the flex container (not just the list) to Radix's available-height
				    var, so the search field's own height is budgeted too. min-h-0 lets
				    the list actually shrink instead of keeping its natural content height. */}
				<PopoverContent
					className={cn(
						'flex max-h-[min(24rem,var(--radix-popover-content-available-height,24rem))] flex-col',
						popoverClassName,
					)}
				>
					{search && (
						<div className="mb-1 shrink-0">
							<SearchField {...search} />
						</div>
					)}
					<PickerList open={open} className="min-h-0 flex-1 max-h-72">
						{children}
					</PickerList>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			{/* p-0/gap-0: header/filter stay fixed, only the list scrolls.
			    svh not dvh: page is scroll-locked while open, so iOS keeps the URL
			    bar retracted — dvh would resolve larger than what's actually visible. */}
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

				{/* Height cap is on the LIST directly, not via flex-1 shrinking (WebKit
				    ignores that against a max-height container, unlike Blink) — an
				    uncapped list could blow the sheet's height past the viewport.
				    min-h matches max-h only when there's a search field: otherwise a
				    filtered-down list would shrink the whole sheet and drop the last
				    row under the keyboard. */}
				<PickerList
					open={open}
					className={cn(
						'max-h-[55svh] px-2 pb-[max(1rem,env(safe-area-inset-bottom))]',
						search && 'min-h-[55svh]',
					)}
				>
					{children}
				</PickerList>
			</SheetContent>
		</Sheet>
	);
}

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
				'flex w-full items-center justify-between gap-2 rounded-full px-4 py-3.5 text-left text-base transition-colors outline-none hover:bg-muted focus-visible:bg-muted md:py-2.5 md:text-sm',
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
		// No autoFocus — avoids raising the keyboard immediately on mobile.
		// iOS Safari zooms focused fields below 16px, including in a landscape
		// viewport where a phone can satisfy the md breakpoint.
		<input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			aria-label={label}
			className="h-11 w-full rounded-full border border-input bg-transparent px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring md:h-10"
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
		// Scroll to the current choice on open. scrollTop, not scrollIntoView —
		// that also scrolls ancestor scrollers, jumping the page behind the popover.
		// One frame late: the panel is still animating in, offsetTop isn't ready yet.
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
		// relative: options' offsetTop is measured against this box.
		// overscroll-contain: stops flick scroll from reaching whatever's behind the panel.
		// stopPropagation on wheel/touch: when portalled inside a modal Radix Dialog, the
		// Dialog's scroll lock blocks wheel/touch events outside its own content ref —
		// this list isn't on that allowlist, so wheel-scroll silently did nothing without this.
		<div
			ref={ref}
			onWheel={(e) => e.stopPropagation()}
			onTouchMove={(e) => e.stopPropagation()}
			className={cn(
				'relative overflow-y-auto overscroll-contain',
				className,
			)}
		>
			{children}
		</div>
	);
}
