'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	Check,
	Clock,
	ImageIcon,
	Loader2,
	Sparkles,
	TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { MembershipSkeleton } from './_components/membership-skeleton';
import { parseApiError } from '@/lib/api';
import {
	getMembershipPlans,
	getMyMembership,
	purchaseMembership,
} from '@/lib/membership';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { MembershipPlan, MyMembership } from '@/types/membership.types';

// The plan a seller lands on by default, never purchased — matches
// MembershipService's FREE_PLAN_KEY on the backend.
const FREE_PLAN_KEY = 'FREE';

// The tier called out as the default upgrade recommendation — a fixed key,
// not "whichever plan is in the middle", so the highlight survives the
// backend admin reordering or adding a plan later.
const RECOMMENDED_PLAN_KEY = 'BASIC';

function planFeatures(plan: MembershipPlan): string[] {
	return [
		`Tối đa ${plan.maxActiveListings} tin đang hoạt động cùng lúc`,
		`Mỗi tin hiển thị ${plan.listingDurationDays} ngày`,
		`Tối đa ${plan.maxImagesPerListing} ảnh mỗi tin`,
	];
}

export function MembershipClient() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [membership, setMembership] = useState<MyMembership | null>(null);
	const [plans, setPlans] = useState<MembershipPlan[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [purchasingKey, setPurchasingKey] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			const [myMembership, allPlans] = await Promise.all([
				getMyMembership(),
				getMembershipPlans(),
			]);
			setMembership(myMembership);
			setPlans(allPlans);
		} catch (err) {
			setLoadError(parseApiError(err).message ?? null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	// PayOS redirects back here with ?membership=success|cancelled. The
	// webhook that actually upgrades the account fires server-to-server and
	// has usually already landed by the time the browser returns, so a
	// single refetch is enough — no polling.
	useEffect(() => {
		const result = searchParams.get('membership');
		if (!result) return;

		if (result === 'success') {
			toast.success('Thanh toán thành công! Gói thành viên của bạn đã được cập nhật.');
			void fetchData();
		} else if (result === 'cancelled') {
			toast.info('Bạn đã huỷ giao dịch. Gói thành viên không thay đổi.');
		}

		router.replace('/goi-thanh-vien', { scroll: false });
	}, [searchParams, router, fetchData]);

	const handlePurchase = useCallback(async (plan: MembershipPlan) => {
		setPurchasingKey(plan.key);
		try {
			const { checkoutUrl } = await purchaseMembership(plan.key);
			window.location.href = checkoutUrl;
		} catch (err) {
			toast.error(
				parseApiError(err).message ?? 'Không thể tạo yêu cầu thanh toán, vui lòng thử lại.',
			);
			setPurchasingKey(null);
		}
	}, []);

	return (
		<div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
			<div>
				<p className="text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase">
					THÀNH VIÊN
				</p>
				<h1 className="mt-2 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
					Gói thành viên
				</h1>
				<p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
					Nâng cấp để đăng nhiều tin hơn, tin hiển thị lâu hơn và được thêm
					ảnh cho mỗi tin đăng.
				</p>
			</div>

			{isLoading ? (
				<div className="mt-8 sm:mt-10">
					<MembershipSkeleton />
				</div>
			) : loadError ? (
				<EmptyState
					className="mt-8 sm:mt-10"
					icon={TriangleAlert}
					title="Không tải được gói thành viên"
					description={loadError}
					action={
						<Button variant="outline" size="lg" className="h-11" onClick={() => void fetchData()}>
							Thử lại
						</Button>
					}
				/>
			) : (
				<>
					{membership && (
						<div className="fz-card mt-8 rounded-2xl border border-border bg-card p-5 sm:mt-10 sm:rounded-3xl sm:p-6">
							<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
								<div>
									<p className="text-xs font-semibold tracking-[0.1em] text-fz-muted uppercase">
										Gói hiện tại
									</p>
									<span className="mt-1 block font-heading text-xl font-bold text-fz-ink">
										{membership.plan.name}
									</span>
								</div>
								{membership.expiresAt && (
									<span className="text-sm text-muted-foreground">
										Hết hạn ngày{' '}
										{new Date(membership.expiresAt).toLocaleDateString('vi-VN')}
									</span>
								)}
							</div>

							{(() => {
								const { activeListingsCount, plan } = membership;
								const isAtCap = activeListingsCount >= plan.maxActiveListings;
								const remaining = Math.max(
									plan.maxActiveListings - activeListingsCount,
									0,
								);
								const usagePercent = Math.min(
									(activeListingsCount / plan.maxActiveListings) * 100,
									100,
								);

								return (
									<div className="mt-5 border-t border-border pt-5">
										<div className="flex items-baseline justify-between gap-2">
											<p className="text-sm font-medium text-fz-ink">
												Tin đang hoạt động
											</p>
											<p
												className={cn(
													'text-sm font-semibold tabular-nums',
													isAtCap ? 'text-fz-danger' : 'text-fz-ink',
												)}
											>
												{activeListingsCount}/{plan.maxActiveListings}
											</p>
										</div>
										<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
											<div
												className={cn(
													'h-full rounded-full transition-all duration-300',
													isAtCap ? 'bg-fz-danger' : 'bg-fz-ink',
												)}
												style={{ width: `${usagePercent}%` }}
											/>
										</div>
										<p className="mt-2 text-xs text-muted-foreground">
											{isAtCap
												? 'Đã đạt giới hạn — bán/huỷ bớt tin hoặc nâng cấp gói để đăng thêm.'
												: `Còn đăng được ${remaining} tin nữa.`}
										</p>
									</div>
								);
							})()}

							<div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-2">
								<div className="flex items-center gap-2 text-sm text-fz-ink">
									<Clock aria-hidden className="size-4 shrink-0 text-fz-muted" />
									Mỗi tin hiển thị {membership.plan.listingDurationDays} ngày
								</div>
								<div className="flex items-center gap-2 text-sm text-fz-ink">
									<ImageIcon aria-hidden className="size-4 shrink-0 text-fz-muted" />
									Tối đa {membership.plan.maxImagesPerListing} ảnh mỗi tin
								</div>
							</div>
						</div>
					)}

					<div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3">
						{plans.map((plan) => {
							const isCurrent = membership?.plan.key === plan.key;
							const isFree = plan.key === FREE_PLAN_KEY;
							const isRecommended = plan.key === RECOMMENDED_PLAN_KEY;
							const isPurchasing = purchasingKey === plan.key;

							return (
								<div
									key={plan.id}
									className={cn(
										'fz-card fz-card-hover relative flex flex-col gap-5 rounded-2xl border bg-card p-6 sm:rounded-3xl',
										isRecommended ? 'border-fz-accent' : 'border-border',
									)}
								>
									{isRecommended && (
										<span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-fz-accent px-3 py-1 text-[11px] font-semibold text-fz-paper">
											<Sparkles aria-hidden className="size-3" />
											Phổ biến nhất
										</span>
									)}

									<div>
										<p className="font-heading text-sm font-semibold tracking-tight text-fz-ink">
											{plan.name}
										</p>
										<p className="mt-2 font-heading text-2xl leading-none font-bold tabular-nums text-fz-accent">
											{isFree ? 'Miễn phí' : formatPrice(plan.price)}
										</p>
										{!isFree && (
											<p className="mt-1 text-xs text-muted-foreground">
												/ {plan.durationDays} ngày
											</p>
										)}
									</div>

									<ul className="flex flex-col gap-2.5">
										{planFeatures(plan).map((feature) => (
											<li key={feature} className="flex items-start gap-2 text-sm text-fz-ink">
												<Check
													aria-hidden
													className="mt-0.5 size-4 shrink-0 text-fz-accent"
												/>
												{feature}
											</li>
										))}
									</ul>

									<div className="mt-auto pt-1">
										{isCurrent ? (
											<span className="flex h-11 w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
												Gói hiện tại
											</span>
										) : isFree ? (
											<span className="flex h-11 w-full items-center justify-center text-sm text-muted-foreground">
												Gói mặc định
											</span>
										) : (
											<Button
												size="lg"
												className="h-11 w-full"
												disabled={purchasingKey !== null}
												onClick={() => void handlePurchase(plan)}
											>
												{isPurchasing ? (
													<Loader2 aria-hidden data-icon="inline-start" className="animate-spin" />
												) : null}
												Nâng cấp
											</Button>
										)}
									</div>
								</div>
							);
						})}
					</div>

					<p className="mt-8 text-center text-xs text-muted-foreground sm:mt-10">
						Thanh toán được xử lý an toàn qua PayOS. Gói thành viên có hiệu lực
						ngay khi thanh toán thành công.
					</p>
				</>
			)}
		</div>
	);
}
