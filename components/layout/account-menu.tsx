'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
	User as UserIcon,
	Crown,
	Settings,
	ClipboardList,
	Heart,
	Star,
	ShieldCheck,
	LogOut,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// Same recipe as PickerOption (components/ui/picker.tsx): rounded-full,
// hover:bg-muted with a transition, unlike dropdown-menu.tsx's plain default.
// py-1.5, not Picker's py-2.5/py-3.5 — mouse-only desktop dropdown, doesn't
// need the 44px tap-target floor (Sheet in header.tsx covers mobile).
const ITEM =
	'cursor-pointer gap-2.5 rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-muted focus:bg-muted';
// Same shape, danger-tinted hover instead of neutral — for "Đăng xuất" only.
const ITEM_DANGER = cn(
	ITEM,
	'hover:bg-fz-danger/10 focus:bg-fz-danger/10',
);

// Header's avatar slot — self-contained (reads useAuth(), renders nothing
// logged out). Mirrors the mobile Sheet's logged-in panel in header.tsx;
// keep the two in sync.
// "Tin đã lưu" here is a plain link to /tin-da-luu, distinct from the
// header's Heart icon (a planned hover-preview dropdown).
export function AccountMenu() {
	const { user, logout } = useAuth();

	if (!user) return null;

	return (
		// modal={false}: Radix's modal dropdown locks body scroll, causing a
		// scrollbar-gutter width jump on open/close. Non-modal avoids it.
		<DropdownMenu modal={false}>
			{/* size-10, matching Heart/Tin nhắn's size-10 ghost buttons nearby. */}
			{/* ring-2 ring-transparent reserves box size up front so the
			    color-only transition on open doesn't shift the header pill. */}
			<DropdownMenuTrigger
				className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full ring-2 ring-transparent transition-all duration-200 hover:opacity-80 active:scale-95 data-[state=open]:ring-fz-ink/15"
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

			<DropdownMenuContent align="end" sideOffset={12} className="w-64">
				{/* Filled card, same bg-muted identity treatment as the mobile
				    Sheet's guest panel. rounded-lg (not rounded-2xl) since it
				    sits inside DropdownMenuContent's own rounded-lg shell with
				    little padding — child radius shouldn't exceed parent's. */}
				<DropdownMenuLabel className="mb-1 flex items-center gap-3 rounded-lg bg-muted px-3.5 py-3">
					<Image
						src={user.avatar}
						alt={user.fullName}
						width={32}
						height={32}
						className="size-8 shrink-0 rounded-full object-cover"
					/>
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="truncate text-sm font-medium text-fz-ink">
							{user.fullName}
						</span>
						<span className="truncate text-xs font-normal text-muted-foreground">
							{user.email}
						</span>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuItem asChild className={ITEM}>
					<Link href="/ca-nhan">
						<UserIcon className="size-4 text-muted-foreground" />
						Trang cá nhân
					</Link>
				</DropdownMenuItem>

				{/* Sections separated by space, not hairlines — only the identity
				    card and the rule before "Đăng xuất" carry real meaning. */}
				<DropdownMenuGroup className="mt-1">
					<DropdownMenuLabel className="px-2 pt-0.5 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
						Tài khoản
					</DropdownMenuLabel>
					<DropdownMenuItem asChild className={ITEM}>
						<Link href="/goi-thanh-vien">
							<Crown className="size-4 text-muted-foreground" />
							Gói thành viên
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className={ITEM}>
						<Link href="/cai-dat">
							<Settings className="size-4 text-muted-foreground" />
							Đổi mật khẩu / Cài đặt
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuGroup className="mt-1">
					<DropdownMenuLabel className="px-2 pt-0.5 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
						Hoạt động
					</DropdownMenuLabel>
					<DropdownMenuItem asChild className={ITEM}>
						<Link href="/quan-ly-tin">
							<ClipboardList className="size-4 text-muted-foreground" />
							Quản lý tin
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className={ITEM}>
						<Link href="/tin-da-luu">
							<Heart className="size-4 text-muted-foreground" />
							Tin đã lưu
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className={ITEM}>
						<Link href="/danh-gia-cua-toi">
							<Star className="size-4 text-muted-foreground" />
							Đánh giá của tôi
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				{/* Assumes User.role matches the backend's UserRole enum. */}
				{user.role === 'ADMIN' && (
					<DropdownMenuGroup className="mt-1">
						<DropdownMenuLabel className="px-2 pt-0.5 pb-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
							Quản trị
						</DropdownMenuLabel>
						<DropdownMenuItem asChild className={ITEM}>
							<Link href="/admin">
								<ShieldCheck className="size-4 text-muted-foreground" />
								Trang quản trị
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				)}

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem
					variant="destructive"
					onClick={logout}
					className={ITEM_DANGER}
				>
					<LogOut className="size-4" />
					Đăng xuất
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
