'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { AccountMenu } from '@/components/layout/account-menu';
import { AccountSheetContent } from '@/components/layout/account-sheet-content';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';

// /tin-nhan reads as its own small app inside Fleazo, not a shrunk marketing
// Header — logo, search, and account access, nothing marketplace-specific
// (no province picker, no Đăng tin CTA). No bell: nothing backend-planned
// generates notifications yet beyond chat itself, and no message icon —
// redundant on the page it would link to.
export function ChatAppBar({
	search,
	onSearchChange,
}: {
	search: string;
	onSearchChange: (value: string) => void;
}) {
	const { user } = useAuth();

	return (
		<div className="flex h-14 shrink-0 items-center gap-3 border-b border-border/70 px-4">
			<Logo
				size="sm"
				wordmarkClassName="hidden md:block"
				className="shrink-0 transition-opacity duration-300 hover:opacity-80"
			/>

			<div className="relative min-w-0 flex-1 sm:max-w-xs">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Tìm theo tên..."
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="h-9 pl-9"
				/>
			</div>

			{/* Desktop: same dropdown Header uses. */}
			<div className="ml-auto hidden shrink-0 md:block">
				<AccountMenu />
			</div>

			{/* Mobile: a Sheet, not the dropdown — a dropdown's tiny touch
			    target pinned to a corner doesn't work well on a phone. Same
			    account destinations as Header's own mobile menu. */}
			<Sheet>
				<SheetTrigger
					className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full ring-2 ring-transparent transition-all duration-200 active:scale-95 md:hidden"
					aria-label="Tài khoản"
				>
					{user && (
						<Image
							src={user.avatar}
							alt={user.fullName}
							width={32}
							height={32}
							className="size-8 rounded-full object-cover"
						/>
					)}
				</SheetTrigger>
				<SheetContent side="right">
					<SheetHeader className="shrink-0">
						<SheetTitle>Tài khoản</SheetTitle>
					</SheetHeader>
					<div className="min-h-0 flex-1 overflow-y-auto scrollbar-refined">
						<AccountSheetContent />
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
