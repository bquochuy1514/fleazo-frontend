'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// Not tied to a listing — unlike QuickMessage/SellerCard on the product
// detail page, this starts (or resumes) the pair's one conversation with no
// productId attached, since the visitor hasn't picked a specific item here.
export function MessageSellerButton({ sellerId }: { sellerId: number }) {
	const { user } = useAuth();

	const href = user
		? `/tin-nhan?sellerId=${sellerId}`
		: `/dang-nhap?next=${encodeURIComponent(`/nguoi-dung/${sellerId}`)}`;

	return (
		<Link href={href} className={cn(buttonVariants({ variant: 'default' }), 'h-11 gap-1.5 px-5')}>
			<MessageCircle className="size-4" />
			Nhắn tin
		</Link>
	);
}
