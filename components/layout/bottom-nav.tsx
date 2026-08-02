'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ClipboardList, Home, MessageCircle, User, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
	{ href: '/', label: 'Trang chủ', icon: Home },
	{ href: '/quan-ly-tin', label: 'Quản lý tin', icon: ClipboardList },
	{ href: '/tin-nhan', label: 'Tin nhắn', icon: MessageCircle },
	{ href: '/ca-nhan', label: 'Cá nhân', icon: User },
] as const;

// Mobile-only tab bar — the header keeps the desktop "Đăng tin" CTA instead.
// Active state uses ink weight rather than the moss accent, which is reserved
// for prices and the save toggle. "Cá nhân" swaps its icon for the signed-in
// user's avatar (see NavLink's `avatar` prop), matching Header's own
// AccountMenu; "Tin nhắn" still carries no unread badge — that needs a
// message count this repo doesn't fetch anywhere yet, unrelated to auth.
//
// "Quản lý tin", "Tin nhắn", "Đăng tin" and "Cá nhân" are all sign-in-only —
// there's no session state here to branch on, so each just points at its real
// route and leans on the (planned) ProtectedGuard/proxy.ts to redirect a
// signed-out tap to /dang-nhap. Deliberate: a guest sees the full tab bar
// rather than a crippled one, and discovers what exists before being asked to
// sign in for it. There is no "Danh mục" tab — with no cart/wishlist funnel to
// browse toward, category discovery lives on the homepage instead (chips below
// the hero) and inside search's own sidebar filter, not as a fifth destination
// here.
export function BottomNav() {
	const pathname = usePathname();
	const { user } = useAuth();

	return (
		<nav
			aria-label="Điều hướng chính"
			className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
		>
			<div className="mx-auto grid h-16 max-w-6xl grid-cols-5 items-center px-2">
				{NAV_ITEMS.slice(0, 2).map((item) => (
					<NavLink
						key={item.href}
						item={item}
						active={pathname === item.href}
					/>
				))}

				{/* Raised action, not a regular tab. Its own grid column (rather
				    than flex spacing) keeps it centred no matter how long the
				    neighbouring labels get. */}
				<Link
					href="/dang-tin"
					aria-label="Đăng tin"
					className="flex -translate-y-4 flex-col items-center gap-1 justify-self-center"
				>
					<span className="flex size-12 items-center justify-center rounded-full bg-fz-ink text-white shadow-lg ring-4 ring-background transition-transform active:scale-95">
						<Plus className="size-5" />
					</span>
					<span className="text-[11px] font-medium text-fz-ink">
						Đăng tin
					</span>
				</Link>

				{NAV_ITEMS.slice(2).map((item) => (
					<NavLink
						key={item.href}
						item={item}
						active={pathname === item.href}
						// Only "Cá nhân" ever gets an avatar — the other slots
						// keep their lucide icon regardless of auth state.
						avatar={
							item.href === '/ca-nhan' ? user?.avatar : undefined
						}
					/>
				))}
			</div>
		</nav>
	);
}

function NavLink({
	item,
	active,
	avatar,
}: {
	item: (typeof NAV_ITEMS)[number];
	active: boolean;
	avatar?: string;
}) {
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			aria-current={active ? 'page' : undefined}
			className={cn(
				'flex flex-col items-center gap-1 justify-self-center px-1 text-[11px] whitespace-nowrap transition-colors',
				active
					? 'font-medium text-fz-ink'
					: 'text-muted-foreground hover:text-fz-ink',
			)}
		>
			{/* Fixed-height slot keeps every label on the same baseline. */}
			<span className="flex h-7 items-center justify-center">
				{avatar ? (
					<Image
						src={avatar}
						alt=""
						width={22}
						height={22}
						className={cn(
							'size-6 rounded-full object-cover ring-1',
							active ? 'ring-fz-ink' : 'ring-border',
						)}
					/>
				) : (
					<Icon className="size-5" />
				)}
			</span>
			{item.label}
		</Link>
	);
}
