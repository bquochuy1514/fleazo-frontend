'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
	ClipboardList,
	Crown,
	Heart,
	LogOut,
	Settings,
	ShieldCheck,
	Star,
	UserRound,
} from 'lucide-react';
import { SheetClose } from '@/components/ui/sheet';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// Same recipe as PickerOption and AccountMenu's ITEM (account-menu.tsx, kept
// in sync with this file) — rounded-full, transition-colors.
const SHEET_ITEM =
	'flex items-center gap-3 rounded-full px-3 py-3 text-sm text-fz-ink transition-colors duration-200 active:bg-muted';

// The account Sheet's body — shared between Header's mobile hamburger menu
// and ChatAppBar's mobile avatar trigger, so both land on the same account
// destinations instead of drifting into two different mobile menus.
// Self-contained (reads useAuth() itself), caller supplies SheetHeader/title.
export function AccountSheetContent() {
	const { user, logout } = useAuth();

	if (!user) {
		return (
			<div className="px-4">
				<div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3.5">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card">
						<UserRound className="size-5 text-muted-foreground" />
					</span>
					<div className="min-w-0">
						<p className="font-medium text-fz-ink">Bạn chưa đăng nhập</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Đăng nhập để nhắn tin, lưu tin và đăng tin của mình.
						</p>
					</div>
				</div>

				<div className="mt-4 flex flex-col gap-2">
					<Link href="/dang-nhap" className={cn(buttonVariants({ variant: 'default' }), 'h-11')}>
						Đăng nhập
					</Link>
					<Link href="/dang-ky" className={cn(buttonVariants({ variant: 'outline' }), 'h-11')}>
						Đăng ký
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1 px-4">
			{/* Card matches the guest panel's rounded-2xl/bg-muted identity
			    block above and AccountMenu's dropdown. */}
			<div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3.5">
				<Image
					src={user.avatar}
					alt={user.fullName}
					width={40}
					height={40}
					className="size-10 shrink-0 rounded-full object-cover"
				/>
				<div className="min-w-0">
					<p className="truncate text-sm font-medium text-fz-ink">{user.fullName}</p>
					<p className="truncate text-xs text-muted-foreground">{user.email}</p>
				</div>
			</div>

			<SheetClose asChild>
				<Link href="/ca-nhan" className={cn('mt-1', SHEET_ITEM)}>
					<UserRound className="size-5 text-muted-foreground" />
					Trang cá nhân
				</Link>
			</SheetClose>

			{/* Sections separated by space, not hairlines — mirrors account-menu.tsx. */}
			<div className="mt-2 px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
				Tài khoản
			</div>
			<SheetClose asChild>
				<Link href="/goi-thanh-vien" className={SHEET_ITEM}>
					<Crown className="size-5 text-muted-foreground" />
					Gói thành viên
				</Link>
			</SheetClose>
			<SheetClose asChild>
				<Link href="/cai-dat" className={SHEET_ITEM}>
					<Settings className="size-5 text-muted-foreground" />
					Đổi mật khẩu / Cài đặt
				</Link>
			</SheetClose>

			<div className="mt-2 px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
				Hoạt động
			</div>
			<SheetClose asChild>
				<Link href="/quan-ly-tin" className={SHEET_ITEM}>
					<ClipboardList className="size-5 text-muted-foreground" />
					Quản lý tin
				</Link>
			</SheetClose>
			<SheetClose asChild>
				<Link href="/tin-da-luu" className={SHEET_ITEM}>
					<Heart className="size-5 text-muted-foreground" />
					Tin đã lưu
				</Link>
			</SheetClose>
			<SheetClose asChild>
				<Link href="/danh-gia-cua-toi" className={SHEET_ITEM}>
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
						<Link href="/admin" className={SHEET_ITEM}>
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
					className={cn(SHEET_ITEM, 'text-left text-fz-danger active:bg-fz-danger/10')}
				>
					<LogOut className="size-5" />
					Đăng xuất
				</button>
			</SheetClose>
		</div>
	);
}
