import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowDown,
	GraduationCap,
	Handshake,
	MessageCircle,
} from 'lucide-react';
import { getCategories } from '@/lib/categories';

// axios isn't tracked by Next's fetch cache, so without this the page renders
// once at build time and never sees a new listing.
export const revalidate = 60;

// What Fleazo can actually promise. There's no escrow and no payment in the
// product — money changes hands off-platform — so what's on offer is the
// absence of a middleman and the fact that both sides are on the same campus.
const TRUST = [
	{ icon: Handshake, label: 'Không qua trung gian' },
	{ icon: MessageCircle, label: 'Nhắn tin trực tiếp với người bán' },
	{ icon: GraduationCap, label: 'Cùng trường, gặp là xong' },
] as const;

const QUICK_PICKS = 4;

export default async function Home() {
	const categories = await getCategories();

	return (
		// data-hero: the Header watches this element to know when to stop
		// being transparent (components/layout/header.tsx). Any page that
		// grows a full-bleed hero needs the attribute AND an entry in that
		// file's HERO_ROUTES.
		<section
			data-hero
			className="relative flex min-h-dvh items-center overflow-hidden"
		>
			{/* Art-directed pair, not one photo stretched to fit everything. A
			    single crop can't look right on both a phone and a wide
			    monitor: at the old 3:2 source, `cover` had to slice ~70% off
			    the SIDES on a phone to fill its height, and `contain` left
			    bare scrim bands down the sides of a wide desktop instead. Two
			    purpose-cut files fix both — a 3:5 portrait crop and a ~16:9
			    landscape crop, see AGENTS.md → Layout decisions for the crop
			    math.
			    Switched on `orientation`, not a width breakpoint: a portrait
			    tablet (768px, same width as `md`) still needs the PORTRAIT
			    crop, so any width-only cutover picks the wrong image for it.
			    `priority` on both is deliberate, not an oversight — Next
			    preloads a `priority` image unconditionally, before CSS
			    resolves which one `hidden` applies to, so there's no way to
			    preload only the visible one without hand-rolling the
			    preload `<link>`. The extra request for the orientation NOT
			    shown is the accepted cost.
			    ⚠️ Expect a dev-only console warning ("sizes... but image is
			    not rendered at full viewport width") on WHICHEVER of these
			    two is currently `display: none` — Next's dev check measures
			    every `fill` image regardless of CSS visibility, sees 0×0
			    against `sizes="100vw"`, and can't tell "hidden on purpose by
			    an orientation query" from "sizes is wrong". It flips to
			    naming the other file the moment you rotate/resize. Harmless,
			    doesn't appear in production — not a bug to chase. */}
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
						<span aria-hidden className="h-px w-8 bg-white/40" />
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
						// white/90, not /80: at /80 this measured 4.45:1 on a 375px
						// viewport — 0.05 under AA. Raised here rather than by
						// darkening the scrim, which would dim the photo for every
						// breakpoint to fix one.
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
									// font-medium: these are the tier's
									// actions, and at 400 they read as more
									// prose in a column that already has two
									// paragraphs of it.
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

					{/* Demoted on three axes at once — a hairline above it, a
					    step down to 13px, and a narrower measure than the
					    tiers above. Spacing alone wasn't separating it from
					    the chips, which sat at the same 14px weight 400. */}
					{/* One per line below sm, a wrapping row above it. Left to
					    flex-wrap on a phone the break lands wherever the
					    viewport happens to put it — 375px gives 2+1, 430px
					    gives 1+2, and the odd one out reads as a mistake
					    rather than a list. Stacked, every width looks
					    deliberate. */}
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

			{/* The hero is a full viewport tall with nothing peeking below it,
			    so nothing else says the page continues. Text as well as an
			    arrow: the arrow says "there's more", the label says what more
			    there is. Hidden below md, where BottomNav owns the bottom of
			    the screen and the gesture to scroll is instinctive anyway. */}
			<a
				href="#danh-muc"
				style={{ animationDelay: '420ms' }}
				className="fz-rise absolute inset-x-0 bottom-8 z-10 mx-auto hidden w-fit items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide text-white/80 transition-colors hover:text-white md:flex"
			>
				Xem danh mục
				<ArrowDown aria-hidden className="fz-drift size-4" />
			</a>
		</section>
	);
}
