import Image from 'next/image';
import { Check, Loader2, X } from 'lucide-react';
import { ListingThumbnail } from '@/components/listings/listing-thumbnail';
import { Button } from '@/components/ui/button';
import { firstImageUrl, locationLabel } from '@/lib/products';
import { formatPrice, timeAgo } from '@/lib/format';
import { PRODUCT_CONDITION_LABELS } from '@/types/product.types';
import type { PendingProduct } from '@/types/product.types';

export function PendingProductRow({
	product,
	isPending,
	onApprove,
	onReject,
}: {
	product: PendingProduct;
	isPending: boolean;
	onApprove: () => void;
	onReject: () => void;
}) {
	return (
		<li className="fz-card rounded-2xl border border-border bg-card p-4 sm:rounded-3xl sm:p-5">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
				<div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
					<ListingThumbnail src={firstImageUrl(product)} alt="" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
						<h2 className="line-clamp-2 font-heading text-base font-semibold text-fz-ink">
							{product.title}
						</h2>
						<span className="font-heading text-base font-bold tabular-nums text-fz-accent">
							{formatPrice(product.price)}
						</span>
					</div>

					<div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
						<span>{product.category.name}</span>
						<span aria-hidden>·</span>
						<span>{PRODUCT_CONDITION_LABELS[product.condition]}</span>
						<span aria-hidden>·</span>
						<span>{locationLabel(product)}</span>
						<span aria-hidden>·</span>
						<span>Gửi {timeAgo(product.createdAt)}</span>
					</div>

					<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
						{product.description}
					</p>

					<div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
						<Image
							src={product.seller.avatar}
							alt={product.seller.fullName}
							width={24}
							height={24}
							className="size-6 shrink-0 rounded-full object-cover"
						/>
						<span className="truncate text-xs text-fz-ink">
							{product.seller.fullName}
						</span>
						<span className="truncate text-xs text-muted-foreground">
							{product.seller.email}
						</span>
					</div>
				</div>

				<div className="flex shrink-0 flex-col gap-2 sm:w-40">
					<Button
						size="lg"
						className="h-10 w-full"
						disabled={isPending}
						onClick={onApprove}
					>
						{isPending ? (
							<Loader2 aria-hidden data-icon="inline-start" className="animate-spin" />
						) : (
							<Check aria-hidden data-icon="inline-start" />
						)}
						Duyệt
					</Button>
					<Button
						size="lg"
						variant="destructive"
						className="h-10 w-full"
						disabled={isPending}
						onClick={onReject}
					>
						<X aria-hidden data-icon="inline-start" />
						Từ chối
					</Button>
				</div>
			</div>
		</li>
	);
}
