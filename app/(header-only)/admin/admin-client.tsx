'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, History, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Textarea } from '@/components/ui/textarea';
import { PendingProductRow } from './_components/pending-product-row';
import { PendingRevisionRow } from './_components/pending-revision-row';
import { QueueSkeleton } from './_components/queue-skeleton';
import { parseApiError } from '@/lib/api';
import {
	adminApproveProduct,
	adminApproveRevision,
	adminRejectProduct,
	adminRejectRevision,
	getPendingProducts,
	getPendingRevisions,
} from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { PendingProduct, PendingRevision } from '@/types/product.types';

type Tab = 'products' | 'revisions';

// `id` here is always a Product id — for the revision case that's
// PendingRevision.product.id, since both revision endpoints key off it
// (see lib/admin.ts comment).
type PendingConfirm =
	| { kind: 'product'; id: number; title: string }
	| { kind: 'revision'; id: number; title: string };

// Fetches up to 50 of each queue on load — an admin moderation backlog this
// small doesn't need its own pagination UI yet; revisit if it grows.
const QUEUE_LIMIT = 50;

export function AdminClient() {
	const [tab, setTab] = useState<Tab>('products');
	const [products, setProducts] = useState<PendingProduct[]>([]);
	const [revisions, setRevisions] = useState<PendingRevision[]>([]);
	// Separate from .length — the fetched page caps at QUEUE_LIMIT, but the
	// tab badge should reflect the real backlog size.
	const [productsTotal, setProductsTotal] = useState(0);
	const [revisionsTotal, setRevisionsTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [actionId, setActionId] = useState<number | null>(null);
	const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
	const [reason, setReason] = useState('');

	const fetchQueues = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			const [productsRes, revisionsRes] = await Promise.all([
				getPendingProducts({ limit: QUEUE_LIMIT }),
				getPendingRevisions({ limit: QUEUE_LIMIT }),
			]);
			setProducts(productsRes.data);
			setRevisions(revisionsRes.data);
			setProductsTotal(productsRes.total);
			setRevisionsTotal(revisionsRes.total);
		} catch (err) {
			setLoadError(parseApiError(err).message ?? null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchQueues();
	}, [fetchQueues]);

	const handleApproveProduct = async (product: PendingProduct) => {
		setActionId(product.id);
		try {
			await adminApproveProduct(product.id);
			setProducts((prev) => prev.filter((p) => p.id !== product.id));
			setProductsTotal((prev) => prev - 1);
			toast.success(`Đã duyệt "${product.title}".`);
		} catch (err) {
			toast.error(
				parseApiError(err).message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
			);
		} finally {
			setActionId(null);
		}
	};

	const handleApproveRevision = async (revision: PendingRevision) => {
		setActionId(revision.product.id);
		try {
			await adminApproveRevision(revision.product.id);
			setRevisions((prev) => prev.filter((r) => r.id !== revision.id));
			setRevisionsTotal((prev) => prev - 1);
			toast.success(`Đã duyệt thay đổi cho "${revision.title}".`);
		} catch (err) {
			toast.error(
				parseApiError(err).message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
			);
		} finally {
			setActionId(null);
		}
	};

	const openReject = (next: PendingConfirm) => {
		setReason('');
		setConfirm(next);
	};

	const handleConfirmReject = async () => {
		if (!confirm) return;
		if (!reason.trim()) {
			toast.error('Vui lòng nhập lý do từ chối.');
			return;
		}

		setActionId(confirm.id);
		try {
			if (confirm.kind === 'product') {
				await adminRejectProduct(confirm.id, reason.trim());
				setProducts((prev) => prev.filter((p) => p.id !== confirm.id));
				setProductsTotal((prev) => prev - 1);
			} else {
				await adminRejectRevision(confirm.id, reason.trim());
				setRevisions((prev) =>
					prev.filter((r) => r.product.id !== confirm.id),
				);
				setRevisionsTotal((prev) => prev - 1);
			}
			toast.success(`Đã từ chối "${confirm.title}".`);
			setConfirm(null);
		} catch (err) {
			toast.error(
				parseApiError(err).message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
			);
		} finally {
			setActionId(null);
		}
	};

	const tabs = [
		{
			key: 'products' as const,
			label: 'Tin chờ duyệt',
			count: productsTotal,
			icon: ClipboardCheck,
		},
		{
			key: 'revisions' as const,
			label: 'Thay đổi chờ duyệt',
			count: revisionsTotal,
			icon: History,
		},
	];

	return (
		<div className="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10">
			<div>
				<p className="text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase">
					QUẢN TRỊ
				</p>
				<h1 className="mt-2 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
					Hàng chờ duyệt
				</h1>
			</div>

			<div className="mt-8 flex gap-2 border-b border-border sm:mt-10">
				{tabs.map(({ key, label, count, icon: Icon }) => (
					<button
						key={key}
						type="button"
						onClick={() => setTab(key)}
						className={cn(
							'inline-flex min-h-11 items-center gap-1.5 border-b-2 px-3.5 font-heading text-sm font-semibold tracking-tight transition-colors',
							tab === key
								? 'border-fz-ink text-fz-ink'
								: 'border-transparent text-fz-muted hover:text-fz-ink',
						)}
					>
						<Icon aria-hidden className="size-4" />
						{label}
						{!isLoading && (
							<span className="text-xs tabular-nums text-fz-muted">
								{count}
							</span>
						)}
					</button>
				))}
			</div>

			<div className="mt-6">
				{isLoading ? (
					<QueueSkeleton />
				) : loadError ? (
					<EmptyState
						icon={TriangleAlert}
						title="Không tải được hàng chờ"
						description={loadError}
						action={
							<Button
								variant="outline"
								size="lg"
								className="h-11"
								onClick={() => void fetchQueues()}
							>
								Thử lại
							</Button>
						}
					/>
				) : tab === 'products' ? (
					products.length === 0 ? (
						<EmptyState
							icon={ClipboardCheck}
							title="Không có tin nào đang chờ duyệt"
							description="Hàng chờ trống — mọi tin đăng đã được xử lý."
						/>
					) : (
						<ul className="flex flex-col gap-3 sm:gap-4">
							{products.map((product) => (
								<PendingProductRow
									key={product.id}
									product={product}
									isPending={actionId === product.id}
									onApprove={() => void handleApproveProduct(product)}
									onReject={() =>
										openReject({
											kind: 'product',
											id: product.id,
											title: product.title,
										})
									}
								/>
							))}
						</ul>
					)
				) : revisions.length === 0 ? (
					<EmptyState
						icon={History}
						title="Không có thay đổi nào đang chờ duyệt"
						description="Hàng chờ trống — mọi thay đổi đã được xử lý."
					/>
				) : (
					<ul className="flex flex-col gap-3 sm:gap-4">
						{revisions.map((revision) => (
							<PendingRevisionRow
								key={revision.id}
								revision={revision}
								isPending={actionId === revision.product.id}
								onApprove={() => void handleApproveRevision(revision)}
								onReject={() =>
									openReject({
										kind: 'revision',
										id: revision.product.id,
										title: revision.title,
									})
								}
							/>
						))}
					</ul>
				)}
			</div>

			{confirm && (
				<ConfirmDialog
					open
					onOpenChange={(open) => !open && setConfirm(null)}
					isLoading={actionId === confirm.id}
					variant="destructive"
					title={`Từ chối "${confirm.title}"?`}
					description="Người bán sẽ thấy lý do này — hãy giải thích rõ để họ biết cần sửa gì."
					confirmLabel="Từ chối"
					onConfirm={() => void handleConfirmReject()}
				>
					<Textarea
						autoFocus
						rows={3}
						placeholder="Lý do từ chối..."
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
				</ConfirmDialog>
			)}
		</div>
	);
}
