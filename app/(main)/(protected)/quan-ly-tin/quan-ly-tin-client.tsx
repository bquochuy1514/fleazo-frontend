'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	Inbox,
	PackagePlus,
	Plus,
	Search,
	SearchX,
	TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { ListingListSkeleton } from './_components/listing-row-skeleton';
import { ListingRow, type RowActionKey } from './_components/listing-row';
import {
	ListingStatusTabs,
	tabLabel,
	type TabKey,
} from './_components/listing-status-tabs';
import { parseApiError } from '@/lib/api';
import {
	getMyProducts,
	setEditProductCache,
	updateProductStatus,
} from '@/lib/products';
import {
	PRODUCT_STATUS_LABELS,
	type MyProduct,
	type ProductStatus,
} from '@/types/product.types';

// Seller listing counts are small, so one unfiltered fetch powers every tab
// count and both filters without a round trip per interaction.
const FETCH_LIMIT = 100;

// Empty panels fill the remaining first view after the page chrome. The page
// itself extends 3rem beyond the viewport so the footer appears on the first
// intentional scroll, rather than competing with an empty state on load.
const EMPTY_STATE_CLASS =
	'mt-6 min-h-[calc(100dvh-21rem)] justify-center rounded-none border-x-0 border-solid bg-transparent sm:mt-8 sm:rounded-none';

const REVISION_WARNING_KEY = 'fz:hide-revision-warning';

const STATUS_EMPTY_HINTS: Partial<Record<ProductStatus, string>> = {
	DRAFT: 'Tin nháp là tin bạn lưu lại để hoàn thiện và đăng sau.',
	PENDING: 'Tin bạn gửi duyệt sẽ nằm ở đây cho tới khi quản trị viên xử lý.',
	ACTIVE: 'Tin được duyệt sẽ hiển thị công khai và xuất hiện ở mục này.',
	REJECTED: 'Tin bị từ chối sẽ xuất hiện ở đây kèm lý do từ chối.',
};

const ALL_TAB_KEYS = Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[];

function parseTab(raw: string | null): TabKey {
	if (raw && (ALL_TAB_KEYS as string[]).includes(raw)) return raw as TabKey;
	return 'ALL';
}

// "may tinh" should find "Máy tính" — typing diacritics on a phone keyboard is
// enough friction to lose people on their own listings.
function normalize(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();
}

type PendingConfirm =
	| { kind: 'publish' | 'markSold' | 'cancel'; product: MyProduct }
	| { kind: 'editActive'; product: MyProduct };

