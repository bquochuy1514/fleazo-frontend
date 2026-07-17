import Link from 'next/link';
import {
	ChevronDown,
	Search,
	Heart,
	MessageCircle,
	User,
	Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';

// Header lives in (main)/layout.tsx so both (public) and (protected) pages get it.
// See AGENTS.md → Project Structure.
//
// Surface color is an intentional exception to the page background: this header
// uses --color-fz-header (dark navy, sampled from the reference mockup), not
// --background, because the real logo has a white wordmark. See AGENTS.md →
// Design System → Header surface. Every child element below is styled
// explicitly for a dark background (white text/icons) — don't reuse shadcn's
// default text-foreground here, it assumes a light surface.
export function Header() {
	return (
		<header className="sticky top-0 z-50 bg-fz-header">
			<div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
				{/* Logo — see AGENTS.md → Design System → Header surface for why
				    this asset only works on light backgrounds for now. */}
				<Logo />

				{/* Category dropdown — placeholder only, no real menu yet.
				    TODO: replace with the interactive CategoryMegaMenu (client
				    component) discussed separately — 3-column parent/child/
				    products panel, needs GET /categories + GET /products. */}
				<Button
					variant="ghost"
					className={cn(
						'hidden shrink-0 items-center gap-1 text-white hover:bg-white/10 hover:text-white sm:flex',
					)}
				>
					Danh mục
					<ChevronDown className="size-4" />
				</Button>

				{/* Search bar — placeholder only, not wired to product search yet.
				    White pill floating on the navy bar, not the default input
				    style (which assumes a light page background). */}
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						placeholder="Tìm kiếm sản phẩm..."
						className="h-10 w-full rounded-md border-0 bg-white pl-9 pr-3 text-sm text-fz-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-fz-accent"
					/>
				</div>

				{/* Right-side actions — guest placeholder.
				    TODO: swap for real auth state once the auth module + client
				    state store (Zustand, see AGENTS.md → Tech Stack) exist. */}
				<div className="flex shrink-0 items-center gap-2">
					<Button variant="default" className="hidden sm:inline-flex">
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
		</header>
	);
}
