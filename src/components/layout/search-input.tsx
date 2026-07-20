'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Placeholder only, not wired to product search yet. White pill styled for
// the navy header — not shadcn Input's default look, which assumes a light
// page background.
//
// Focus state (mobile only): a "Hủy" button appears beside the input,
// staying in normal document flow — header.tsx doesn't hide anything above
// to make room for it.
export function SearchInput() {
	const [focused, setFocused] = useState(false);

	// No ref here — shadcn's Input doesn't forward one. onMouseDown below
	// stops the browser from blurring the input on its own first, which
	// would unmount this button before its onClick ever fires.
	function handleCancel() {
		(document.activeElement as HTMLElement | null)?.blur();
	}

	return (
		<div className="flex items-center gap-2">
			<div className="relative flex-1">
				<Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Tìm giáo trình, laptop, xe đạp cũ..."
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					className={cn(
						'h-10 rounded-full border-0 bg-white pl-10 pr-4 text-sm text-fz-ink shadow-inner focus-visible:ring-2 focus-visible:ring-fz-accent',
						// Kill native type="search" chrome (WebKit draws its own
						// rounded box + clear button around it).
						'appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden',
					)}
				/>
			</div>

			{/* Always mounted (not `focused &&`) so the width can actually
			    transition — conditionally rendering it just pops it in/out
			    instantly. `grid-template-columns: 0fr → 1fr` is the trick for
			    animating to/from "auto" width without knowing it upfront. */}
			<div
				className={cn(
					'grid shrink-0 overflow-hidden transition-[grid-template-columns] duration-300 ease-out sm:hidden',
					focused ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]',
				)}
			>
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={handleCancel}
					tabIndex={focused ? 0 : -1}
					className="overflow-hidden pl-2 text-sm font-medium whitespace-nowrap text-white/90 hover:text-white"
				>
					Hủy
				</button>
			</div>
		</div>
	);
}
