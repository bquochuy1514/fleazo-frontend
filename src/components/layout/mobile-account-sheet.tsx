'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
	Menu,
	User as UserIcon,
	Heart,
	Crown,
	Star,
	Settings,
	ShieldCheck,
	LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetClose,
} from '@/components/ui/sheet';

// Mobile equivalent of the desktop account dropdown (see account-menu.tsx)
// — quick access to account actions from any page, same role the PC
// dropdown plays. BottomNav's "Cá nhân" tab still exists separately and
// goes straight to the full /ca-nhan profile page (see AGENTS.md →
// Component conventions → Account menu) — this panel is for everything
// beyond that, mirroring exactly what the desktop dropdown holds.
// Slides in from the right (not a bottom sheet) since the trigger itself
// sits at the header's top-right corner.
export function MobileAccountSheet({ className }: { className?: string }) {
	const { user, logout } = useAuth();

	// Routes below are placeholders — pages don't exist yet, same caveat
	// as account-menu.tsx and BottomNav.
	return (
		<Sheet>
			{/* Always the same generic icon regardless of auth state —
			    BottomNav's "Cá nhân" tab already shows the avatar, so this
			    trigger deliberately doesn't repeat it. */}
			<SheetTrigger
				className={cn(
					'flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 active:scale-95',
					className,
				)}
				aria-label="Menu tài khoản"
			>
				<Menu className="size-5" />
			</SheetTrigger>

			<SheetContent side="right" className="flex w-72 flex-col gap-1 p-3">
				{user ? (
					<>
						<SheetHeader className="flex-row items-center gap-2 p-2">
							<Image
								src={user.avatar}
								alt={user.fullName}
								width={40}
								height={40}
								className="size-10 shrink-0 rounded-full object-cover ring-2 ring-fz-primary-soft"
							/>
							<div className="flex min-w-0 flex-col gap-0.5">
								<SheetTitle className="truncate text-sm font-medium">
									{user.fullName}
								</SheetTitle>
								<span className="truncate text-xs text-muted-foreground">
									{user.email}
								</span>
							</div>
						</SheetHeader>

						<div className="my-1 h-px bg-border" />

						<SheetClose
							render={<Link href="/ca-nhan" />}
							nativeButton={false}
							className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm active:bg-fz-primary-soft"
						>
							<UserIcon className="size-5 text-muted-foreground" />
							Trang cá nhân
						</SheetClose>

						<div className="mt-2 mb-1 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
							Tài khoản
						</div>
						<SheetClose
							render={<Link href="/goi-thanh-vien" />}
							nativeButton={false}
							className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm active:bg-fz-primary-soft"
						>
							<Crown className="size-5 text-muted-foreground" />
							Gói thành viên
						</SheetClose>
						<SheetClose
							render={<Link href="/cai-dat" />}
							nativeButton={false}
							className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm active:bg-fz-primary-soft"
						>
							<Settings className="size-5 text-muted-foreground" />
							Đổi mật khẩu / Cài đặt
						</SheetClose>

						<div className="mt-2 mb-1 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
							Hoạt động
						</div>
						<SheetClose
							render={<Link href="/tin-da-luu" />}
							nativeButton={false}
							className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm active:bg-fz-primary-soft"
						>
							<Heart className="size-5 text-muted-foreground" />
							Tin đã lưu
						</SheetClose>
						<SheetClose
							render={<Link href="/danh-gia-cua-toi" />}
							nativeButton={false}
							className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm active:bg-fz-primary-soft"
						>
							<Star className="size-5 text-muted-foreground" />
							Đánh giá của tôi
						</SheetClose>

						{/* Admin-only — same assumption as account-menu.tsx:
						    `User.role` must exist on the frontend User type. */}
						{user.role === 'ADMIN' && (
							<>
								<div className="mt-2 mb-1 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
									Quản trị
								</div>
								<SheetClose
									render={<Link href="/admin" />}
									nativeButton={false}
									className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm active:bg-fz-primary-soft"
								>
									<ShieldCheck className="size-5 text-muted-foreground" />
									Trang quản trị
								</SheetClose>
							</>
						)}

						<div className="my-1 h-px bg-border" />

						<SheetClose
							onClick={logout}
							className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm text-fz-danger active:bg-fz-danger/10 [&_svg]:text-fz-danger"
						>
							<LogOut className="size-5" />
							Đăng xuất
						</SheetClose>
					</>
				) : (
					// Not logged in — the mobile trigger is a generic Menu
					// icon regardless of auth state (unlike desktop, where
					// guests just see a plain "Đăng nhập" link directly in
					// the header, no dropdown at all), so this panel needs
					// to stand on its own rather than being a single bare
					// link.
					<div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
						<div className="flex size-14 items-center justify-center rounded-full bg-fz-primary-soft">
							<UserIcon className="size-7 text-fz-primary" />
						</div>
						<div className="flex flex-col gap-1">
							<SheetTitle className="text-base font-semibold">
								Bạn chưa đăng nhập
							</SheetTitle>
							<p className="text-sm text-muted-foreground">
								Đăng nhập để lưu tin, nhắn tin và đăng bán trên
								Fleazo.
							</p>
						</div>
						<div className="flex w-full flex-col gap-2 pt-2">
							<SheetClose
								render={<Link href="/dang-nhap" />}
								nativeButton={false}
								className={buttonVariants({
									variant: 'default',
								})}
							>
								Đăng nhập
							</SheetClose>
							<SheetClose
								render={<Link href="/dang-ky" />}
								nativeButton={false}
								className={buttonVariants({
									variant: 'outline',
								})}
							>
								Đăng ký tài khoản
							</SheetClose>
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
