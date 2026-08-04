import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
	PRODUCT_STATUS_LABELS,
	type ProductStatus,
} from '@/types/product.types';

export type TabKey = ProductStatus | 'ALL';

// Flip to true to show only "Tất cả" + non-empty + the current tab. EXPIRED and
// BANNED read 0 forever until the backend grows flows that produce them.
const HIDE_EMPTY_TABS = false;

// Ordered by how often a seller needs them, not by the enum's order.
const TAB_ORDER: TabKey[] = [
	'ALL',
	'ACTIVE',
	'PENDING',
	'DRAFT',
	'REJECTED',
	'SOLD',
	'CANCELLED',
	'EXPIRED',
	'BANNED',
];

export function tabLabel(key: TabKey): string {
	return key === 'ALL' ? 'Tất cả' : PRODUCT_STATUS_LABELS[key];
}

// A filter nav, not a tab widget: one list gets re-filtered and the state lives
// in the URL, so real links buy back-button, middle-click and normal tab order
// for free — none of which Radix Tabs' roving tabindex would give us.
export function ListingStatusTabs({
	counts,
	activeTab,
	searchQuery,
	showCounts = true,
}: {
	counts: Record<TabKey, number>;
	activeTab: TabKey;
	searchQuery: string;
	// Counts are hidden while the first fetch is in flight — a placeholder "0"
	// is a wrong number the user reads before it corrects itself.
	showCounts?: boolean;
}) {
	const visibleTabs = HIDE_EMPTY_TABS
		? TAB_ORDER.filter(
				(key) => key === 'ALL' || key === activeTab || counts[key] > 0,
			)
		: TAB_ORDER;

	const hrefFor = (key: TabKey) => {
		const params = new URLSearchParams();
		if (key !== 'ALL') params.set('status', key);
		if (searchQuery) params.set('q', searchQuery);
		const query = params.toString();
		return query ? `/quan-ly-tin?${query}` : '/quan-ly-tin';
	};

	return (
		// -mx-4/px-4 lets the scroll strip bleed to the viewport edge on mobile so
		// the fade lands on the real edge, not 16px inside it.
		<nav aria-label="Lọc theo trạng thái" className="relative -mx-4 sm:mx-0">
			<div className="scrollbar-hide edge-fade-x flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none]">
				{visibleTabs.map((key) => {
					const active = key === activeTab;
					const count = counts[key];

					return (
						<Link
							key={key}
							href={hrefFor(key)}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 font-heading text-sm font-semibold tracking-tight whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
								active
									? // Ink, not moss — same rule BottomNav follows.
										'border-transparent bg-fz-ink text-fz-paper'
									: 'border-border text-fz-muted hover:border-fz-ink hover:text-fz-ink',
								!active &&
									showCounts &&
									count === 0 &&
									'border-border/60 text-fz-muted/55',
							)}
						>
							{tabLabel(key)}
							{showCounts && (
								<span
									className={cn(
										'text-xs tabular-nums',
										active ? 'text-fz-paper/65' : 'text-fz-muted/70',
									)}
								>
									{count}
								</span>
							)}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
