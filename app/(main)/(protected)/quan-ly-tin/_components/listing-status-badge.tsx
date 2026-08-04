import { History } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	PRODUCT_STATUS_LABELS,
	type ProductStatus,
} from '@/types/product.types';

const MARKER =
	'inline-flex items-center gap-1.5 font-heading text-[11px] font-semibold tracking-[0.08em] uppercase';

// Written labels remain the source of truth; the dot only gives the ledger a
// quick visual rhythm without reintroducing a second family of status pills.
const TONES = {
	live: { dot: 'bg-fz-ink', text: 'text-fz-ink' },
	neutral: { dot: 'bg-fz-muted', text: 'text-muted-foreground' },
	alert: { dot: 'bg-destructive', text: 'text-destructive' },
} as const;

const STATUS_TONES: Record<ProductStatus, keyof typeof TONES> = {
	ACTIVE: 'live',
	PENDING: 'neutral',
	DRAFT: 'neutral',
	SOLD: 'neutral',
	EXPIRED: 'neutral',
	CANCELLED: 'neutral',
	REJECTED: 'alert',
	BANNED: 'alert',
};

export function ListingStatusBadge({ status }: { status: ProductStatus }) {
	const tone = TONES[STATUS_TONES[status]];

	return (
		<span className={cn(MARKER, tone.text)}>
			<span aria-hidden className={cn('size-1.5 rounded-full', tone.dot)} />
			{PRODUCT_STATUS_LABELS[status]}
		</span>
	);
}

export function RevisionPendingBadge() {
	return (
		<span className="inline-flex items-center gap-1.5 border-l border-dashed border-border pl-2 text-[11px] font-medium text-muted-foreground">
			<History aria-hidden className="size-3" />
			Đang chờ duyệt thay đổi
		</span>
	);
}
