'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	CheckCircle2,
	ExternalLink,
	ImageOff,
	Loader2,
	MoreVertical,
	Pencil,
	Send,
	TriangleAlert,
	type LucideIcon,
} from 'lucide-react';
import { ListingThumbnail } from '@/components/listings/listing-thumbnail';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	ListingStatusBadge,
	RevisionPendingBadge,
} from './listing-status-badge';
import { firstImageUrl } from '@/lib/products';
import {
	daysUntilExpiry,
	formatCount,
	formatDateTime,
	formatPrice,
	timeAgo,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type { MyProduct, ProductStatus } from '@/types/product.types';

// An ACTIVE listing this close to Product.expiresAt gets flagged in rust —
// gives the seller a window to renew (re-submit) before the nightly cron
// silently flips it to EXPIRED.
const EXPIRY_WARNING_DAYS = 3;

export type RowActionKey = 'publish' | 'edit' | 'markSold' | 'cancel';

type RowAction = {
	key: RowActionKey;
	label: string;
	icon: LucideIcon;
	kind: 'primary' | 'secondary' | 'overflow';
	destructive?: boolean;
};

// Derived from SELLER_STATUS_TRANSITIONS — the five statuses missing here are
// dead ends the seller can't act on at all.
const ACTIONS_BY_STATUS: Partial<Record<ProductStatus, RowAction[]>> = {
	DRAFT: [
		{ key: 'publish', label: 'Đăng tin', icon: Send, kind: 'primary' },
		{ key: 'edit', label: 'Sửa', icon: Pencil, kind: 'secondary' },
		{
			key: 'cancel',
			label: 'Huỷ tin',
			icon: TriangleAlert,
			kind: 'overflow',
			destructive: true,
		},
	],
	PENDING: [
		{ key: 'edit', label: 'Sửa tin', icon: Pencil, kind: 'primary' },
		{
			key: 'cancel',
			label: 'Huỷ tin',
			icon: TriangleAlert,
			kind: 'secondary',
			destructive: true,
		},
	],
	ACTIVE: [
		{ key: 'edit', label: 'Sửa tin', icon: Pencil, kind: 'primary' },
		{
			key: 'markSold',
			label: 'Đánh dấu đã bán',
			icon: CheckCircle2,
			kind: 'secondary',
		},
		{
			key: 'cancel',
			label: 'Huỷ tin',
			icon: TriangleAlert,
			kind: 'overflow',
			destructive: true,
		},
	],
};

// Only where "why is this here and what now" isn't answered by the badge alone.
// SOLD and CANCELLED get nothing — a sentence on every archived row is clutter.
const DEAD_END_NOTES: Partial<Record<ProductStatus, string>> = {
	REJECTED:
		'Tin bị từ chối không thể gửi duyệt lại. Bạn có thể đăng một tin mới sau khi chỉnh sửa nội dung.',
	EXPIRED: 'Tin đã hết hạn hiển thị.',
	BANNED: 'Tin bị khoá do vi phạm quy định.',
};

// Save counts are noise on a draft (always 0) and salt in the wound on a
// cancelled listing.
const SHOWS_SAVE_COUNT: ProductStatus[] = ['ACTIVE', 'SOLD'];

// Match the account menu's compact desktop dropdown treatment: the menu is
// mouse-friendly, but items still have an obvious hover/focus state.
const OVERFLOW_ITEM =
	'cursor-pointer gap-2.5 rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-muted data-[highlighted]:bg-muted focus:bg-muted';
const OVERFLOW_ITEM_DANGER = cn(
	OVERFLOW_ITEM,
	'hover:bg-destructive/10 data-[highlighted]:bg-destructive/10 focus:bg-destructive/10',
);

// One "Label: value" line — explicit labels instead of a "·"-joined string
// that silently swapped which fact it showed depending on status.
function Fact({
	label,
	value,
	valueClassName,
}: {
	label: string;
	value: React.ReactNode;
	valueClassName?: string;
}) {
	return (
		<p className="flex items-baseline gap-1 text-xs leading-5 text-muted-foreground">
			<span className="shrink-0 text-fz-ink/70">{label}:</span>
			<span className={cn('min-w-0 truncate tabular-nums', valueClassName)}>
				{value}
			</span>
		</p>
	);
}

export function ListingRow({
	product,
	onAction,
	isPending,
	isRecentlyUpdated = false,
}: {
	product: MyProduct;
	onAction: (action: RowActionKey, product: MyProduct) => void;
	isPending: boolean;
	isRecentlyUpdated?: boolean;
}) {
	const [reasonExpanded, setReasonExpanded] = useState(false);

	const imageUrl = firstImageUrl(product);
	const actions = ACTIONS_BY_STATUS[product.status] ?? [];
	const deadEndNote = DEAD_END_NOTES[product.status];
	const isDraftWithoutImages =
		product.status === 'DRAFT' && product.images.length === 0;
	const isExpiringSoon =
		product.status === 'ACTIVE' &&
		!!product.expiresAt &&
		daysUntilExpiry(product.expiresAt) <= EXPIRY_WARNING_DAYS;

	// Reaching into a dropdown for a single item is needless friction, so
	// overflow items get promoted to buttons when the row only has two actions.
	const useOverflow = actions.length > 2;
	const inlineActions = useOverflow
		? actions.filter((a) => a.kind !== 'overflow')
		: actions;
	const overflowActions = useOverflow
		? actions.filter((a) => a.kind === 'overflow')
		: [];

	return (
		<li
			className={cn(
				'fz-card fz-card-hover rounded-2xl border border-border bg-card p-3 transition-colors duration-200 hover:border-fz-ink/20 sm:rounded-3xl sm:p-4',
				isRecentlyUpdated && 'fz-ledger-update',
			)}
		>
			<div
				className={cn(
					'flex gap-3 sm:grid sm:items-center sm:gap-6',
					actions.length > 0
						? 'sm:grid-cols-[6rem_minmax(0,1fr)_10rem_10rem]'
						: 'sm:grid-cols-[6rem_minmax(0,1fr)_10rem]',
				)}
			>
				<div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border sm:size-24 sm:rounded-xl">
					<ListingThumbnail key={imageUrl} src={imageUrl} alt="" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-1.5">
						<ListingStatusBadge status={product.status} />
						{product.revision && <RevisionPendingBadge />}
					</div>

					{/* line-clamp, not truncate: Vietnamese titles carry the
					    distinguishing detail at the end ("... còn mới 95%"). */}
					<h2 className="mt-1.5 line-clamp-2 font-heading text-sm leading-snug font-semibold text-fz-ink sm:text-base">
						{product.status === 'ACTIVE' ? (
							<Link
								href={`/san-pham/${product.id}`}
								className="underline-offset-2 hover:underline"
							>
								{product.title}
							</Link>
						) : (
							// Any other status 404s on the public detail route.
							product.title
						)}
					</h2>

					<p className="mt-1 font-heading text-base leading-none font-bold tabular-nums text-fz-accent sm:hidden">
						{formatPrice(product.price)}
					</p>

					<div className="mt-2 space-y-0.5">
						<Fact label="Danh mục" value={product.category.name} />
						<Fact label="Đăng lúc" value={timeAgo(product.createdAt)} />
						{product.status === 'ACTIVE' && product.expiresAt && (
							<Fact
								label="Hết hạn"
								value={formatDateTime(product.expiresAt)}
								valueClassName={
									isExpiringSoon ? 'font-semibold text-fz-danger' : undefined
								}
							/>
						)}
						{SHOWS_SAVE_COUNT.includes(product.status) && (
							<Fact
								label="Số lượt lưu"
								value={formatCount(product.saveCount)}
							/>
						)}
					</div>

					{product.revision && (
						<p className="mt-2 text-xs leading-5 text-muted-foreground">
							Người mua vẫn đang thấy nội dung cũ cho tới khi thay đổi
							được duyệt.
						</p>
					)}

					{product.status === 'REJECTED' &&
						(product.rejectedReason ? (
							<button
								type="button"
								onClick={() => setReasonExpanded((v) => !v)}
								aria-expanded={reasonExpanded}
								className="mt-2 flex w-full items-start gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-left text-xs leading-5 text-destructive"
							>
								<TriangleAlert
									aria-hidden
									className="mt-0.5 size-3.5 shrink-0"
								/>
								<span className={cn(!reasonExpanded && 'line-clamp-2')}>
									<span className="font-medium">Lý do từ chối: </span>
									{product.rejectedReason}
								</span>
							</button>
						) : (
							// No reason recorded — stay neutral rather than showing an
							// empty danger strip.
							<p className="mt-2 text-xs leading-5 text-muted-foreground">
								Tin bị từ chối. Quản trị viên chưa để lại lý do cụ thể.
							</p>
						))}

					{isDraftWithoutImages && (
						<p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
							<ImageOff aria-hidden className="mt-0.5 size-3.5 shrink-0" />
							Tin nháp chưa có ảnh. Thêm ít nhất 1 ảnh trước khi đăng.
						</p>
					)}

					{deadEndNote && (
						<p className="mt-2 text-xs leading-5 text-muted-foreground">
							{deadEndNote}
						</p>
					)}
				</div>

				<div className="hidden min-w-0 text-right sm:block">
					<p className="font-heading text-lg leading-none font-bold tabular-nums text-fz-accent">
						{formatPrice(product.price)}
					</p>
				</div>

				{actions.length > 0 && (
					<div className="hidden shrink-0 flex-col items-stretch gap-2 sm:flex">
						<RowActions
							actions={inlineActions}
							overflowActions={overflowActions}
							product={product}
							onAction={onAction}
							isPending={isPending}
						/>
					</div>
				)}
			</div>

			{actions.length > 0 && (
				<div className="mt-3 flex items-center gap-2 border-t border-border pt-3 sm:hidden">
					<RowActions
						actions={inlineActions}
						overflowActions={overflowActions}
						product={product}
						onAction={onAction}
						isPending={isPending}
						fullWidth
					/>
				</div>
			)}
		</li>
	);
}

function RowActions({
	actions,
	overflowActions,
	product,
	onAction,
	isPending,
	fullWidth = false,
}: {
	actions: RowAction[];
	overflowActions: RowAction[];
	product: MyProduct;
	onAction: (action: RowActionKey, product: MyProduct) => void;
	isPending: boolean;
	fullWidth?: boolean;
}) {
	return (
		<>
			{actions.map((action) => {
				const Icon = action.icon;
				return (
					<Button
						key={action.key}
						size="lg"
						variant={
							action.kind === 'primary'
								? 'default'
								: action.destructive
									? 'destructive'
									: 'outline'
						}
						disabled={isPending}
						onClick={() => onAction(action.key, product)}
						className={cn(
							fullWidth ? 'h-11 flex-1' : 'justify-center text-center',
						)}
					>
						{isPending ? (
							<Loader2
								aria-hidden
								data-icon="inline-start"
								className="animate-spin"
							/>
						) : (
							<Icon aria-hidden data-icon="inline-start" />
						)}
						{action.label}
					</Button>
				);
			})}

			{overflowActions.length > 0 && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size={fullWidth ? 'icon' : 'lg'}
							disabled={isPending}
							aria-label="Thêm hành động"
							className={cn(
								fullWidth ? 'size-11 shrink-0' : 'justify-center text-center',
							)}
						>
							<MoreVertical aria-hidden />
							{!fullWidth && 'Thêm'}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{product.status === 'ACTIVE' && (
							<DropdownMenuItem asChild className={OVERFLOW_ITEM}>
								<Link href={`/san-pham/${product.id}`}>
									<ExternalLink aria-hidden />
									Xem tin đăng
								</Link>
							</DropdownMenuItem>
						)}
						{overflowActions.map((action) => {
							const Icon = action.icon;
							return (
								<DropdownMenuItem
									key={action.key}
									variant={action.destructive ? 'destructive' : 'default'}
									onSelect={() => onAction(action.key, product)}
									className={
										action.destructive
											? OVERFLOW_ITEM_DANGER
											: OVERFLOW_ITEM
									}
								>
									<Icon aria-hidden />
									{action.label}
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</>
	);
}
