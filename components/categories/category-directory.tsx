import Link from 'next/link';
import { ArrowUpRight, Package } from 'lucide-react';
import { CategoryThumbnail } from '@/components/categories/category-thumbnail';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCount } from '@/lib/format';
import type { Category } from '@/types/category.types';

export function CategoryDirectory({ categories }: { categories: Category[] }) {
	const availableCategories = categories.filter((category) => (category.productCount ?? 0) > 0);
	const waitingCategories = categories.filter((category) => (category.productCount ?? 0) === 0);
	const availableListingCount = availableCategories.reduce(
		(total, category) => total + (category.productCount ?? 0),
		0,
	);

	return (
		<section className="mx-auto min-h-[calc(100dvh+3rem)] max-w-6xl px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-20">
			<header className="border-b border-border pb-8 sm:pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end lg:gap-12">
				<div className="max-w-2xl">
					<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
						Bản đồ khu chợ
					</p>
					<h1 className="mt-3 max-w-xl font-heading text-4xl leading-[0.92] font-bold tracking-[-0.055em] text-fz-ink sm:text-5xl lg:text-6xl">
						Tìm đúng góc trước.
					</h1>
					<p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
						Chọn loại đồ bạn đang cần, rồi xem những món còn đang được để lại trong chợ.
					</p>
				</div>

				{availableCategories.length > 0 && (
					<p className="mt-6 border-l-2 border-fz-ink pl-4 text-sm leading-6 text-muted-foreground lg:mt-0">
						<span className="block font-heading text-2xl font-semibold tracking-tight text-fz-ink tabular-nums">
							{formatCount(availableListingCount)} tin đang chờ chủ mới
						</span>
						{formatCount(availableCategories.length)} góc đang có đồ để xem ngay
					</p>
				)}
			</header>

			{categories.length > 0 ? (
				<div className="mt-8 space-y-14 sm:mt-10 sm:space-y-18">
					{availableCategories.length > 0 && (
						<CategoryShelf
							id="available-categories"
							label="Đang có đồ"
							description="Những góc có tin đang hiển thị hôm nay."
							categories={availableCategories}
							listingCount={availableListingCount}
							variant="available"
						/>
					)}

					{waitingCategories.length > 0 && (
						<CategoryShelf
							id="other-categories"
							label={availableCategories.length > 0 ? 'Các góc khác' : 'Tất cả danh mục'}
							description={
								availableCategories.length > 0
									? 'Chưa có tin đang hiển thị, nhưng vẫn là một góc để bạn bắt đầu đăng hoặc tìm.'
									: 'Chọn một góc quen thuộc để bắt đầu duyệt chợ.'
							}
							categories={waitingCategories}
							variant="waiting"
						/>
					)}
				</div>
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

function CategoryShelf({
	id,
	label,
	description,
	categories,
	listingCount,
	variant,
}: {
	id: string;
	label: string;
	description: string;
	categories: Category[];
	listingCount?: number;
	variant: 'available' | 'waiting';
}) {
	const isAvailable = variant === 'available';

	return (
		<section aria-labelledby={id}>
			<div className="flex items-end justify-between gap-5 border-b border-border pb-4 sm:pb-5">
				<div>
					<h2 id={id} className="font-heading text-2xl font-semibold tracking-tight text-fz-ink sm:text-3xl">
						{label}
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
				</div>
				<p className="shrink-0 text-xs font-medium tracking-[0.12em] text-fz-muted uppercase tabular-nums">
					{isAvailable && listingCount !== undefined
						? `${formatCount(listingCount)} tin`
						: `${formatCount(categories.length)} danh mục`}
				</p>
			</div>

			<ul
				className={
					isAvailable
						? 'mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-9 lg:gap-x-5 lg:gap-y-10'
						: 'mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10'
				}
			>
				{categories.map((category, index) => (
					<li key={category.id}>
						<CategoryDirectoryTile category={category} priority={isAvailable && index < 3} />
					</li>
				))}
			</ul>
		</section>
	);
}

function CategoryDirectoryTile({ category, priority }: { category: Category; priority: boolean }) {
	const childCount = category.children?.length ?? 0;
	const productCount = category.productCount ?? 0;
	const metadata =
		productCount > 0
			? `${formatCount(productCount)} tin đang hiển thị · ${formatCount(childCount)} nhóm đồ`
			: `${formatCount(childCount)} nhóm đồ · Chưa có tin đang hiển thị`;

	return (
		<Link
			href={`/tim-kiem?categoryId=${category.id}`}
			className="group block focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			aria-describedby={`category-meta-${category.id}`}
		>
			<CategoryThumbnail src={category.image} alt={category.name} priority={priority} />

			<div className="pt-3 sm:pt-3.5">
				<h3 className="flex items-start gap-1 font-heading text-base leading-5 font-semibold tracking-tight text-fz-ink sm:text-lg">
					<span className="line-clamp-2">{category.name}</span>
					<ArrowUpRight
						aria-hidden
						className="mt-0.5 size-4 shrink-0 text-fz-muted transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
					/>
				</h3>
				<p id={`category-meta-${category.id}`} className="mt-1 text-xs leading-5 text-muted-foreground">
					{metadata}
				</p>
			</div>
		</Link>
	);
}
