import { cn } from '@/lib/utils';

export type ConversationTabKey = 'all' | 'unread';

// Local segmented filter, not a URL-driven Link (unlike listing-status-tabs.tsx) —
// filtering here interacts with already-selected-conversation state and mobile
// pane visibility, both local, so the filter has to be local too. Same visual
// language as that component and BottomNav: ink pill for the active tab, never moss.
export function ConversationTabs({
	active,
	onChange,
	allCount,
	unreadCount,
}: {
	active: ConversationTabKey;
	onChange: (key: ConversationTabKey) => void;
	allCount: number;
	unreadCount: number;
}) {
	const tabs: { key: ConversationTabKey; label: string; count: number }[] = [
		{ key: 'all', label: 'Tất cả', count: allCount },
		{ key: 'unread', label: 'Chưa đọc', count: unreadCount },
	];

	return (
		<div className="flex gap-1.5" role="tablist" aria-label="Lọc hội thoại">
			{tabs.map((tab) => {
				const isActive = tab.key === active;
				return (
					<button
						key={tab.key}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onChange(tab.key)}
						className={cn(
							'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium whitespace-nowrap transition-colors',
							isActive
								? 'border-transparent bg-fz-ink text-fz-paper'
								: 'border-border text-fz-muted hover:border-fz-ink hover:text-fz-ink',
						)}
					>
						{tab.label}
						<span
							className={cn(
								'text-xs tabular-nums',
								isActive ? 'text-fz-paper/65' : 'text-fz-muted/70',
							)}
						>
							{tab.count}
						</span>
					</button>
				);
			})}
		</div>
	);
}
