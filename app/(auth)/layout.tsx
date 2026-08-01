import Image from 'next/image';
import { AuthVisual } from '@/components/auth/auth-visual';
import { AuthFormPanel } from '@/components/auth/auth-form-panel';

// Auth screens: no marketplace chrome — AuthVisual supplies the only
// branding (the mark), the form panel is bare paper.
//
// The outer shell is a hard `h-svh` + `overflow-hidden` box at every
// breakpoint, not `min-h-dvh` — with only a minimum, a form that grows
// (an error banner appearing, or just a small phone where the photo band +
// form never fit together) forces this OUTER container to grow past the
// viewport, and the whole page scrolls with the photo band scrolling away
// with it. Capping it here instead pushes all the overflow onto the one
// child built to absorb it — the form panel's own `overflow-y-auto` — so
// the photo stays put and only the form scrolls, on mobile and desktop
// alike.
//
// `svh`, not `dvh`: on iPhone + Chrome specifically, `100dvh` was
// resolving taller than what was actually visible at first paint — the
// address bar hadn't settled yet, so this shell sized itself to a viewport
// bigger than the real one and the top of the "Đăng nhập" heading landed
// under the browser chrome, cropped. Same failure family as the Picker
// sheet's `svh` fix (see AGENTS.md → iOS Safari traps), just triggered by
// initial paint instead of a scroll-locked overlay this time. `svh` is the
// chrome-fully-expanded floor, so it's never larger than what's on screen —
// the cost is a few unused px once the browser chrome later retracts,
// which is a fine trade for "never cropped."
//
// Below `md`: no card chrome and no photo — AuthVisual renders nothing at
// this width (see that file's comment), so the form panel alone fills the
// full-bleed shell, logo included via its own md:hidden fallback. A
// floating card with margin on every side eats real space on a phone
// that's already tight, so the floating-card treatment below is
// desktop-only, same as the photo it frames.
//
// From `md`: the photo panel's own image, reused a second time as a
// full-bleed ambient backdrop behind a floating card — the card looks like
// it's sitting on an extension of its own photo rather than a flat color.
// Scrim-darkened with the same gradient technique the homepage hero uses,
// not blurred: blurring a full-viewport image needs either a heavy
// `filter: blur()` (real paint cost at that size) or `backdrop-filter`,
// which is what turned an ancestor into an unwanted containing block for
// `position: fixed` descendants the last time this codebase reached for it
// (see AGENTS.md → iOS Safari traps). A plain multiply-tint has neither
// problem.
//
// Same real auth photo as AuthVisual, reused here as the backdrop — see
// that file's comment. If it's ever swapped, update both together.
//
// ⚠️ No pages live here yet besides dang-nhap. Before a page that should
// bounce an already-logged-in visitor away lands, wrap `children` in a
// GuestOnlyGuard — that guard needs AuthProvider, which doesn't exist in
// this repo yet (see Current Status).
export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="relative h-svh overflow-hidden md:flex md:items-center md:justify-center md:p-6 lg:p-10">
			<div aria-hidden className="fixed inset-0 -z-10 hidden md:block">
				<Image
					src="/auth-image-desktop.png"
					alt=""
					fill
					quality={90}
					sizes="100vw"
					className="object-cover object-right"
				/>
				<div className="absolute inset-0 bg-fz-ink/55" />
			</div>

			{/* h-full, not content-sized: this is a flex item of the fixed
			    h-dvh shell above, so `h-full` is what makes it (and, via
			    default `items-stretch`, both its own children — the form
			    panel AND AuthVisual) actually fill that fixed height rather
			    than grow past it. */}
			<div className="flex h-full flex-col md:w-full md:max-w-6xl md:flex-row md:overflow-hidden md:rounded-4xl md:border md:border-white/10 md:bg-card md:shadow-2xl">
				<AuthFormPanel>{children}</AuthFormPanel>

				<AuthVisual />
			</div>
		</div>
	);
}
