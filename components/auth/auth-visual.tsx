import Image from 'next/image';
import { Logo } from '@/components/logo';

// The photo panel shared by every (auth) page — desktop/tablet ONLY. Below
// `md` there's no photo at all: an earlier build stacked a flush h-64/h-80
// band above the form on mobile, but that ate ~30% of a phone's viewport
// before the user saw a single input, and routinely pushed the "Đăng ký"
// link at the bottom past the fold. The form panel now leads immediately on
// mobile (see AuthFormPanel's own md:hidden logo), which is the pattern
// Depop/Vinted/Marketplace-style apps use — the lifestyle photo already did
// its job on the homepage, mobile auth is a utility screen. From `md`,
// where the extra width makes room for both, this is an INSET panel with
// its own margin and corner radius inside the card, on the LEFT — an
// earlier pass put it on the right, but that parked the form panel's own
// overflow-y-auto SCROLLBAR at the seam between the two panels, reading as
// a stray line gouged into the edge of the photo. On the left, that same
// scrollbar lands on the card's own outer edge instead, which is an
// unremarkable place for a scrollbar to be.
//
// No oversized route word on the photo — the form panel already carries an
// actual `<h1>` for that (see dang-nhap/page.tsx), and repeating it
// decoratively here just said the same thing twice. Purely presentational
// (no pathname branch to read), so this stays without 'use client'.
// `-order-1` is vestigial now that mobile never renders this at all, but
// still correct for desktop's row order (photo on the left) and harmless
// to leave in.
//
// `/auth-image-desktop.png` (~4:5, e.g. 1600×2000) is the real, final auth
// photo — no longer a homepage-hero stand-in. The earlier near-square crop
// math (AGENTS.md → Layout decisions) assumed the photo touched the
// viewport edge directly, and it no longer does now that the panel sits
// inset inside a card that's itself inset from the viewport, so re-crop by
// eye if this ever gets swapped again rather than trusting 4:5 as exact.
// `/auth-image-mobile.png` is unused now that mobile has no photo — left in
// /public rather than chased down; delete it if you're already touching
// that asset list.
export function AuthVisual() {
	return (
		<div className="relative -order-1 hidden overflow-hidden md:block md:h-auto md:w-[52%] md:overflow-visible md:p-3 lg:p-4">
			{/* The inset box — only this inner layer gets rounded on desktop.
			    The outer wrapper stays a plain rectangle so its `md:p-*`
			    padding reads as the card's paper showing through, framing this
			    box the way the reference's photo sits inset from its card. */}
			<div className="relative size-full overflow-hidden md:rounded-3xl">
				<Image
					src="/auth-image-desktop.png"
					alt=""
					fill
					priority
					quality={90}
					sizes="(min-width: 768px) 52vw, 0px"
					className="object-cover object-right"
				/>

				{/* Dark near the top only, for the mark's contrast — nothing
				    needs to read against the bottom of the photo anymore now
				    that the giant word is gone, so the scrim doesn't need to
				    darken down there too. */}
				<div className="absolute inset-0 bg-gradient-to-b from-fz-ink/50 via-transparent to-transparent" />

				<Logo
					size="lg"
					className="absolute top-5 left-5 text-white md:top-6 md:left-6"
				/>
			</div>
		</div>
	);
}
