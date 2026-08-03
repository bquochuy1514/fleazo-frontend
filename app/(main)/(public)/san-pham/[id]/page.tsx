import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, ShieldCheck } from 'lucide-react';
import { isAxiosError } from '@/lib/api';
import { getProduct, locationLabel } from '@/lib/products';
import { formatPrice, timeAgo } from '@/lib/format';
import { PRODUCT_CONDITION_LABELS } from '@/types/product.types';
import { ProductGallery } from '@/components/products/product-gallery';
import { SaveButton } from '@/components/products/save-button';
import { SellerCard } from '@/components/products/seller-card';
import { QuickMessage } from '@/components/products/quick-message';
import { SectionHeader } from '@/components/form/section-header';

type PageProps = { params: Promise<{ id: string }> };

// Dedupes the fetch between generateMetadata and the page body (axios isn't
// auto-memoized like the built-in `fetch`).
const getCachedProduct = cache(async (id: number) => {
	try {
		return await getProduct(id);
	} catch (err) {
		if (isAxiosError(err) && err.response?.status === 404) return null;
		throw err;
	}
});

function parseId(raw: string): number | null {
	const id = Number(raw);
	return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const id = parseId((await params).id);
	const product = id ? await getCachedProduct(id) : null;
	if (!product) return {};

	return {
		title: `${product.title} — Fleazo`,
		description: product.description.slice(0, 160),
	};
}

// pt-24: clears the fixed Header, same as (header-only)/layout.tsx.
export default async function ProductDetailPage({ params }: PageProps) {
	const id = parseId((await params).id);
	const product = id ? await getCachedProduct(id) : null;
	if (!product) notFound();

	const images = [...product.images].sort((a, b) => a.order - b.order);
	const location = locationLabel(product);

	const facts: [string, string][] = [
		['Tình trạng', PRODUCT_CONDITION_LABELS[product.condition]],
		['Danh mục', product.category.name],
		...(location
			? ([
					[
						'Khu vực',
						product.addressDetail
							? `${product.addressDetail}, ${location}`
							: location,
					],
				] as [string, string][])
			: []),
		['Đăng lúc', timeAgo(product.createdAt)],
	];

	return (
		<div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
			<nav
				aria-label="Breadcrumb"
				className="fz-rise flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
			>
				<Link href="/" className="hover:text-fz-ink">
					Trang chủ
				</Link>
				{product.category.parent && (
					<>
						<ChevronRight
							aria-hidden
							className="size-3.5 shrink-0"
						/>
						<Link
							href={`/tim-kiem?categoryId=${product.category.parent.id}`}
							className="hover:text-fz-ink"
						>
							{product.category.parent.name}
						</Link>
					</>
				)}
				<ChevronRight aria-hidden className="size-3.5 shrink-0" />
				<Link
					href={`/tim-kiem?categoryId=${product.categoryId}`}
					className="hover:text-fz-ink"
				>
					{product.category.name}
				</Link>
			</nav>

			<div className="mt-6 grid grid-cols-1 gap-8 [grid-template-areas:'gallery'_'info'_'details'] lg:grid-cols-3 lg:[grid-template-areas:'gallery_gallery_info'_'details_details_info']">
				<div
					style={{ animationDelay: '40ms' }}
					className="fz-rise relative [grid-area:gallery]"
				>
					<ProductGallery images={images} title={product.title} />
					<div className="absolute top-3 right-3 z-10">
						<SaveButton
							productId={product.id}
							initialSaved={product.isSaved}
							initialCount={product.saveCount}
						/>
					</div>
				</div>

				<div
					style={{ animationDelay: '60ms' }}
					className="fz-rise space-y-8 [grid-area:details]"
				>
					<section>
						<SectionHeader icon={FileText} title="Mô tả" />
						<p className="text-[15px] leading-relaxed whitespace-pre-wrap text-fz-ink">
							{product.description}
						</p>
					</section>

					<dl className="divide-y divide-border border-y border-border text-sm">
						{facts.map(([label, value]) => (
							<div
								key={label}
								className="flex items-baseline justify-between gap-4 py-2.5"
							>
								<dt className="shrink-0 text-muted-foreground">
									{label}
								</dt>
								{/* No `truncate` — Khu vực can run long, wraps instead. */}
								<dd className="text-right font-medium text-fz-ink">
									{value}
								</dd>
							</div>
						))}
					</dl>
				</div>

				<div
					style={{ animationDelay: '80ms' }}
					className="fz-rise space-y-4 [grid-area:info]"
				>
					<div>
						<h1 className="font-heading text-2xl font-bold text-fz-ink sm:text-3xl">
							{product.title}
						</h1>
						<p className="mt-2 text-3xl font-bold tabular-nums text-fz-accent">
							{formatPrice(product.price)}
						</p>
					</div>

					<SellerCard
						seller={product.seller}
						productId={product.id}
					/>

					<QuickMessage
						sellerId={product.seller.id}
						sellerName={product.seller.fullName}
						productId={product.id}
					/>

					<section className="rounded-2xl border border-fz-accent/30 bg-fz-accent-soft/40 p-4">
						<div className="flex items-start gap-2.5">
							{/* text-fz-ink: accent color is reserved for price/save state. */}
							<ShieldCheck
								aria-hidden
								className="mt-0.5 size-4.5 shrink-0 text-fz-ink"
							/>
							<p className="text-xs leading-relaxed text-fz-ink">
								Gặp trực tiếp để xem hàng, chỉ thanh toán khi đã
								nhận sản phẩm. Fleazo không giữ hộ tiền hay xử
								lý thanh toán qua nền tảng.
							</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
