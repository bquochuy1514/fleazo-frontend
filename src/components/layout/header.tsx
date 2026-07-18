'use client';

import { useEffect, useState } from 'react';
import { Heart, MessageCircle, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
					<Logo
						className={cn(
							'transition-[height] duration-300',
							scrolled ? 'h-10' : 'h-11',
						)}
					/>

					{/* Middle slot: empty at the top (content TBD), fills with
					    search once scrolled. Div stays in the flex row either way
					    so actions still gets pushed right. */}
					<div className="hidden flex-1 sm:block">
						{scrolled && <SearchInput />}
					</div>

					{/* Guest-state placeholder — TODO: real auth state (Zustand). */}
					<div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
						<Button
							variant="default"
							className="mr-1 hidden sm:inline-flex"
						>
							<Plus className="size-4" />
							Đăng tin
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/10 hover:text-white"
							aria-label="Đã lưu"
						>
							<Heart className="size-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/10 hover:text-white"
							aria-label="Tin nhắn"
						>
							<MessageCircle className="size-5" />
						</Button>
						<span
							className="mx-1 h-6 w-px shrink-0 bg-white/15"
							aria-hidden="true"
						/>
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/10 hover:text-white"
							aria-label="Tài khoản"
						>
							<User className="size-5" />
						</Button>
					</div>
				</div>

				{/* Full-width row: visible whenever unscrolled (any breakpoint —
				    this is what makes the header tall at the top). Collapses at
				    sm+ once scrolled (merged into the row above instead), but
				    stays below sm so it never squeezes next to the logo + icons. */}
				<div
					className={cn(
						'transition-[margin] duration-300',
						scrolled ? 'mt-2 sm:hidden' : 'mt-4',
					)}
				>
					<SearchInput />
				</div>
			</div>
		</header>
	);
}
