'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { SearchInput } from '@/components/layout/search-input';
import { DarkSurfaceAmbient } from '@/components/layout/dark-surface-ambient';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';

export function Header() {
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
						<Link
							href="/login"
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'text-white hover:bg-white/10 hover:text-white',
							)}
						>
							Đăng nhập
						</Link>
						<Link
							href="/register"
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'text-white hover:bg-white/10 hover:text-white',
							)}
						>
							Đăng ký
						</Link>
						<span
							className="mx-1 h-6 w-px shrink-0 bg-white/15"
							aria-hidden="true"
						/>
						<Link
							href="/dang-tin"
							className={buttonVariants({ variant: 'default' })}
						>
							<Plus className="size-4" />
							Đăng tin
						</Link>
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
