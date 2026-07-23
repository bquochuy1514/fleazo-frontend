'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, MessageCircle, ClipboardList } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { AccountMenu } from '@/components/layout/account-menu';
import { MobileAccountSheet } from '@/components/layout/mobile-account-sheet';
import { SearchInput } from '@/components/layout/search-input';
import { DarkSurfaceAmbient } from '@/components/dark-surface-ambient';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';

export function Header() {
	const headerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const el = headerRef.current;
		if (!el) return;

		const observer = new ResizeObserver(([entry]) => {
			document.documentElement.style.setProperty(
				'--header-height',
				`${entry.contentRect.height}px`,
			);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<header
			ref={headerRef}
			className="fixed inset-x-0 top-0 z-50 overflow-hidden bg-fz-dark-surface"
		>
			{/* Ambient background — shared with Footer, see dark-surface-ambient.tsx */}
			<DarkSurfaceAmbient />

			<div className="relative mx-auto max-w-6xl px-4 py-4">
				<div className="flex items-center gap-3">
					<Logo className="h-11" mark />

					<div className="flex-1">
						<SearchInput />
					</div>

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

						{/* Loading skeleton / account dropdown / guest login
						    link — see src/components/layout/account-menu.tsx. */}
						<AccountMenu />
					</div>

					{/* Mobile equivalent of the desktop account dropdown —
					    quick account actions from a right-side sheet, since
					    the whole cluster above is hidden below sm. See
					    mobile-account-sheet.tsx. */}
					<MobileAccountSheet className="shrink-0 sm:hidden" />
				</div>
			</div>
		</header>
	);
}
