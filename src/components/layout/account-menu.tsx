'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
	User as UserIcon,
	Heart,
	Crown,
	Star,
	Settings,
	ShieldCheck,
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
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// Header's rightmost slot — loading skeleton, account dropdown, or the
// guest login link. Pulled out of Header since these three auth states
// are really one self-contained unit, not markup Header itself needs to
// know about.
export function AccountMenu() {
	const { user, isLoading, logout } = useAuth();

	if (isLoading) {
		// Fixed-size placeholder — avoids a layout jump once the real
		// state (guest vs avatar) resolves. Matches the size-8 avatar below.
		return (
			<div className="size-8 shrink-0 animate-pulse rounded-full bg-white/10" />
		);
	}

	if (!user) {
		return (
			<Link
				href="/dang-nhap"
				className={cn(
					buttonVariants({ variant: 'ghost' }),
					'text-white hover:bg-white/10 hover:text-white',
				)}
			>
				Đăng nhập
			</Link>
		);
	}

	// Routes below (saved/membership/reviews/settings/admin) are placeholders
	// — pages don't exist yet, same as BottomNav's placeholder routes. Update
	// hrefs once each page lands.
	return (
		<DropdownMenu modal={false}>
			{/* Same simple opacity hover as before + press scale — trigger
			    just wraps the avatar. */}
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
				alignOffset={-28}
				sideOffset={12}
				// Avatar sits inside a `sticky top-0` header. Base UI's
				// default positioning math doesn't track a sticky anchor
				// smoothly during scroll (known upstream issue) — fixed
				// positioning + sticky tracking matches how the anchor
				// itself actually behaves once stuck, removing the jitter.
				positionMethod="fixed"
				sticky
				className="w-64 rounded-xl p-1.5"
			>
				{/* Base UI requires GroupLabel to live inside a Menu.Group
				    — DropdownMenuGroup here. */}
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
					{/* Base UI: render, not asChild (Radix-only pattern) —
					    keeps the item's built-in flex/gap classes merged
					    onto the Link. Route matches BottomNav's `/ca-nhan`
					    (was `/profile` — two different routes for the same
					    page, fixed to the Vietnamese-slug convention used
					    everywhere else). */}
					<DropdownMenuItem
						render={<Link href="/ca-nhan" />}
						className="cursor-pointer gap-2 rounded-lg py-1.5 focus:bg-fz-primary-soft"
					>
						<UserIcon className="size-4 text-muted-foreground" />
						Trang cá nhân
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="my-1" />

				{/* Section header — small uppercase muted label, distinct
				    from the profile header above (no avatar, just a divider
				    for scanability once the menu has this many items).
				    Base UI requires GroupLabel to live inside the same
				    Menu.Group as the items it labels — same rule as above. */}
				<DropdownMenuGroup>
					<DropdownMenuLabel className="px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
						Tài khoản
					</DropdownMenuLabel>
					<DropdownMenuItem
						render={<Link href="/goi-thanh-vien" />}
						className="cursor-pointer gap-2 rounded-lg py-1.5 focus:bg-fz-primary-soft"
					>
						<Crown className="size-4 text-muted-foreground" />
						Gói thành viên
					</DropdownMenuItem>
					<DropdownMenuItem
						render={<Link href="/cai-dat" />}
						className="cursor-pointer gap-2 rounded-lg py-1.5 focus:bg-fz-primary-soft"
					>
						<Settings className="size-4 text-muted-foreground" />
						Đổi mật khẩu / Cài đặt
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuGroup>
					<DropdownMenuLabel className="px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
						Hoạt động
					</DropdownMenuLabel>
					<DropdownMenuItem
						render={<Link href="/tin-da-luu" />}
						className="cursor-pointer gap-2 rounded-lg py-1.5 focus:bg-fz-primary-soft"
					>
						<Heart className="size-4 text-muted-foreground" />
						Tin đã lưu
					</DropdownMenuItem>
					<DropdownMenuItem
						render={<Link href="/danh-gia-cua-toi" />}
						className="cursor-pointer gap-2 rounded-lg py-1.5 focus:bg-fz-primary-soft"
					>
						<Star className="size-4 text-muted-foreground" />
						Đánh giá của tôi
					</DropdownMenuItem>
				</DropdownMenuGroup>
				{/* Admin-only — assumes `User.role` is exposed on the
				    frontend User type matching backend's UserRole enum.
				    Double-check the exact field/value once user.types.ts
				    is confirmed. */}
				{user.role === 'ADMIN' && (
					<>
						<DropdownMenuSeparator className="my-1" />
						<DropdownMenuGroup>
							<DropdownMenuLabel className="px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
								Quản trị
							</DropdownMenuLabel>
							<DropdownMenuItem
								render={<Link href="/admin" />}
								className="cursor-pointer gap-2 rounded-lg py-1.5 focus:bg-fz-primary-soft"
							>
								<ShieldCheck className="size-4 text-muted-foreground" />
								Trang quản trị
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</>
				)}
				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem
					variant="destructive"
					onClick={logout}
					className="cursor-pointer gap-2 rounded-lg py-1.5 text-fz-danger! focus:bg-fz-danger/10! focus:text-fz-danger! [&_svg]:text-fz-danger!"
				>
					<LogOut className="size-4" />
					Đăng xuất
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
