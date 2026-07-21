'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, FileText, Heart, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// Routes are placeholders — (protected) pages for these don't exist yet
// (see AGENTS.md → Project Structure). Update hrefs once each page lands.
// "Cá nhân" isn't in this array — it's special-cased below (avatar vs icon).
const NAV_ITEMS = [
	{ href: '/', label: 'Trang chủ', icon: Home },
	{ href: '/quan-ly-tin', label: 'Quản lý tin', icon: FileText },
	{ href: '/tin-luu', label: 'Tin đã lưu', icon: Heart },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

// Mobile-only tab bar (hidden sm+, header keeps the desktop "Đăng tin" CTA
// instead — see AGENTS.md → Header surface). Center "Đăng bán" sits above
// the bar as a raised circular action, matching the reference mockup.
export function BottomNav() {
	const pathname = usePathname();
	const { user } = useAuth();
	const profileActive = pathname === '/ca-nhan';

	return (
		<nav
			aria-label="Điều hướng chính"
			className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
		>
			<div className="mx-auto grid h-16 max-w-6xl grid-cols-5 items-center px-2">
				{NAV_ITEMS.slice(0, 2).map((item) => (
					<NavLink
						key={item.href}
						item={item}
						active={pathname === item.href}
					/>
				))}

				{/* Đăng bán: raised action, not a regular tab — routes to the
				    post-creation flow once it exists. Grid column (not flex
				    justify-around) keeps it truly centered regardless of how
				    long the neighboring labels are. */}
				<Link
					href="/dang-tin"
					aria-label="Đăng bán"
					className="-translate-y-4 flex flex-col items-center gap-1 justify-self-center"
				>
					<span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-fz-accent-deep to-fz-accent-bright text-white shadow-lg shadow-fz-accent-deep/30 ring-4 ring-white transition-transform active:scale-95">
						<Plus className="size-5" />
					</span>
					<span className="text-[11px] font-medium text-fz-ink">
						Đăng bán
					</span>
				</Link>

				{NAV_ITEMS.slice(2).map((item) => (
					<NavLink
						key={item.href}
						item={item}
						active={pathname === item.href}
					/>
				))}

				<Link
					href="/ca-nhan"
					className={cn(
						'flex flex-col items-center justify-self-center gap-1 px-1 text-[11px] whitespace-nowrap transition-colors',
						profileActive
							? 'text-fz-primary'
							: 'text-muted-foreground hover:text-fz-ink',
					)}
				>
					<span className="flex h-7 items-center justify-center">
						{user ? (
							<Image
								src={user.avatar}
								alt={user.fullName}
								width={28}
								height={28}
								className={cn(
									'size-7 rounded-full object-cover',
									profileActive && 'ring-2 ring-fz-primary',
								)}
							/>
						) : (
							<User className="size-5" />
						)}
					</span>
					Cá nhân
				</Link>
			</div>
		</nav>
	);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			className={cn(
				'flex flex-col items-center justify-self-center gap-1 px-1 text-[11px] whitespace-nowrap transition-colors',
				active
					? 'text-fz-primary'
					: 'text-muted-foreground hover:text-fz-ink',
			)}
		>
			{/* Fixed-height slot — keeps every label at the same vertical
			    offset regardless of what's rendered inside (icon vs avatar,
			    see the Cá nhân link below which reuses this same h-7). */}
			<span className="flex h-7 items-center justify-center">
				<Icon className="size-5" />
			</span>
			{item.label}
		</Link>
	);
}
