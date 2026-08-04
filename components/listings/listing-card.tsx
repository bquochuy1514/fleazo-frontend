import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, MapPin, Tag } from 'lucide-react';
import { SaveButton } from '@/components/listings/save-button';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
	PRODUCT_CONDITION_LABELS,
	type ProductCondition,
} from '@/types/product.types';

export type ProductMatchBadge =
	| 'own'
	| 'university'
	| 'province'
	| 'seller'
	| 'category'
	| 'parentCategory';

const MATCH_BADGE_LABELS: Record<ProductMatchBadge, string> = {
	own: 'Tin của bạn',
	university: 'Cùng trường',
	province: 'Cùng khu vực',
	seller: 'Cùng người bán',
	category: 'Cùng danh mục',
	parentCategory: 'Cùng nhóm danh mục',
};

type ListingCardProps = {
	title: string;
	price: number | string;
	imageUrl?: string;
	// Optional: live preview renders before a condition is picked.
	condition?: ProductCondition;
	categoryLabel?: string;
	locationLabel?: string;
	className?: string;
	// Only present for a real listing — the dang-tin live preview has no id
	// yet, so Link/SaveButton stay off until one exists.
	id?: number;
	saveCount?: number;
	// Why this card is showing up in a personalized feed — undefined for a
	// plain newest-first listing (no badge).
	matchBadge?: ProductMatchBadge;
};

// No per-product rating (reviews are seller-level, not per-listing).
export function ListingCard({
	title,
	price,
	imageUrl,
	condition,
	categoryLabel,
	locationLabel,
	className,
	id,
	saveCount,
	matchBadge,
}: ListingCardProps) {
	const isFresh = condition === 'NEW' || condition === 'LIKE_NEW';
	// next/image can't optimize local blob: URLs (pre-upload preview) — fall back to plain <img>.
	const isBlobPreview = imageUrl?.startsWith('blob:');

	const media = (
		<div className="relative aspect-square overflow-hidden bg-muted">
			{imageUrl ? (
				isBlobPreview ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={imageUrl}
						alt={title}
						className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<Image
						src={imageUrl}
						alt={title}
						fill
						sizes="(min-width: 1024px) 25vw, 50vw"
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				)
			) : (
				<div className="flex size-full items-center justify-center text-muted-foreground">
					<ImageIcon className="size-8" />
				</div>
			)}

			<div className="absolute top-2 left-2 flex flex-col items-start gap-1">
				{matchBadge && (
					<span
						className={cn(
							'rounded-full border px-2 py-0.5 text-[11px] font-medium',
							matchBadge === 'own'
								? 'border-transparent bg-fz-ink text-white'
								: matchBadge === 'university'
									? 'border-transparent bg-fz-accent text-white'
									: 'border-border bg-card text-muted-foreground',
						)}
					>
						{MATCH_BADGE_LABELS[matchBadge]}
					</span>
				)}
				{condition && (
					<span
						className={cn(
							'rounded-full border px-2 py-0.5 text-[11px] font-medium',
							isFresh
								? 'border-transparent bg-fz-accent-soft text-fz-accent'
								: 'border-border bg-card text-muted-foreground',
						)}
					>
						{PRODUCT_CONDITION_LABELS[condition]}
					</span>
				)}
			</div>
		</div>
	);

	const info = (
		<div className="space-y-1.5 p-3.5">
			<p className="font-heading text-lg leading-none font-bold tracking-tight text-fz-accent tabular-nums">
				{formatPrice(price)}
			</p>
			<p className="line-clamp-2 min-h-10 font-heading text-sm font-semibold text-fz-ink">
				{title}
			</p>
			{(categoryLabel || locationLabel) && (
				<div className="space-y-1 text-xs text-muted-foreground">
					{categoryLabel && (
						<div className="flex items-center gap-1">
							<Tag className="size-3 shrink-0" />
							<span className="truncate">{categoryLabel}</span>
						</div>
					)}
					{locationLabel && (
						// No truncate — the full ward + province should stay
						// readable rather than getting clipped with an ellipsis.
						<div className="flex items-start gap-1">
							<MapPin className="mt-0.5 size-3 shrink-0" />
							<span className="line-clamp-2 min-h-8">{locationLabel}</span>
						</div>
					)}
				</div>
			)}
		</div>
	);

	return (
		<div
			className={cn(
				'group h-full overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md sm:rounded-3xl',
				className,
			)}
		>
			<div className="relative">
				{id !== undefined ? (
					<Link href={`/san-pham/${id}`} className="block">
						{media}
					</Link>
				) : (
					media
				)}
				{id !== undefined && (
					<SaveButton
						productId={id}
						initialSaved={false}
						initialCount={saveCount ?? 0}
						className="absolute top-2 right-2 size-9"
					/>
				)}
			</div>

			{id !== undefined ? (
				<Link href={`/san-pham/${id}`}>{info}</Link>
			) : (
				info
			)}
		</div>
	);
}
