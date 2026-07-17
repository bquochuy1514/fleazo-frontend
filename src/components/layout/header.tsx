import Link from 'next/link';
import { LayoutGrid, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
	return (
		<header className="sticky top-0 z-50 border-b bg-background">
			<div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
				{/* Logo */}
				<Link
					href="/"
					className="shrink-0 text-2xl font-bold text-primary"
				>
					Fleazo
				</Link>

				{/* Category dropdown — placeholder, wired up when Categories module is built */}
				<Button
					variant="ghost"
					className="hidden shrink-0 md:inline-flex"
				>
					<LayoutGrid />
					Danh mục
				</Button>

				{/* Search — static for now, becomes a real search form later */}
				<div className="flex h-9 flex-1 items-center gap-2 rounded-4xl border bg-input/30 px-3">
					<Search className="size-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Tìm kiếm sản phẩm..."
						className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					/>
				</div>

				{/* Right side — logged-out state only for now; swaps to avatar/chat/saved after auth is built */}
				<div className="flex shrink-0 items-center gap-2">
					<Button
						variant="ghost"
						className="hidden sm:inline-flex"
						asChild
					>
						<Link href="/login">Đăng nhập</Link>
					</Button>
					<Button
						variant="outline"
						className="hidden sm:inline-flex"
						asChild
					>
						<Link href="/register">Đăng ký</Link>
					</Button>
					<Button asChild>
						<Link href="/dang-tin">
							<PlusCircle />
							Đăng tin
						</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
