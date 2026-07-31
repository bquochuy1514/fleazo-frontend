import Image from 'next/image';
import Link from 'next/link';
import {
	Search,
	Laptop,
	BookOpen,
	PencilRuler,
	Shirt,
	Sparkles,
	Sofa,
	Dumbbell,
	Bike,
	PawPrint,
	type LucideIcon,
} from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategories } from '@/lib/categories';
import { getProducts, firstImageUrl, locationLabel } from '@/lib/products';

const LATEST_COUNT = 8;

// axios isn't tracked by Next's fetch cache, so without this the page would
// statically render once at build time and never see new listings —
// revalidate periodically instead of on every request (ISR).
export const revalidate = 60;

// Keyed by the fixed seed slugs (fleazo-backend/prisma/seed-data/categories.ts).
const CATEGORY_ICONS: Record<string, LucideIcon> = {
	'dien-tu-cong-nghe': Laptop,
	'sach-tai-lieu': BookOpen,
	'do-dung-hoc-tap': PencilRuler,
	'thoi-trang': Shirt,
	'my-pham-cham-soc-ca-nhan': Sparkles,
	'nha-cua-doi-song': Sofa,
	'the-thao-so-thich': Dumbbell,
	'xe-co': Bike,
	'thu-cung-phu-kien': PawPrint,
};

// Home is deliberately the "lighter" composition — hero + a couple of
// curated sections. The full hero+sidebar-filter+grid+pagination layout
// from the reference belongs to /danh-muc and /tim-kiem (not built yet),
// not here — see AGENTS.md → Layout decisions.
export default async function Home() {
	const [categories, latest] = await Promise.all([
		getCategories(),
		getProducts({ limit: LATEST_COUNT }),
	]);

	return (
		<div>
			{/* Full-viewport hero — the fixed Header floats over it (rather
			    than sitting above it in flow), so the photo is visible
			    around and behind the header pill. */}
			<section className="relative flex min-h-dvh flex-col overflow-hidden">
				{/* Source must be 2000px+ wide: object-cover fills a
				    full-viewport box, so anything smaller gets upscaled and
				    reads blurry. Portrait viewports crop hard on the sides,
				    so the subject needs to sit mid-frame. */}
				<Image
					src="/hero-image.jpg"
					alt=""
					fill
					priority
					quality={90}
					// On portrait viewports object-cover scales the 3:2 photo
					// by HEIGHT, so it needs far more pixels than the "100vw"
					// a width-based sizes hint would request — without these
					// over-100vw values the browser picks a variant that ends
					// up upscaled ~3x and visibly blurry on phones.
					sizes="(max-width: 640px) 330vw, (max-width: 1024px) 200vw, 100vw"
					className="object-cover"
				/>
				{/* Scrim — weighted toward the bottom, where the white wordmark
				    sits over the photo's brightest areas. Lighter up top so
				    more of the photo reads around the header pill. */}
				<div className="absolute inset-0 bg-gradient-to-b from-fz-ink/30 via-fz-ink/55 to-fz-ink/75" />

				<div className="relative flex min-h-dvh flex-col justify-end pt-24 pb-14">
					<h1 className="mt-auto text-center font-heading text-[18vw] leading-[0.8] font-bold tracking-tight whitespace-nowrap text-white select-none">
						Fleazo
					</h1>
				</div>
			</section>

			{/* Bridge card — part of the body, pulled up so it straddles the
			    hero's bottom edge and clips the wordmark's feet. It lives
			    OUTSIDE the hero on purpose: the hero's overflow-hidden (needed
			    to crop the photo) would clip anything hanging past that edge. */}
			<div className="relative z-10 mx-auto -mt-14 w-full max-w-6xl px-4">
				<div className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
					<div>
						<h2 className="font-heading text-lg font-semibold text-fz-ink">
							Tìm đồ cũ quanh bạn
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Sách, laptop, xe đạp... sinh viên khoá trước để lại,
							giá sinh viên.
						</p>
					</div>
					<form
						action="/tim-kiem"
						className="mt-4 flex items-center gap-2 sm:mt-0 sm:w-96"
					>
						<div className="relative flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								name="q"
								type="search"
								placeholder="Bạn đang tìm gì?"
								aria-label="Tìm kiếm sản phẩm"
								autoComplete="off"
								className="h-11 rounded-full pr-4 pl-10"
							/>
						</div>
						<Button
							type="submit"
							size="lg"
							className="h-11 shrink-0"
						>
							Tìm kiếm
						</Button>
					</form>
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-4 pt-12 pb-4">
				{categories.length > 0 && (
					<section>
						<h2 className="font-heading text-lg font-semibold text-fz-ink">
							Danh mục
						</h2>
						<div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
							{categories.map((category) => {
								const Icon =
									CATEGORY_ICONS[category.slug] ?? Sparkles;
								return (
									<Link
										key={category.id}
										href={`/danh-muc/${category.slug}`}
										className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center transition hover:border-fz-accent/40 hover:bg-fz-accent-soft"
									>
										<Icon className="size-5 text-fz-accent" />
										<span className="line-clamp-2 text-xs font-medium text-fz-ink">
											{category.name}
										</span>
									</Link>
								);
							})}
						</div>
					</section>
				)}

				<section className="mt-10">
					<h2 className="font-heading text-lg font-semibold text-fz-ink">
						Tin mới đăng
					</h2>

					{latest.data.length === 0 ? (
						<p className="mt-4 text-sm text-muted-foreground">
							Chưa có tin đăng nào — hãy là người đầu tiên đăng
							tin!
						</p>
					) : (
						<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
							{latest.data.map((product) => (
								<Link
									key={product.id}
									href={`/san-pham/${product.id}`}
								>
									<ProductCard
										title={product.title}
										price={product.price}
										imageUrl={firstImageUrl(product)}
										condition={product.condition}
										locationLabel={locationLabel(product)}
									/>
								</Link>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
