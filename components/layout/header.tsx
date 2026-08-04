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

// Same recipe as PickerOption and AccountMenu's ITEM (account-menu.tsx, kept
// in sync with this file's Sheet content) — rounded-full, transition-colors.
const SHEET_ITEM =
	'flex items-center gap-3 rounded-full px-3 py-3 text-sm text-fz-ink transition-colors duration-200 active:bg-muted';

export function Header({ provinces }: { provinces: Province[] }) {
	const { user, isLoading, logout } = useAuth();
	const pathname = usePathname();
	const overHero = HERO_ROUTES.includes(pathname);
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
		const heroes = Array.from(document.querySelectorAll<HTMLElement>('[data-hero]'));
		if (heroes.length === 0) {
			// Route claims a hero but page didn't mark one — fall back to solid
			// pill rather than white text on the paper background.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHeroPassed(true);
			return;
		}
		let frame: number | null = null;
		let previousValue: boolean | null = null;

		const updateHeaderSurface = () => {
			frame = null;

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

		const scheduleUpdate = () => {
			if (frame === null) {
				frame = window.requestAnimationFrame(updateHeaderSurface);
			}
		};

		updateHeaderSurface();
		window.addEventListener('scroll', scheduleUpdate, { passive: true });
		window.addEventListener('resize', scheduleUpdate);

		return () => {
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
							{user ? (
							<div className="flex flex-col gap-1 px-4">
								{/* Card matches the guest panel's rounded-2xl/bg-muted
								    identity block below and AccountMenu's dropdown. */}
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

								{/* Sections separated by space, not hairlines —
								    mirrors account-menu.tsx. */}
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
