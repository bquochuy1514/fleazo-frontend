import Image from 'next/image';
import Link from 'next/link';
import { Check, ExternalLink, Loader2, X } from 'lucide-react';
import { ListingThumbnail } from '@/components/listings/listing-thumbnail';
import { Button } from '@/components/ui/button';
import { formatPrice, timeAgo } from '@/lib/format';
import { PRODUCT_CONDITION_LABELS } from '@/types/product.types';
import type { PendingRevision } from '@/types/product.types';

function revisionLocationLabel(revision: PendingRevision): string | undefined {
	if (revision.wardName && revision.provinceName) {
		return `${revision.wardName}, ${revision.provinceName}`;
	}
	return revision.provinceName || undefined;
}

export function PendingRevisionRow({
	revision,
	isPending,
	onApprove,
	onReject,
}: {
	revision: PendingRevision;
	isPending: boolean;
	onApprove: () => void;
	onReject: () => void;
}) {
	const coverUrl = [...revision.images].sort((a, b) => a.order - b.order)[0]
		?.url;

	return (
		<li className="fz-card rounded-2xl border border-border bg-card p-4 sm:rounded-3xl sm:p-5">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
				<div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
					<ListingThumbnail src={coverUrl} alt="" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-fz-muted uppercase">
							Đề xuất thay đổi
						</span>
						<Link
							href={`/san-pham/${revision.product.id}`}
							target="_blank"
							className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
						>
							Xem tin đang hiển thị
							<ExternalLink aria-hidden className="size-3" />
						</Link>
					</div>

					<div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
						<h2 className="line-clamp-2 font-heading text-base font-semibold text-fz-ink">
							{revision.title}
						</h2>
						<span className="font-heading text-base font-bold tabular-nums text-fz-accent">
							{formatPrice(revision.price)}
						</span>
					</div>

					<div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
						<span>{PRODUCT_CONDITION_LABELS[revision.condition]}</span>
						{revisionLocationLabel(revision) && (
							<>
								<span aria-hidden>·</span>
								<span>{revisionLocationLabel(revision)}</span>
							</>
						)}
						<span aria-hidden>·</span>
						<span>Gửi {timeAgo(revision.updatedAt)}</span>
					</div>

					<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
						{revision.description}
					</p>

					<div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
						<Image
							src={revision.product.seller.avatar}
							alt={revision.product.seller.fullName}
							width={24}
							height={24}
							className="size-6 shrink-0 rounded-full object-cover"
						/>
						<span className="truncate text-xs text-fz-ink">
							{revision.product.seller.fullName}
						</span>
						<span className="truncate text-xs text-muted-foreground">
							{revision.product.seller.email}
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
						Duyệt thay đổi
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
