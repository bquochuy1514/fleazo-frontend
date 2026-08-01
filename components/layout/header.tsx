'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, UserRound } from 'lucide-react';
import { Logo } from '@/components/logo';
import { HeaderSearch } from '@/components/layout/header-search';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import type { Province } from '@/lib/locations';
import { cn } from '@/lib/utils';

// Routes whose page renders a full-bleed hero BEHIND the header. On these the
// header starts bare — no pill, white text straight on the photo — and only
// solidifies once the hero leaves. Everywhere else the pill is there from the
// first paint, because white text on the paper background is unreadable.
//
// An explicit list, not DOM-sniffing for a hero element: usePathname resolves
// during SSR too, so the very first paint is already the right chrome. A
// detect-then-flip approach would render the wrong one and swap after
// hydration, which is a visible flash on every load.
// **Add a route here whenever a page gets its own full-bleed hero.**
const HERO_ROUTES: string[] = ['/'];

// Height the header occupies from the top of the viewport: pt-4 (16) + h-16.
// The pill has to be solid by the time the hero's bottom edge reaches this
// line, or paper-coloured content slides under white text.
const HEADER_CLEARANCE_PX = 80;

// Floating inset pill, not a full-bleed bar — it overlays the page rather than
// occupying flow space, so the homepage hero shows through on both sides and
// above it. Any page WITHOUT a full-bleed hero must add its own top padding to
// clear this (see AGENTS.md → Layout).
//
// Logged-out shape only for now. Signed-in adds a messages icon with an unread
// badge and an avatar menu (Quản lý tin / Tin đã lưu / Hồ sơ / Đăng xuất);
// none of that can exist until there's session state in the UI.
export function Header({ provinces }: { provinces: Province[] }) {
	const pathname = usePathname();
	const overHero = HERO_ROUTES.includes(pathname);
	const [heroPassed, setHeroPassed] = useState(false);

	// Flip exactly when the hero leaves, not at a fixed scroll distance: the
	// pill exists to keep the header readable, and it's only unreadable once
	// something other than the hero is behind it. An IntersectionObserver on
	// the hero itself needs no magic number and no scroll handler on the main
	// thread.
	useEffect(() => {
		if (!overHero) return;
		const hero = document.querySelector('[data-hero]');
		if (!hero) {
			// The route claims a hero but the page didn't mark one. There's
			// nothing to subscribe to, and staying bare would leave white text
			// on the paper background — so fall back to the solid pill. Costs
			// one extra render, but only on a page that's already misconfigured.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHeroPassed(true);
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => setHeroPassed(!entry.isIntersecting),
			{ rootMargin: `-${HEADER_CLEARANCE_PX}px 0px 0px 0px` },
		);
		io.observe(hero);
		return () => io.disconnect();
	}, [overHero, pathname]);

	const bare = overHero && !heroPassed;

	// Ghost controls invert wholesale on the photo — their default hover fill
	// is bg-muted, which is invisible against it.
	const ghostOnDark =
		'text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/50';

	return (
		<header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
			{/* Travelling scrim. Without it the bare header drifts over the
			    hero photo's bright window on the way past and its text
			    measures 2.4:1 — unreadable. This band holds the worst case
			    across the whole hero at 4.8:1. It fades out with the pill, and
			    reads as vignetting on the photo rather than as a bar. */}
			<div
				aria-hidden
				className={cn(
					'pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-fz-ink/60 to-transparent transition-opacity duration-300 ease-out motion-reduce:transition-none',
					bare ? 'opacity-100' : 'opacity-0',
				)}
			/>

			{/* Only colour/shadow transition — nothing here animates a
			    property that would reflow the page. */}
			{/* Below lg this is a plain flex row — logo, then search, then the
			    buttons. From lg it becomes a 1fr/auto/1fr grid so the search
			    sits dead centre of the pill rather than centre of whatever
			    space the sides left over (the logo is 122px and the button
			    pair is 217px, so "centred in the remainder" is 48px off).
			    The grid only starts at lg because it needs room for the widest
			    side on BOTH sides: at 768px that would leave the middle column
			    270px, and the search doesn't fit in that. */}
			<div
				className={cn(
					'relative mx-auto flex h-16 max-w-6xl items-center gap-3 rounded-full border px-3 transition-[background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none sm:gap-4 sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]',
					bare
						? 'border-transparent bg-transparent shadow-none'
						: 'border-border bg-card/90 shadow-sm backdrop-blur-md',
				)}
			>
				{/* Mark-only below md. The full lockup is 122px wide, and at
				    375px that against a 44px menu button pushes the search
				    field 39px off centre — the mark alone is 37px, so the two
				    sides balance and the field sits where it looks like it
				    should. */}
				<Logo
					wordmarkClassName="hidden md:block"
					className={cn(
						// mr-auto rather than justify-self-start: an auto margin
						// pins the item to its edge in flex AND grid, so the
						// same class covers both layouts below and above lg.
						'mr-auto ml-1 transition-colors duration-300 motion-reduce:transition-none sm:ml-1.5',
						// Reaches the wordmark's mask through currentColor. The
						// mark keeps its own colours in both states — it reads
						// against the photo and against paper alike.
						bare && 'text-white',
					)}
				/>

				{/* Present in both states, hero included: search is this
				    marketplace's primary action, so it can't be the thing that
				    disappears on the one screen everybody lands on. The pill is
				    opaque, which is what keeps it legible straight on the
				    photo. */}
				<div className="min-w-0 flex-1 lg:w-[28rem] lg:flex-none">
					<HeaderSearch provinces={provinces} />
				</div>

				{/* Below md this is BottomNav's job — it already carries Đăng
				    tin and Cá nhân, and duplicating them here is exactly what
				    the old hamburger was doing. Same breakpoint BottomNav
				    itself uses, so the two never both show. */}
				{/* ml-auto pins this to the right edge in both layouts — as a
				    grid item it absorbs the leftover width of its column, which
				    justify-self-end would otherwise have to do. */}
				<div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
					<Link
						href="/dang-nhap"
						className={cn(
							buttonVariants({ variant: 'ghost' }),
							'h-10 px-4 text-fz-ink transition-colors duration-300 motion-reduce:transition-none',
							bare && ghostOnDark,
						)}
					>
						Đăng nhập
					</Link>
					{/* The one primary action on the page, last in the row
					    where the pill's own curve frames it. On the photo it
					    inverts to a white chip — a solid chip rather than white
					    text, so it stays legible over the bright part of the
					    image. */}
					<Link
						href="/dang-tin"
						className={cn(
							buttonVariants({ variant: 'default' }),
							'h-10 gap-1.5 px-4 transition-colors duration-300 motion-reduce:transition-none',
							bare &&
								'bg-white text-fz-ink hover:bg-white/85 focus-visible:ring-white/50',
						)}
					>
						<Plus className="size-4" />
						Đăng tin
					</Link>
				</div>

				{/* Account drawer, below md only. This is NOT the old
				    hamburger: that one listed Trang chủ / Danh mục / Tin nhắn /
				    Đăng tin, all four of which BottomNav already carries. This
				    one holds identity and nothing else, so the two never
				    overlap. Stays visible while the header is bare — on the
				    hero it and the logo are all that's left up there. */}
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Mở menu tài khoản"
							className={cn(
								'size-11 shrink-0 transition-colors duration-300 motion-reduce:transition-none md:hidden',
								bare && ghostOnDark,
							)}
						>
							<Menu className="size-5" />
						</Button>
					</SheetTrigger>

					<SheetContent side="right">
						<SheetHeader>
							<SheetTitle>Tài khoản</SheetTitle>
						</SheetHeader>

						{/* Signed-out shape. Signed in, this block becomes the
						    user's name/avatar plus Quản lý tin · Tin đã lưu ·
						    Hồ sơ · Đăng xuất — same drawer, different contents,
						    which is why it isn't a plain link list. */}
						<div className="px-4">
							<div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3.5">
								<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card">
									<UserRound className="size-5 text-muted-foreground" />
								</span>
								<div className="min-w-0">
									<p className="font-medium text-fz-ink">
										Bạn chưa đăng nhập
									</p>
									<p className="mt-0.5 text-xs text-muted-foreground">
										Đăng nhập để nhắn tin, lưu tin và đăng
										tin của mình.
									</p>
								</div>
							</div>

							<div className="mt-4 flex flex-col gap-2">
								<Link
									href="/dang-nhap"
									className={cn(
										buttonVariants({ variant: 'default' }),
										'h-11',
									)}
								>
									Đăng nhập
								</Link>
								<Link
									href="/dang-ky"
									className={cn(
										buttonVariants({ variant: 'outline' }),
										'h-11',
									)}
								>
									Đăng ký
								</Link>
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
