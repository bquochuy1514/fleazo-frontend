import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowDown,
	GraduationCap,
	Handshake,
	MessageCircle,
} from 'lucide-react';
import { getCategories } from '@/lib/categories';
import { getProducts } from '@/lib/products';
import { FeaturedCategories } from '@/components/home/featured-categories';
import { LatestListings } from '@/components/home/latest-listings';
import { CommunityBanner } from '@/components/home/community-banner';
import { HandoffSteps } from '@/components/home/handoff-steps';

// axios isn't tracked by Next's fetch cache — revalidate manually.
export const revalidate = 60;

const TRUST = [
	{ icon: Handshake, label: 'Không qua trung gian' },
	{ icon: MessageCircle, label: 'Nhắn tin trực tiếp với người bán' },
	{ icon: GraduationCap, label: 'Cùng trường, gặp là xong' },
] as const;

const QUICK_PICKS = 4;

const FEED_LIMIT = 10;

export default async function Home() {
	const [categories, initialFeed] = await Promise.all([
		getCategories(),
		getProducts({ limit: FEED_LIMIT }),
	]);

	return (
		<>
			{/* Header switches to its paper pill as the category sheet reaches it. */}
			<section
				data-hero
				className="relative flex min-h-dvh items-center overflow-hidden"
			>
				{/* Two purpose-cut crops (portrait/landscape), switched on
				    `orientation` not width, since a portrait tablet is `md`
				    width too. `priority` on both: Next preloads it before CSS
				    resolves which is hidden, so there's no way to preload just
				    one. Dev-only console warning about sizes on the hidden one
				    is expected and harmless (doesn't appear in prod). */}
				<Image
					src="/hero-image-mobile.png"
					alt=""
					fill
					priority
					quality={90}
					sizes="100vw"
					className="block object-cover object-bottom [@media(orientation:landscape)]:hidden"
				/>
				<Image
					src="/hero-image.png"
					alt=""
					fill
					priority
					quality={90}
					sizes="100vw"
					className="hidden object-cover object-bottom [@media(orientation:landscape)]:block"
				/>

				<div className="absolute inset-0 bg-gradient-to-r from-fz-ink/85 via-fz-ink/70 to-fz-ink/55 lg:from-fz-ink/82 lg:via-fz-ink/66 lg:to-fz-ink/12" />
				<div className="absolute inset-0 bg-gradient-to-t from-fz-ink/22 via-transparent to-fz-ink/25" />

				<div className="relative mx-auto w-full max-w-6xl px-4 pt-28 pb-28 sm:px-6">
					<div className="max-w-4xl">
						<p className="fz-rise flex items-center gap-3 font-heading text-xs font-medium tracking-[0.2em] text-white/85 uppercase">
							<span
								aria-hidden
								className="h-px w-8 bg-white/40"
							/>
							Chợ đồ cũ sinh viên
						</p>

						<h1
							style={{ animationDelay: '70ms' }}
							className="fz-rise mt-5 font-heading text-[clamp(2rem,6.5vw,5rem)] leading-[0.95] font-bold tracking-tight text-balance text-fz-paper"
						>
							Khoá trước để lại.
							<br />
							Khoá sau dùng tiếp.
						</h1>

						<p
							style={{ animationDelay: '140ms' }}
							// white/90: /80 failed AA contrast at 375px.
							className="fz-rise mt-5 max-w-xl text-base text-white/90 sm:text-lg"
						>
							Sách, laptop, xe đạp, quạt máy — mua bán ngay trong
							trường bạn, không qua trung gian.
						</p>

						{categories.length > 0 && (
							<div
								style={{ animationDelay: '210ms' }}
								className="fz-rise mt-12 flex flex-wrap gap-2"
							>
								{categories
									.slice(0, QUICK_PICKS)
									.map((category) => (
										// font-medium so these read as actions, not prose.
										<Link
											key={category.id}
											href={`/tim-kiem?categoryId=${category.id}`}
											className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/20"
										>
											{category.name}
										</Link>
									))}
							</div>
						)}

						{/* Demoted via hairline + smaller size, not spacing alone.
						    Stacked below sm so flex-wrap can't produce an
						    odd-looking line break at arbitrary widths. */}
						<ul
							style={{ animationDelay: '280ms' }}
							className="fz-rise mt-14 flex max-w-xl flex-col gap-y-3 border-t border-white/15 pt-6 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2.5"
						>
							{TRUST.map(({ icon: Icon, label }) => (
								<li
									key={label}
									className="flex items-center gap-2 text-[13px] text-white/70"
								>
									<Icon
										aria-hidden
										className="size-3.5 shrink-0 text-white/50"
									/>
									{label}
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Hints there's more below the full-viewport hero. Hidden below
				    md, where BottomNav owns that space. */}
				<a
					href="#danh-muc"
					style={{ animationDelay: '420ms' }}
					className="fz-rise absolute inset-x-0 bottom-8 z-10 mx-auto hidden w-fit items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide text-white/80 transition-colors hover:text-white md:flex"
				>
					Xem danh mục
					<ArrowDown aria-hidden className="fz-drift size-4" />
				</a>
			</section>

			<div aria-hidden className="relative h-48 overflow-hidden">
				<Image
					src="/hero-image-mobile.png"
					alt=""
					fill
					sizes="100vw"
					className="block object-cover object-bottom [@media(orientation:landscape)]:hidden"
				/>
				<Image
					src="/hero-image.png"
					alt=""
					fill
					sizes="100vw"
					className="hidden object-cover object-bottom [@media(orientation:landscape)]:block"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-fz-ink/85 via-fz-ink/70 to-fz-ink/55 lg:from-fz-ink/82 lg:via-fz-ink/66 lg:to-fz-ink/12" />
				<div className="absolute inset-0 bg-gradient-to-t from-fz-ink/22 via-transparent to-fz-ink/25" />
			</div>

			<FeaturedCategories categories={categories} />
			<CommunityBanner />
			<LatestListings initialProducts={initialFeed.data} />
			<HandoffSteps />
		</>
	);
}
