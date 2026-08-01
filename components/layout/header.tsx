'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
	ClipboardList,
	Crown,
	Heart,
	LogOut,
	Menu,
	MessageCircle,
	Plus,
	Settings,
	ShieldCheck,
	Star,
	UserRound,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { HeaderSearch } from '@/components/layout/header-search';
import { AccountMenu } from '@/components/layout/account-menu';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import type { Province } from '@/lib/locations';
import { cn } from '@/lib/utils';

const HERO_ROUTES: string[] = ['/'];

const HEADER_CLEARANCE_PX = 80;

// Same recipe as PickerOption (components/ui/picker.tsx) and AccountMenu's
// own ITEM (account-menu.tsx, kept in sync with this file's Sheet content)
// — rounded-full, generous padding, transition-colors. rounded-lg here
// before was a different radius than the desktop dropdown's rounded-md AND
// than Picker's rounded-full — three different corner radii for
// conceptually the same "row in a list" element across the app.
const SHEET_ITEM =
	'flex items-center gap-3 rounded-full px-3 py-3 text-sm text-fz-ink transition-colors duration-200 active:bg-muted';

export function Header({ provinces }: { provinces: Province[] }) {
	const { user, isLoading, logout } = useAuth();
	const pathname = usePathname();
	const overHero = HERO_ROUTES.includes(pathname);
	const [heroPassed, setHeroPassed] = useState(false);

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
						'mr-auto ml-1 transition-colors duration-300 motion-reduce:transition-none sm:ml-1.5',
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
							<Heart className="size-[18px]" />
						</Link>
						<Link
							href="/tin-nhan"
							aria-label="Tin nhắn"
							className={cn(
								buttonVariants({
									variant: 'ghost',
									size: 'icon',
								}),
								'size-10 text-fz-ink transition-colors duration-300 motion-reduce:transition-none',
								bare && ghostOnDark,
							)}
						>
							<MessageCircle className="size-[18px]" />
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
						{/* Guest-only — once signed in this slot disappears
						    rather than turning into anything, since the
						    avatar takes the OPPOSITE side of "Đăng tin"
						    (right, not left) instead of replacing this link
						    in place. */}
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

						{/* Fixed-size placeholder while the session resolves
						    (AuthProvider fetches the profile on first mount)
						    — matches AccountMenu's own size-10 trigger
						    exactly, so nothing jumps once auth state settles. */}
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

						{/* min-h-0 is load-bearing: SheetContent is a flex
						    column with a fixed h-full, and without it this
						    child's default flex-basis (auto, i.e. its own
						    content height) refuses to shrink below that,
						    so overflow-y-auto never gets anything to
						    actually scroll. Content here has grown to 6
						    items across 3 sections (plus a 4th for admins)
						    — confirmed it silently clips below the fold
						    with no way to reach "Đăng xuất" on a landscape
						    phone or anything shorter than ~600px tall. */}
						<div className="min-h-0 flex-1 overflow-y-auto scrollbar-refined">
							{user ? (
							<div className="flex flex-col gap-1 px-4">
								{/* Card, not a bare row — matches the guest
								    panel's own rounded-2xl/bg-muted identity
								    block below and AccountMenu's desktop
								    dropdown (see that file's comment). */}
								<div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3.5">
									<Image
										src={user.avatar}
										alt={user.fullName}
										width={40}
										height={40}
										className="size-10 shrink-0 rounded-full object-cover"
									/>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-fz-ink">
											{user.fullName}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{user.email}
										</p>
									</div>
								</div>

								<SheetClose asChild>
									<Link
										href="/ca-nhan"
										className={cn('mt-1', SHEET_ITEM)}
									>
										<UserRound className="size-5 text-muted-foreground" />
										Trang cá nhân
									</Link>
								</SheetClose>

								{/* Sections separated by space, not another
								    hairline — see account-menu.tsx's comment
								    (this panel mirrors it): the identity card
								    above and the rule before "Đăng xuất"
								    below are the only boundaries that
								    actually carry meaning. */}
								<div className="mt-2 px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
									Tài khoản
								</div>
								<SheetClose asChild>
									<Link
										href="/goi-thanh-vien"
										className={SHEET_ITEM}
									>
										<Crown className="size-5 text-muted-foreground" />
										Gói thành viên
									</Link>
								</SheetClose>
								<SheetClose asChild>
									<Link
										href="/cai-dat"
										className={SHEET_ITEM}
									>
										<Settings className="size-5 text-muted-foreground" />
										Đổi mật khẩu / Cài đặt
									</Link>
								</SheetClose>

								<div className="mt-2 px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
									Hoạt động
								</div>
								<SheetClose asChild>
									<Link
										href="/quan-ly-tin"
										className={SHEET_ITEM}
									>
										<ClipboardList className="size-5 text-muted-foreground" />
										Quản lý tin
									</Link>
								</SheetClose>
								<SheetClose asChild>
									<Link
										href="/tin-da-luu"
										className={SHEET_ITEM}
									>
										<Heart className="size-5 text-muted-foreground" />
										Tin đã lưu
									</Link>
								</SheetClose>
								<SheetClose asChild>
									<Link
										href="/danh-gia-cua-toi"
										className={SHEET_ITEM}
									>
										<Star className="size-5 text-muted-foreground" />
										Đánh giá của tôi
									</Link>
								</SheetClose>

								{user.role === 'ADMIN' && (
									<>
										<div className="mt-2 px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
											Quản trị
										</div>
										<SheetClose asChild>
											<Link
												href="/admin"
												className={SHEET_ITEM}
											>
												<ShieldCheck className="size-5 text-muted-foreground" />
												Trang quản trị
											</Link>
										</SheetClose>
									</>
								)}

								<div className="mt-2 h-px bg-border" />

								<SheetClose asChild>
									<button
										type="button"
										onClick={logout}
										className={cn(
											SHEET_ITEM,
											'text-left text-fz-danger active:bg-fz-danger/10',
										)}
									>
										<LogOut className="size-5" />
										Đăng xuất
									</button>
								</SheetClose>
							</div>
						) : (
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
											Đăng nhập để nhắn tin, lưu tin và
											đăng tin của mình.
										</p>
									</div>
								</div>

								<div className="mt-4 flex flex-col gap-2">
									<Link
										href="/dang-nhap"
										className={cn(
											buttonVariants({
												variant: 'default',
											}),
											'h-11',
										)}
									>
										Đăng nhập
									</Link>
									<Link
										href="/dang-ky"
										className={cn(
											buttonVariants({
												variant: 'outline',
											}),
											'h-11',
										)}
									>
										Đăng ký
									</Link>
								</div>
							</div>
						)}
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
