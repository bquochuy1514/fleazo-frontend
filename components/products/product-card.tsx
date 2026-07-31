import Image from 'next/image';
import { ImageIcon, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
	PRODUCT_CONDITION_LABELS,
	type ProductCondition,
} from '@/types/product.types';

type ProductCardProps = {
	title: string;
	price: number | string;
	imageUrl?: string;
	condition: ProductCondition;
	locationLabel?: string;
	className?: string;
};

// Deliberately no rating (Fleazo reviews are seller-level only, not
// per-listing — see backend AGENTS.md → Reviews) and no save button yet (no
// auth wired up in this repo yet) — see AGENTS.md → Layout decisions.
export function ProductCard({
	title,
	price,
	imageUrl,
	condition,
	locationLabel,
	className,
}: ProductCardProps) {
	const isFresh = condition === 'NEW' || condition === 'LIKE_NEW';

	return (
		<div
			className={cn(
				'group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md',
				className,
			)}
		>
			<div className="relative aspect-square overflow-hidden bg-muted">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={title}
						fill
						sizes="(min-width: 1024px) 25vw, 50vw"
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground">
						<ImageIcon className="size-8" />
					</div>
				)}

				<span
					className={cn(
						'absolute top-2 left-2 rounded-full border px-2 py-0.5 text-[11px] font-medium',
						isFresh
							? 'border-transparent bg-fz-accent-soft text-fz-accent'
							: 'border-border bg-card text-muted-foreground',
					)}
				>
					{PRODUCT_CONDITION_LABELS[condition]}
				</span>

				<span className="absolute bottom-2 left-2 rounded-full bg-fz-accent px-2.5 py-1 text-xs font-bold tabular-nums text-white">
					{formatPrice(price)}
				</span>
			</div>

			<div className="space-y-1 p-3">
				<p className="line-clamp-2 min-h-10 text-sm font-medium text-fz-ink">
					{title}
				</p>
				{locationLabel && (
					<div className="flex items-start gap-1 text-xs text-muted-foreground">
						<MapPin className="mt-0.5 size-3 shrink-0" />
						<span className="truncate">{locationLabel}</span>
					</div>
				)}
			</div>
		</div>
	);
}
