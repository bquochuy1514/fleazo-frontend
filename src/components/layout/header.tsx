'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
	Plus,
	MessageCircle,
	ClipboardList,
	User as UserIcon,
	LogOut,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchInput } from '@/components/layout/search-input';
import { DarkSurfaceAmbient } from '@/components/layout/dark-surface-ambient';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '../logo';

export function Header() {
	const { user, isLoading, logout } = useAuth();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<header className="sticky top-0 z-50 overflow-hidden bg-fz-dark-surface">
			{/* Ambient background — shared with Footer, see dark-surface-ambient.tsx */}
			<DarkSurfaceAmbient />

			<div
				className={cn(
					'relative mx-auto max-w-6xl px-4 transition-[padding] duration-300',
					scrolled ? 'py-4' : 'py-6',
				)}
			>
				<div className="flex items-center gap-3">
					{/* Logo: shrinks to the icon-only mark below sm once scrolled,
					    freeing the row for the search bar next to it. Unaffected at
					    sm+ (full wordmark, only the height varies). */}
					<Logo
						mark={scrolled}
						className={cn(
							'transition-[height] duration-300',
							scrolled ? 'h-10' : 'h-11',
						)}
					/>

					{/* Search merges into this row once scrolled — at every
					    breakpoint. Unscrolled, it lives in the full-width row
					    below instead (see below). */}
					{scrolled && (
						<div className="flex-1">
							<SearchInput />
						</div>
					)}

					<div className="ml-auto hidden shrink-0 items-center gap-2 sm:flex">
						{/* Tin nhắn + Quản lý tin: always visible, regardless of
						    auth state — clicking through while logged out is
						    handled by the protected-route guard. */}
						<Link
							href="/tin-nhan"
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'text-white hover:bg-white/10 hover:text-white',
							)}
						>
							<MessageCircle className="size-4" />
							Tin nhắn
						</Link>
						<Link
							href="/quan-ly-tin"
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'text-white hover:bg-white/10 hover:text-white',
							)}
						>
							<ClipboardList className="size-4" />
							Quản lý tin
						</Link>
						<span
							className="mx-1 h-6 w-px shrink-0 bg-white/15"
							aria-hidden="true"
						/>

						{/* Đăng tin sits right next to the avatar/login group —
						    the rightmost cluster — instead of leading the row. */}
						<Link
							href="/dang-tin"
							className={buttonVariants({ variant: 'default' })}
						>
							<Plus className="size-4" />
							Đăng tin
						</Link>

						<span
							className="mx-1 h-6 w-px shrink-0 bg-white/15"
							aria-hidden="true"
						/>

						{isLoading ? (
							// Fixed-size placeholder — avoids a layout jump
							// once the real state (guest vs avatar) resolves.
							// Matches the size-8 avatar below.
							<div className="size-8 shrink-0 animate-pulse rounded-full bg-white/10" />
						) : user ? (
							<DropdownMenu modal={false}>
								{/* Same simple opacity hover as before + press
								    scale — trigger just wraps the avatar. */}
								<DropdownMenuTrigger
									className="shrink-0 cursor-pointer transition hover:opacity-80 active:scale-95"
									aria-label="Tài khoản"
								>
									<Image
										src={user.avatar}
										alt={user.fullName}
										width={32}
										height={32}
										className="size-8 rounded-full object-cover"
									/>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									alignOffset={-16}
									sideOffset={8}
									// Avatar sits inside a `sticky top-0` header.
									// Base UI's default positioning math doesn't
									// track a sticky anchor smoothly during
									// scroll (known upstream issue) — fixed
									// positioning + sticky tracking matches how
									// the anchor itself actually behaves once
									// stuck, removing the jump/jitter.
									positionMethod="fixed"
									sticky
									className="w-64 rounded-xl p-1.5"
								>
									{/* Base UI requires GroupLabel to live inside
									    a Menu.Group — DropdownMenuGroup here. */}
									<DropdownMenuGroup>
										<DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5">
											<Image
												src={user.avatar}
												alt={user.fullName}
												width={32}
												height={32}
												className="size-8 shrink-0 rounded-full object-cover"
											/>
											<div className="flex min-w-0 flex-col gap-0.5">
												<span className="truncate text-sm font-medium">
													{user.fullName}
												</span>
												<span className="truncate text-xs font-normal text-muted-foreground">
													{user.email}
												</span>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator className="my-1" />
										{/* Base UI: render, not asChild (Radix-only
										    pattern) — keeps the item's built-in
										    flex/gap classes merged onto the Link. */}
										<DropdownMenuItem
											render={<Link href="/profile" />}
											className="cursor-pointer gap-2 rounded-lg py-1.5 focus:bg-fz-primary-soft"
										>
											<UserIcon className="size-4 text-muted-foreground" />
											Trang cá nhân
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator className="my-1" />
									<DropdownMenuItem
										variant="destructive"
										onClick={logout}
										// variant="destructive" is what actually
										// stops the item's own default-variant
										// rule (not-data-[variant=destructive]:
										// focus:**:text-accent-foreground) from
										// forcing the icon green on hover — that
										// rule only applies when NOT destructive.
										// The `!` overrides then swap the built-in
										// destructive red for our brand danger
										// token, on both text and icon alike.
										className="cursor-pointer gap-2 rounded-lg py-1.5 text-fz-danger! focus:bg-fz-danger/10! focus:text-fz-danger! [&_svg]:text-fz-danger!"
									>
										<LogOut className="size-4" />
										Đăng xuất
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Link
								href="/login"
								className={cn(
									buttonVariants({ variant: 'ghost' }),
									'text-white hover:bg-white/10 hover:text-white',
								)}
							>
								Đăng nhập
							</Link>
						)}
					</div>
				</div>

				{/* Full-width row: visible only unscrolled, at every breakpoint —
				    this is what makes the header tall at the top. Once scrolled it
				    disappears entirely, merged into the row above instead. */}
				{!scrolled && (
					<div className="mt-4">
						<SearchInput />
					</div>
				)}
			</div>
		</header>
	);
}
