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

// Same recipe as PickerOption (components/ui/picker.tsx) — rounded-full,
// plain hover:bg-muted with an actual transition. The dropdown-menu.tsx
// primitive's own default (rounded-md, tight px-1.5 py-1, no transition at
// all) is what made this menu feel like a stock shadcn kit sitting next to a
// component that got real design attention.
// py-1.5, not Picker's own py-2.5/py-3.5 — this is a mouse-only desktop
// dropdown (the Sheet in header.tsx is the touch-target-sized mobile
// equivalent), so it doesn't owe every row the 44px floor a tap target
// does. At 7 items + 3 group labels + the identity card, py-2.5 stacked up
// into a noticeably tall menu for what it shows.
const ITEM =
	'cursor-pointer gap-2.5 rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-muted focus:bg-muted';
// Same shape, danger-tinted hover instead of neutral — for "Đăng xuất" only.
const ITEM_DANGER = cn(
	ITEM,
	'hover:bg-fz-danger/10 focus:bg-fz-danger/10',
);

// Header's avatar slot, right of "Đăng tin" — self-contained (reads
// useAuth() itself, renders nothing while logged out) so Header only has to
// place it, not branch on auth state itself. Same content as the mobile
// Sheet's logged-in panel in header.tsx — keep the two in sync.
//
// The "Tin đã lưu" item here isn't a duplicate of the header's Heart icon:
// that one is meant to become a quick hover/click preview dropdown of saved
// listings without a page load, this one is a normal link straight to the
// full /tin-da-luu page. Two different jobs, same destination page.
export function AccountMenu() {
	const { user, logout } = useAuth();

	if (!user) return null;

	return (
		// modal={false}: Radix's modal dropdown locks body scroll while open
		// (adds scrollbar-gutter compensation, then removes it on close) —
		// on this page that's a visible width jump/scrollbar flicker every
		// open/close, the same failure already hit and fixed this way in
		// fleazo-frontend's own AccountMenu. Non-modal just closes on
		// outside click/Escape instead, which is all this menu needs.
		<DropdownMenu modal={false}>
			{/* size-10, not a bare 32px circle: Heart/Tin nhắn next to this
			    are also size-10 ghost buttons, and without the same
			    invisible padding the avatar read as sitting tighter against
			    "Đăng tin" than those two do against each other, even though
			    the gap between them is the same CSS gap-2. */}
			{/* ring-2 ring-transparent (not just adding ring-2 on open):
			    the transparent ring reserves the same box size up front, so
			    the color-only transition on open doesn't nudge anything
			    else in the header pill by a couple of px. This is the one
			    piece of motion this menu gets — a real state signal (open
			    vs closed), not decoration, and it's exactly why a whole
			    per-item entrance stagger is deliberately NOT here: this
			    list is read, not watched. */}
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
				{/* Filled card, not a bare label row — same bg-muted identity
				    treatment the mobile Sheet's own guest panel already uses
				    (see header.tsx). rounded-lg, not that panel's
				    rounded-2xl: this card sits INSIDE DropdownMenuContent's
				    own rounded-lg shell with only ~4px of padding around it
				    (p-1 on the content), so a bigger radius than its
				    container read as a mismatched, competing curve rather
				    than a nested one — a child's corner should read as equal
				    to or tighter than its parent's, never looser. */}
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

				{/* Sections separated by space, not another hairline —
				    five thin rules stacked this close together was reading
				    as sliced-up rather than organized. The identity card
				    above and the rule before "Đăng xuất" below are the two
				    boundaries that actually carry meaning (who you are,
				    then the destructive exit), so those are the only ones
				    that stay. */}
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

				{/* Assumes User.role is exposed on the frontend type matching
				    the backend's UserRole enum — same assumption fleazo-frontend
				    makes for this same check. */}
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
