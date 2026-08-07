import Link from 'next/link';
import { ArrowUpRight, Package } from 'lucide-react';
import { CategoryThumbnail } from '@/components/categories/category-thumbnail';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCount } from '@/lib/format';
import type { Category } from '@/types/category.types';

export function CategoryDirectory({ categories }: { categories: Category[] }) {
	return (
		<section className="mx-auto min-h-[calc(100dvh+3rem)] max-w-6xl px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-20">
			<header className="max-w-2xl border-b border-border pb-6 sm:pb-8">
				<div className="max-w-2xl">
					<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
						Chọn theo loại đồ
					</p>
					<div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<h1 className="font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
							Danh mục
						</h1>
						<p className="text-sm text-muted-foreground tabular-nums">
							{formatCount(categories.length)} danh mục
						</p>
					</div>
					<p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
						Đi một vòng qua các góc quen thuộc của đời sống sinh viên, rồi vào chợ từ nơi phù hợp nhất.
					</p>
				</div>
			</header>

			{categories.length > 0 ? (
				<section aria-label="Tất cả danh mục" className="mt-6 sm:mt-8">
					<ul className="divide-y divide-border border-b border-border lg:grid lg:grid-cols-2 lg:divide-y-0 lg:gap-x-10 lg:border-b-0">
						{categories.map((category, index) => (
							<li key={category.id} className="lg:border-b lg:border-border">
								<CategoryDirectoryRow category={category} priority={index < 2} />
							</li>
						))}
					</ul>
				</section>
			) : (
				<EmptyState
					className="mt-10 min-h-[calc(100dvh-21rem)] rounded-none border-x-0 bg-transparent sm:mt-12"
					icon={Package}
					title="Chợ chưa có danh mục nào"
					description="Danh mục sẽ xuất hiện ở đây khi chợ bắt đầu mở thêm góc mới."
				/>
			)}
		</section>
	);
}

function CategoryDirectoryRow({ category, priority }: { category: Category; priority: boolean }) {
	const childCount = category.children?.length ?? 0;
	const productCount = category.productCount ?? 0;
	const listingLabel =
		productCount > 0 ? ` · ${formatCount(productCount)} tin đang hiển thị` : '';

	return (
		<Link
			href={`/tim-kiem?categoryId=${category.id}`}
			className="group grid min-h-28 grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-5 sm:py-5"
		>
			<CategoryThumbnail src={category.image} alt={category.name} priority={priority} />

			<div className="min-w-0">
				<h3 className="font-heading text-lg leading-6 font-semibold tracking-tight text-fz-ink sm:text-xl">
					{category.name}
				</h3>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					{formatCount(childCount)} nhóm đồ{listingLabel}
				</p>
			</div>

			<span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-fz-muted transition-colors duration-200 ease-out group-hover:border-fz-ink group-hover:bg-fz-ink group-hover:text-white motion-reduce:transition-none">
				<ArrowUpRight
					aria-hidden
					className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
				/>
			</span>
		</Link>
	);
}
