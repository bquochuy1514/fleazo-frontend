import {
	Ban,
	CalendarX,
	CircleSlash,
	CircleX,
	Clock,
	Eye,
	FileText,
	History,
	PackageCheck,
	type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	PRODUCT_STATUS_LABELS,
	type ProductStatus,
} from '@/types/product.types';

// Same pill recipe as ListingCard's condition chip — one badge shape app-wide.
const BADGE =
	'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium';

// Only three tones for eight statuses, answering just "is this live / is this a
// problem / is this inert". The written label always states the status outright,
// so tone is reinforcement, never the sole signal.
//
// ACTIVE deliberately does NOT use fz-accent-soft/fz-accent: moss is reserved
// for price + save state, and that exact pair is already ListingCard's NEW /
// LIKE_NEW condition chip — reusing it here would collide semantically too.
const TONES = {
	live: 'border-transparent bg-fz-ink text-white',
	neutral: 'border-border bg-card text-muted-foreground',
	alert: 'border-transparent bg-destructive/10 text-destructive',
} as const;

const STATUS_VISUALS: Record<
	ProductStatus,
	{ tone: keyof typeof TONES; icon: LucideIcon }
> = {
	ACTIVE: { tone: 'live', icon: Eye },
	PENDING: { tone: 'neutral', icon: Clock },
	DRAFT: { tone: 'neutral', icon: FileText },
	SOLD: { tone: 'neutral', icon: PackageCheck },
	EXPIRED: { tone: 'neutral', icon: CalendarX },
	CANCELLED: { tone: 'neutral', icon: CircleSlash },
	REJECTED: { tone: 'alert', icon: CircleX },
	BANNED: { tone: 'alert', icon: Ban },
};

export function ListingStatusBadge({ status }: { status: ProductStatus }) {
	const { tone, icon: Icon } = STATUS_VISUALS[status];

	return (
		<span className={cn(BADGE, TONES[tone])}>
			<Icon aria-hidden className="size-3" />
			{PRODUCT_STATUS_LABELS[status]}
		</span>
	);
}

// Dashed border carries "provisional" without needing a colour of its own —
// which matters, since the palette has no spare slot for a fourth tone.
export function RevisionPendingBadge() {
	return (
		<span
			className={cn(
				BADGE,
				'border-dashed border-border text-muted-foreground',
			)}
		>
			<History aria-hidden className="size-3" />
			Đang chờ duyệt thay đổi
		</span>
	);
}
