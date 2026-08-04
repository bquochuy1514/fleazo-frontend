import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import type { Category } from '@/types/category.types';

const FEATURED_LIMIT = 4;

export function FeaturedCategories({ categories }: { categories: Category[] }) {
	const featuredCategories = categories.slice(0, FEATURED_LIMIT);
	if (featuredCategories.length === 0) return null;

	const [primary, ...rest] = featuredCategories;

	return (
		<section
			id="danh-muc"
			className="relative z-10 -mt-48 scroll-mt-20 rounded-t-4xl bg-fz-paper"
		>
			<div className="mx-auto max-w-6xl px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-20 lg:pt-24">
				<div className="max-w-2xl">
					<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
						Bắt đầu từ đây
					</p>
					<h2 className="mt-2 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
						Một vòng quanh chợ.
					</h2>
					<p className="mt-3 text-base leading-7 text-muted-foreground">
						Chọn một góc quen thuộc của đời sống sinh viên, rồi bắt
						đầu săn món đồ tiếp theo của bạn.
					</p>
				</div>

				{/* Auto-placement bento: primary fills a 2x2 block, the three
				    remaining tiles flow into the rest of that 2x2 footprint (two
				    1-cell tiles then one 2-cell tile) — same source order works
				    unchanged at both the 2-col (mobile) and 4-col (sm+) grid. */}
				<div className="mt-8 grid grid-cols-2 auto-rows-[150px] gap-3 sm:grid-cols-4 sm:auto-rows-[170px] sm:gap-4 lg:auto-rows-[200px] lg:gap-5">
					<ScrollReveal delay={0} className="col-span-2 row-span-2">
						<CategoryTile category={primary} large />
					</ScrollReveal>
					{rest.map((category, i) => (
						<ScrollReveal
							key={category.id}
							delay={(i + 1) * 90}
							className={i === rest.length - 1 ? 'col-span-2' : 'col-span-1'}
						>
							<CategoryTile category={category} />
						</ScrollReveal>
					))}
				</div>

				<ScrollReveal delay={(rest.length + 1) * 90}>
					<AllCategoriesTile total={categories.length} />
				</ScrollReveal>
			</div>
		</section>
	);
}

function CategoryTile({
	category,
	large = false,
}: {
	category: Category;
	large?: boolean;
}) {
	return (
		<Link
			href={`/tim-kiem?categoryId=${category.id}`}
			className="group relative block h-full overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:rounded-3xl"
		>
			{category.image ? (
				<Image
					src={category.image}
					alt={category.name}
					fill
					// Keep category art on the browser's direct Cloudinary path. The
					// optimizer can time out when several category images load together.
					unoptimized
					sizes="(min-width: 1024px) 45vw, (min-width: 640px) 55vw, 100vw"
					className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
				/>
			) : (
				<span className="absolute inset-0 flex items-center justify-center bg-fz-accent-soft text-fz-accent">
					<Package aria-hidden className={large ? 'size-14' : 'size-9'} />
				</span>
			)}

			{/* Scrim so the name reads on any photo, dark or light. */}
			<span
				aria-hidden
				className="absolute inset-0 bg-gradient-to-t from-fz-ink/85 via-fz-ink/15 to-transparent"
			/>

			<span
				className={cn(
					'absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4',
					large && 'p-5 sm:p-6',
				)}
			>
				<span className="flex items-end justify-between gap-2">
					<span
						className={cn(
							'font-heading font-semibold tracking-tight text-white',
							large ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base',
						)}
					>
						{category.name}
					</span>
					<ArrowUpRight
						aria-hidden
						className={cn(
							'shrink-0 text-white/80 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none',
							large ? 'size-5' : 'size-4',
						)}
					/>
				</span>
				{/* Only advertise a count once there's something to show — an
				    empty category reads better with no line than with "0". */}
				{!!category.productCount && (
					<span
						className={cn(
							'text-white/70',
							large ? 'text-sm' : 'text-xs',
						)}
					>
						{formatCount(category.productCount)} tin đang bán
					</span>
				)}
			</span>
		</Link>
	);
}

function AllCategoriesTile({ total }: { total: number }) {
	return (
		<Link
			href="/danh-muc"
			className="group mt-4 flex items-center justify-between rounded-2xl border border-border px-5 py-4 transition-colors hover:border-fz-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:rounded-3xl sm:px-6 sm:py-5"
		>
			<span className="font-heading text-base font-semibold tracking-tight text-fz-ink sm:text-lg">
				Xem tất cả {total} danh mục
			</span>
			<ArrowUpRight
				aria-hidden
				className="size-5 text-fz-ink transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
			/>
		</Link>
	);
}
