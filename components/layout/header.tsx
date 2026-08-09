'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, MessageCircle, Plus } from 'lucide-react';
import { Logo } from '@/components/logo';
import { HeaderSearch } from '@/components/layout/header-search';
import { AccountMenu } from '@/components/layout/account-menu';
import { AccountSheetContent } from '@/components/layout/account-sheet-content';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import type { Province } from '@/lib/locations';
import { cn } from '@/lib/utils';

const HERO_ROUTES: string[] = ['/'];

const HEADER_CLEARANCE_PX = 80;

export function Header({ provinces }: { provinces: Province[] }) {
	const { user, isLoading } = useAuth();
	const { unreadConversationCount } = useChat();
	const pathname = usePathname();
	// Gated on `mounted`, not usePathname() directly — the homepage is
	// statically generated, and its SSR pathname value didn't reliably match
	// the client's, causing a silent hydration mismatch. Rendering `false`
	// on both server and first client pass avoids that; this flips true a
	// tick later via a plain client re-render.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const overHero = mounted && HERO_ROUTES.includes(pathname);
	const [heroPassed, setHeroPassed] = useState(false);
	// Remount-to-restart trick: bumping the key forces the Heart icon's
	// `fz-pulse` animation to play again even if two saves land back to back.
	const [pulseKey, setPulseKey] = useState(0);

	useEffect(() => {
		const onSaved = () => setPulseKey((k) => k + 1);
		window.addEventListener('fz:saved', onSaved);
		return () => window.removeEventListener('fz:saved', onSaved);
	}, []);

	useEffect(() => {
		if (!overHero) return;

		let frame: number | null = null;
		let previousValue: boolean | null = null;
		let resizeObserver: ResizeObserver | null = null;

		const scheduleUpdate = () => {
			if (frame === null) {
				frame = window.requestAnimationFrame(updateHeaderSurface);
			}
		};

		// Queried fresh each call, not captured once — the hero can still be
		// streaming into the DOM (mutationObserver) or mid-layout (resizeObserver)
		// on the first call, and a stale 0-height read would stick forever.
		const updateHeaderSurface = () => {
			frame = null;
			const heroes = Array.from(document.querySelectorAll<HTMLElement>('[data-hero]'));
			if (heroes.length === 0) return;

			if (!resizeObserver) {
				resizeObserver = new ResizeObserver(scheduleUpdate);
				heroes.forEach((hero) => resizeObserver!.observe(hero));
				window.addEventListener('scroll', scheduleUpdate, { passive: true });
				window.addEventListener('resize', scheduleUpdate);
				mutationObserver.disconnect();
			}

			// A hero must cover the line immediately below the header. Merely being
			// visible elsewhere in the viewport (for example the next banner) must
			// not switch the header back to its transparent treatment.
			const headerIsOverPhoto = heroes.some((hero) => {
				const rect = hero.getBoundingClientRect();
				return rect.top <= HEADER_CLEARANCE_PX && rect.bottom > HEADER_CLEARANCE_PX;
			});
			const nextHeroPassed = !headerIsOverPhoto;

			if (nextHeroPassed !== previousValue) {
				previousValue = nextHeroPassed;
				setHeroPassed(nextHeroPassed);
			}
		};

		const mutationObserver = new MutationObserver(updateHeaderSurface);
		mutationObserver.observe(document.body, { childList: true, subtree: true });

		updateHeaderSurface();

		return () => {
			mutationObserver.disconnect();
			resizeObserver?.disconnect();
			window.removeEventListener('scroll', scheduleUpdate);
			window.removeEventListener('resize', scheduleUpdate);
			if (frame !== null) window.cancelAnimationFrame(frame);
		};
	}, [overHero, pathname]);

	const bare = overHero && !heroPassed;

	// Ghost controls invert on the photo — default bg-muted hover is invisible there.
	const ghostOnDark =
		'text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/50';

	return (
		<header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
			<div
				aria-hidden
				className={cn(
					'pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-fz-ink/60 to-transparent transition-opacity duration-300 ease-out motion-reduce:transition-none',
					bare ? 'opacity-100' : 'opacity-0',
				)}
			/>

			<div
				className={cn(
					'relative mx-auto flex h-16 max-w-6xl items-center gap-3 rounded-full border px-3 transition-[background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none sm:gap-4 sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]',
					bare
						? 'border-transparent bg-transparent shadow-none'
						: 'border-border bg-card/90 shadow-sm backdrop-blur-md',
				)}
			>
				<Logo
					wordmarkClassName="hidden md:block"
					className={cn(
						// Same "fade it slightly" idiom as the default button
						// (`hover:bg-primary/80`) — opacity dim, not a bg tint
						// like the ghost icon buttons beside it.
						'mr-auto ml-1 transition-opacity duration-300 hover:opacity-80 motion-reduce:transition-none sm:ml-1.5',
						bare && 'text-white',
					)}
				/>

				<div className="min-w-0 flex-1 lg:w-[28rem] lg:flex-none">
					<HeaderSearch provinces={provinces} bare={bare} />
				</div>

				<div className="ml-auto hidden shrink-0 items-center gap-3 md:flex">
					<div className="flex items-center gap-1">
						<Link
							href="/tin-da-luu"
							aria-label="Tin đã lưu"
							className={cn(
								buttonVariants({
									variant: 'ghost',
									size: 'icon',
								}),
								'size-10 text-fz-ink transition-colors duration-300 motion-reduce:transition-none',
								bare && ghostOnDark,
							)}
						>
							<Heart key={pulseKey} className={cn('size-[18px]', pulseKey > 0 && 'fz-pulse')} />
						</Link>
						<Link
							href="/tin-nhan"
							aria-label="Tin nhắn"
							className={cn(
								buttonVariants({
									variant: 'ghost',
									size: 'icon',
								}),
								'relative size-10 text-fz-ink transition-colors duration-300 motion-reduce:transition-none',
								bare && ghostOnDark,
							)}
						>
							<MessageCircle className="size-[18px]" />
							{unreadConversationCount > 0 && (
								<span
									aria-hidden
									className={cn(
										'absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold ring-2',
										bare ? 'bg-white text-fz-ink ring-fz-ink/60' : 'bg-fz-ink text-white ring-card',
									)}
								>
									{unreadConversationCount > 9 ? '9+' : unreadConversationCount}
								</span>
							)}
						</Link>
					</div>

					<span
						aria-hidden
						className={cn(
							'h-5 w-px shrink-0 transition-colors duration-300 ease-out motion-reduce:transition-none',
							bare ? 'bg-white/25' : 'bg-border',
						)}
					/>

					<div className="flex items-center gap-2">
						{/* Guest-only — disappears once signed in; avatar renders
						    on the opposite side of "Đăng tin", not in this slot. */}
						{!user && !isLoading && (
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
						)}
						{/* Primary action, last in the row. Inverts to a solid white
						    chip on the photo for legibility over bright areas. */}
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

						{/* Fixed-size placeholder while session resolves — matches
						    AccountMenu's size-10 trigger so nothing jumps. */}
						{isLoading ? (
							<div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
						) : (
							<AccountMenu />
						)}
					</div>
				</div>

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
						<SheetHeader className="shrink-0">
							<SheetTitle>Tài khoản</SheetTitle>
						</SheetHeader>

						{/* min-h-0 is load-bearing: without it this flex child's
						    content-height basis blocks overflow-y-auto from
						    scrolling, clipping "Đăng xuất" on short viewports. */}
						<div className="min-h-0 flex-1 overflow-y-auto scrollbar-refined">
							<AccountSheetContent />
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
