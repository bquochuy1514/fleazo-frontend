import Link from 'next/link';
import { MessageCircle, Menu, Plus } from 'lucide-react';
import { Logo } from '@/components/logo';
import { HeaderSearch } from '@/components/layout/header-search';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
	{ href: '/', label: 'Trang chủ' },
	{ href: '/danh-muc', label: 'Danh mục' },
];

// Floating inset pill, not a full-bleed bar — it overlays the page rather
// than occupying flow space, so the homepage hero image shows through on
// both sides and above it. Any page WITHOUT a full-bleed hero of its own
// must add its own top padding to clear this (see AGENTS.md → Layout).
// No auth state wired up yet, so the messages icon and "Đăng nhập" link are
// static placeholders, not yet reading a real session.
export function Header() {
	return (
		<header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
			<div className="mx-auto flex h-16 max-w-6xl items-center gap-4 rounded-full border border-border/70 bg-card/90 px-4 shadow-sm backdrop-blur-md sm:px-5">
				<Logo />

				<nav className="hidden items-center gap-1 md:flex">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'text-fz-ink',
							)}
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-1.5">
					<HeaderSearch />
					<Link
						href="/tin-nhan"
						aria-label="Tin nhắn"
						className={cn(
							buttonVariants({ variant: 'ghost', size: 'icon' }),
							'hidden sm:inline-flex',
						)}
					>
						<MessageCircle className="size-5" />
					</Link>

					<Link
						href="/dang-tin"
						className={cn(
							buttonVariants({ variant: 'default' }),
							'hidden sm:inline-flex',
						)}
					>
						<Plus className="size-4" />
						Đăng tin
					</Link>
					<Link
						href="/dang-nhap"
						className={cn(
							buttonVariants({ variant: 'outline' }),
							'hidden md:inline-flex',
						)}
					>
						Đăng nhập
					</Link>

					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								aria-label="Mở menu"
								className="md:hidden"
							>
								<Menu className="size-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>
									<Logo />
								</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-1 px-4">
								{NAV_LINKS.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										className={cn(
											buttonVariants({ variant: 'ghost' }),
											'justify-start text-fz-ink',
										)}
									>
										{link.label}
									</Link>
								))}
								<Link
									href="/tin-nhan"
									className={cn(
										buttonVariants({ variant: 'ghost' }),
										'justify-start text-fz-ink',
									)}
								>
									<MessageCircle className="size-4" />
									Tin nhắn
								</Link>
							</nav>
							<div className="mt-auto flex flex-col gap-2 px-4 pb-4">
								<Link
									href="/dang-tin"
									className={buttonVariants({ variant: 'default' })}
								>
									<Plus className="size-4" />
									Đăng tin
								</Link>
								<Link
									href="/dang-nhap"
									className={buttonVariants({ variant: 'outline' })}
								>
									Đăng nhập
								</Link>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
