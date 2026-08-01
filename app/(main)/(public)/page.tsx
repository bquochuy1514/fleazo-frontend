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
			{/* object-bottom, not the default centre: a 3:2 source in a 16:9
			    viewport overflows vertically, and centred that gets taken off
			    BOTH edges — 66px top and bottom at 1280×720, 100px at
			    1920×1080. This photo carries its subject along the bottom, so
			    the whole overflow comes off the top instead, where there's only
			    ceiling. No effect on portrait viewports, which crop
			    horizontally instead. */}
			<Image
				src="/ChatGPT Image Aug 1, 2026, 11_58_38 AM (1).png"
				alt=""
				fill
				priority
				quality={90}
				// Over-declared on purpose. `sizes` is a WIDTH hint, but a
				// portrait viewport makes object-cover scale this 3:2 photo by
				// HEIGHT — a plain 100vw picks a variant that ends up upscaled
				// ~3× and visibly blurry on a phone. Recompute the multipliers
				// if the photo's aspect ratio changes.
				sizes="(max-width: 640px) 330vw, (max-width: 1024px) 200vw, 100vw"
				className="object-cover object-bottom"
			/>

			{/* TWO scrims stack here, and they MULTIPLY — combined coverage is
			    1−(1−a₁)(1−a₂), not a₁+a₂. Easy to forget and end up with a
			    photo nobody can see: an earlier pair put the bottom-left corner
			    at 95% ink while every text element sat 44% above the contrast
			    it needed. Tune them together, against the actual photo, and
			    aim for a small margin over AA rather than the largest number
			    you can get.

			    Horizontal one carries legibility. The falloff to /12 only
			    makes sense from lg, where text stops around 63% of the width
			    and the rest is meant to stay photo. Below lg it fails outright:
			    a portrait viewport makes object-cover scale the 3:2 source by
			    HEIGHT, so only the middle ~31% of the frame survives while the
			    text now runs the full width into the weakest stop. Measured at
			    375px with the desktop falloff, the h1 hit 2.71:1 and the
			    subcopy 3.74:1 — both under AA. No right-hand column exists to
			    protect on a phone, so it stays dark across. */}
			<div className="absolute inset-0 bg-gradient-to-r from-fz-ink/85 via-fz-ink/70 to-fz-ink/55 lg:from-fz-ink/82 lg:via-fz-ink/66 lg:to-fz-ink/12" />
			{/* Vertical one is for mood, not legibility — the header brings its
			    own travelling scrim for its text, and the scroll cue has margin
			    to spare. The bottom stop used to be /65, which veiled exactly
			    the band where this photo keeps its subject. */}
			<div className="absolute inset-0 bg-gradient-to-t from-fz-ink/22 via-transparent to-fz-ink/25" />

			{/* Vertically centred, not bottom-aligned: the bottom-aligned
			    version came from the earlier oversized-wordmark hero, which
			    had something anchoring the top of the frame. It doesn't any
			    more, so the composition sits in the middle.
			    pb clears the mobile BottomNav (h-16 + safe area), which is
			    fixed over the bottom of the viewport. */}
			<div className="relative mx-auto w-full max-w-6xl px-4 pt-28 pb-28 sm:px-6">
				{/* Three tiers, not five evenly-spaced blocks. Statement
				    (eyebrow + h1 + subcopy) holds together on 16–20px gaps;
				    the action tier and the footnote tier are pushed out to
				    48px and 56px. Before this the gaps ran 20/20/28/32, which
				    is close enough to even that the five blocks read as five
				    equal things with no tiers at all. */}
				<div className="max-w-4xl">
					{/* white/85, not /70: measured against the photo through
					    both scrims, /70 came out at 4.33:1 on a 375px viewport
					    — under AA for 12px text. Re-measure if the photo
					    changes. */}
					{/* Set in the display face, not the body one. It's the only
					    other typographic label in the hero, and putting it in
					    Space Grotesk means the pairing works at both ends of
					    the scale instead of carrying exactly one element. */}
					<p className="fz-rise flex items-center gap-3 font-heading text-xs font-medium tracking-[0.2em] text-white/85 uppercase">
						<span aria-hidden className="h-px w-8 bg-white/40" />
						Chợ đồ cũ sinh viên
					</p>

					{/* Two short sentences, not one long line: the break IS the
					    idea — one cohort leaves, the next one picks it up. */}
					{/* Min is 2rem, not 2.5rem: at 40px the first sentence
					    wrapped on a 375px screen, which broke it mid-phrase and
					    turned the deliberate two-line break into a ragged
					    three. Max 5rem is what the 896px column holds — the
					    longer sentence runs ~881px at 80px. */}
					{/* fz-paper (#F6F3EE), not pure white: it's the palette's
					    own off-white, and the scrim behind it is fz-ink rather
					    than black, so the whole frame stays on the warm axis.
					    Costs ~10% contrast, which only large text has the
					    margin for — the smaller text below stays white. */}
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

					{/* Search lives in the header on every page, this one
					    included, so without these the column would be four
					    blocks of text with nothing to act on. They're the way
					    in for someone who doesn't yet know what to type — and
					    the only interactive thing here on phones, which don't
					    get the card column at all. */}
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
					<ul
						style={{ animationDelay: '280ms' }}
						className="fz-rise mt-14 flex max-w-xl flex-wrap gap-x-6 gap-y-2.5 border-t border-white/15 pt-6"
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
