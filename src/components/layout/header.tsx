'use client';

import { useEffect, useState } from 'react';
import { Heart, MessageCircle, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/layout/search-input';
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
		<header className="sticky top-0 z-50 overflow-hidden bg-fz-header">
			{/* Ambient background: drifting blurred blobs + a repeating "tag treo"
			    silhouette (see Design System → Signature element). Decorative
			    only, motion disabled under prefers-reduced-motion (globals.css). */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0"
			>
				<div
					className="fz-header-blob absolute -top-24 -left-16 size-72 rounded-full bg-fz-accent/20 blur-3xl"
					style={{ animationName: 'fz-header-drift-1' }}
				/>
				<div
					className="fz-header-blob absolute -right-10 -bottom-28 size-64 rounded-full bg-fz-primary/15 blur-3xl"
					style={{
						animationName: 'fz-header-drift-2',
						animationDelay: '-7s',
					}}
				/>
				<svg className="absolute inset-0 h-full w-full opacity-[0.07]">
					<defs>
						<pattern
							id="fz-tag-pattern"
							width="72"
							height="72"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(-12)"
						>
							<path
								d="M4 14 L20 14 L30 24 L20 34 L4 34 Z"
								fill="none"
								stroke="white"
								strokeWidth="1.5"
							/>
							<circle cx="9" cy="19" r="1.6" fill="white" />
						</pattern>
					</defs>
					<rect
						width="100%"
						height="100%"
						fill="url(#fz-tag-pattern)"
					/>
				</svg>
			</div>

			<div
				className={cn(
					'relative mx-auto max-w-6xl px-4 transition-[padding] duration-300',
					scrolled ? 'py-2' : 'py-6',
				)}
			>
				<div className="flex items-center gap-3">
					<Logo
						className={cn(
							'transition-[height] duration-300',
							scrolled ? 'h-8' : 'h-10',
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