export function QuanLyTinClient() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const activeTab = parseTab(searchParams.get('status'));
	const urlQuery = searchParams.get('q') ?? '';

	const [products, setProducts] = useState<MyProduct[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [pendingId, setPendingId] = useState<number | null>(null);
	const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<number | null>(
		null,
	);
	const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
	const [hideRevisionWarning, setHideRevisionWarning] = useState(false);
	const updateMotionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Local echo of ?q= so typing stays responsive while the URL lags behind.
	const [searchInput, setSearchInput] = useState(urlQuery);

	const fetchProducts = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			const res = await getMyProducts({ limit: FETCH_LIMIT });
			setProducts(res.data);
			setTotal(res.total);
		} catch (err) {
			setLoadError(parseApiError(err).message ?? null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		let cancelled = false;

		const loadInitialProducts = async () => {
			try {
				const res = await getMyProducts({ limit: FETCH_LIMIT });
				if (cancelled) return;
				setProducts(res.data);
				setTotal(res.total);
			} catch (err) {
				if (!cancelled) setLoadError(parseApiError(err).message ?? null);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void loadInitialProducts();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(
		() => () => {
			if (updateMotionTimer.current) clearTimeout(updateMotionTimer.current);
		},
		[],
	);

	// Debounced URL sync — the input is the source of truth while typing.
	useEffect(() => {
		if (searchInput === urlQuery) return;
		const timer = setTimeout(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (searchInput) params.set('q', searchInput);
			else params.delete('q');
			const query = params.toString();
			router.replace(query ? `/quan-ly-tin?${query}` : '/quan-ly-tin', {
				scroll: false,
			});
		}, 250);
		return () => clearTimeout(timer);
	}, [searchInput, urlQuery, searchParams, router]);

	const counts = useMemo(() => {
		const base = { ALL: products.length } as Record<TabKey, number>;
		for (const status of ALL_TAB_KEYS) base[status] = 0;
		for (const product of products) base[product.status] += 1;
		return base;
	}, [products]);

	const visibleProducts = useMemo(() => {
		const needle = normalize(searchInput);
		return products.filter((product) => {
			if (activeTab !== 'ALL' && product.status !== activeTab)
				return false;
			if (!needle) return true;
			return normalize(product.title).includes(needle);
		});
	}, [products, activeTab, searchInput]);

	const goToEdit = useCallback(
		(product: MyProduct) => {
			// Must be written before navigating: dang-tin reads it on mount and
			// bounces back here if it's missing.
			setEditProductCache(product);
			router.push(`/dang-tin?edit=${product.id}`);
		},
		[router],
	);

	const handleAction = useCallback(
		(action: RowActionKey, product: MyProduct) => {
			if (action === 'edit') {
				if (
					product.status === 'ACTIVE' &&
					localStorage.getItem(REVISION_WARNING_KEY) !== '1'
				) {
					setConfirm({ kind: 'editActive', product });
					return;
				}
				goToEdit(product);
				return;
			}

			// Server doesn't re-check the image count on DRAFT→PENDING, so this is
			// the only thing standing between a 0-image draft and the review queue.
			// Kept as a live button rather than a disabled one — a disabled button
			// on touch just looks broken.
			if (action === 'publish' && product.images.length === 0) {
				toast.error('Cần ít nhất 1 ảnh trước khi đăng tin.');
				goToEdit(product);
				return;
			}

			setConfirm({ kind: action, product });
		},
		[goToEdit],
	);

	const runTransition = useCallback(
		async (product: MyProduct, status: ProductStatus, message: string) => {
			setPendingId(product.id);
			try {
				await updateProductStatus(product.id, status);
				// Patch in place instead of refetching: counts recompute instantly
				// and the scroll position survives.
				setProducts((prev) =>
					prev.map((item) =>
						item.id === product.id ? { ...item, status } : item,
					),
				);
				// The toast confirms every transition. When the row remains in the
				// active filter, a quiet surface wash also confirms the exact record
				// that changed without animating the entire list.
				if (activeTab === 'ALL' || activeTab === status) {
					if (updateMotionTimer.current)
						clearTimeout(updateMotionTimer.current);
					setRecentlyUpdatedId(product.id);
					updateMotionTimer.current = setTimeout(() => {
						setRecentlyUpdatedId(null);
					}, 700);
				}
				toast.success(message);
				setConfirm(null);
			} catch (err) {
				toast.error(
					parseApiError(err).message ??
						'Đã có lỗi xảy ra, vui lòng thử lại.',
				);
				void fetchProducts();
			} finally {
				setPendingId(null);
			}
		},
		[activeTab, fetchProducts],
	);

	const confirmProps = confirmCopy(confirm);
	const sellerSummary = [
		total === 0 ? 'Chưa có tin nào' : `${total} tin đang quản lý`,
		counts.ACTIVE > 0 && `${counts.ACTIVE} đang hiển thị`,
		counts.PENDING > 0 && `${counts.PENDING} chờ duyệt`,
	]
		.filter((part): part is string => Boolean(part))
		.join(' · ');
	const listLabel =
		activeTab === 'ALL'
			? 'Tất cả tin'
			: tabLabel(activeTab);

	const handleConfirm = useCallback(() => {
		if (!confirm) return;
		const { kind, product } = confirm;

		if (kind === 'editActive') {
			if (hideRevisionWarning)
				localStorage.setItem(REVISION_WARNING_KEY, '1');
			setConfirm(null);
			goToEdit(product);
			return;
		}
		if (kind === 'publish')
			return void runTransition(
				product,
				'PENDING',
				'Đã gửi tin đi duyệt.',
			);
		if (kind === 'markSold')
			return void runTransition(
				product,
				'SOLD',
				'Đã đánh dấu tin là đã bán.',
			);
		return void runTransition(product, 'CANCELLED', 'Đã huỷ tin.');
	}, [confirm, hideRevisionWarning, goToEdit, runTransition]);

	return (
		<div className="mx-auto min-h-[calc(100dvh+3rem)] max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
			<div>
				<p className="text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase">
					KHO TIN CỦA BẠN
				</p>
				<h1 className="mt-2 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
					Quản lý tin
				</h1>
				<p className="mt-3 text-sm text-muted-foreground sm:text-base">
					{sellerSummary}
				</p>
			</div>

			<div className="mt-8 flex flex-col gap-4 border-b border-border pb-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full sm:max-w-xs">
					<Search
						aria-hidden
						className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="search"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Tìm trong tin của bạn"
						aria-label="Tìm trong tin của bạn"
						className="h-11 rounded-full pr-4 pl-10"
					/>
				</div>

				<ListingStatusTabs
					counts={counts}
					activeTab={activeTab}
					searchQuery={searchInput}
					showCounts={!isLoading && !loadError}
				/>
			</div>

			{!isLoading && !loadError && products.length > 0 && (
				<div className="mt-8 flex items-baseline justify-between sm:mt-10">
					<p className="font-heading text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase">
						{listLabel}
					</p>
					<p className="text-sm text-muted-foreground tabular-nums">
						{visibleProducts.length} tin
					</p>
				</div>
			)}

			{isLoading ? (
				<ListingListSkeleton />
			) : loadError ? (
				<EmptyState
					className={EMPTY_STATE_CLASS}
					icon={TriangleAlert}
					title="Không tải được danh sách tin"
					description={loadError}
					action={
						<Button
							variant="outline"
							size="lg"
							className="h-11"
							onClick={() => void fetchProducts()}
						>
							Thử lại
						</Button>
					}
				/>
			) : products.length === 0 ? (
				<EmptyState
					className={EMPTY_STATE_CLASS}
					icon={PackagePlus}
					title="Bạn chưa có tin đăng nào"
					description="Đăng tin đầu tiên và bắt đầu bán những món đồ bạn không dùng tới nữa."
					action={
						<Button asChild size="lg" className="h-11 px-5">
							<Link href="/dang-tin">
								<Plus aria-hidden data-icon="inline-start" />
								Đăng tin mới
							</Link>
						</Button>
					}
				/>
			) : visibleProducts.length === 0 ? (
				searchInput ? (
					<EmptyState
						className={EMPTY_STATE_CLASS}
						icon={SearchX}
						title="Không tìm thấy tin nào"
						description={
							activeTab === 'ALL'
								? `Không có tin nào khớp với "${searchInput}".`
								: `Không có tin nào khớp với "${searchInput}" trong mục "${tabLabel(activeTab)}".`
						}
						action={
							<Button
								variant="ghost"
								size="lg"
								className="h-11"
								onClick={() => setSearchInput('')}
							>
								Xoá tìm kiếm
							</Button>
						}
					/>
				) : (
					<EmptyState
						className={EMPTY_STATE_CLASS}
						icon={Inbox}
						title={`Chưa có tin nào ở mục "${tabLabel(activeTab)}"`}
						description={
							activeTab === 'ALL'
								? undefined
								: STATUS_EMPTY_HINTS[activeTab]
						}
					/>
				)
			) : (
				<>
					<ul className="mt-4 flex flex-col gap-3 sm:gap-0">
						{visibleProducts.map((product) => (
							<ListingRow
								key={product.id}
								product={product}
								onAction={handleAction}
								isPending={pendingId === product.id}
								isRecentlyUpdated={recentlyUpdatedId === product.id}
							/>
						))}
					</ul>
					{total > products.length && (
						<p className="mt-6 text-center text-xs text-muted-foreground">
							Đang hiển thị {products.length} tin gần nhất trong
							tổng số {total} tin.
						</p>
					)}
				</>
			)}

			{confirm && confirmProps && (
				<ConfirmDialog
					open
					onOpenChange={(open) => !open && setConfirm(null)}
					isLoading={pendingId === confirm.product.id}
					onConfirm={handleConfirm}
					{...confirmProps}
				>
					{confirm.kind === 'editActive' && (
						<label className="flex items-start gap-2 text-sm text-muted-foreground">
							<Checkbox
								checked={hideRevisionWarning}
								onCheckedChange={(checked) =>
									setHideRevisionWarning(checked === true)
								}
								className="mt-0.5"
							/>
							Không hiển thị lại thông báo này
						</label>
					)}
				</ConfirmDialog>
			)}
		</div>
	);
}

// Copy lives apart from the handler so each transition's wording stays readable
// as a block rather than buried in a switch.
function confirmCopy(confirm: PendingConfirm | null) {
	if (!confirm) return null;
	const { kind, product } = confirm;

	if (kind === 'editActive') {
		return {
			title: 'Thay đổi cần được duyệt lại',
			description: (
				<>
					Tin này đang hiển thị công khai. Nội dung bạn sửa sẽ được
					gửi tới quản trị viên để duyệt — trong lúc chờ, người mua
					vẫn thấy nội dung cũ. Tin không bị gỡ xuống.
					{product.revision && (
						<>
							{' '}
							Tin này đã có một thay đổi đang chờ duyệt: nội dung
							trong form là nội dung đang công khai, và thay đổi
							mới sẽ thay thế thay đổi đang chờ.
						</>
					)}
				</>
			),
			confirmLabel: 'Tiếp tục sửa',
			variant: 'default' as const,
		};
	}

	if (kind === 'publish') {
		return {
			title: 'Đăng tin này?',
			description:
				'Tin sẽ được gửi tới quản trị viên để duyệt. Trong lúc chờ, tin chưa hiển thị công khai và bạn vẫn có thể huỷ.',
			confirmLabel: 'Đăng tin',
			variant: 'default' as const,
		};
	}

	if (kind === 'markSold') {
		// Not destructive-styled: irreversible, but it's a happy outcome and the
		// rust tint would misframe it.
		return {
			title: 'Đánh dấu tin đã bán?',
			description:
				'Tin sẽ ngừng hiển thị công khai. Thao tác này không thể hoàn tác — nếu muốn bán tiếp món này, bạn sẽ phải đăng một tin mới.',
			confirmLabel: 'Đánh dấu đã bán',
			variant: 'default' as const,
		};
	}

	const cancelCopy: Record<string, { title: string; description: string }> = {
		DRAFT: {
			title: 'Huỷ tin nháp này?',
			description:
				'Tin nháp sẽ chuyển sang trạng thái "Đã huỷ". Thao tác này không thể hoàn tác — tin đã huỷ không thể đăng lại.',
		},
		PENDING: {
			title: 'Huỷ tin đang chờ duyệt?',
			description:
				'Tin sẽ bị rút khỏi hàng chờ duyệt. Thao tác này không thể hoàn tác — muốn đăng lại, bạn phải tạo một tin mới.',
		},
		ACTIVE: {
			title: 'Huỷ tin đang hiển thị?',
			// The last sentence is the most valuable copy on this page: without it
			// sellers cancel instead of marking sold and destroy the listing.
			description:
				'Tin sẽ bị gỡ khỏi trang công khai ngay lập tức. Thao tác này không thể hoàn tác — muốn bán tiếp, bạn phải đăng một tin mới. Nếu bạn đã bán được món này, hãy chọn "Đánh dấu đã bán" thay vì huỷ.',
		},
	};

	const copy = cancelCopy[product.status] ?? cancelCopy.DRAFT;
	return {
		title: copy.title,
		description: copy.description,
		confirmLabel: 'Huỷ tin',
		variant: 'destructive' as const,
	};
}
