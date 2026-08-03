'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Phone, Star } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { ProductSeller } from '@/types/product.types';

const CARD =
	'rounded-2xl border border-border bg-card p-6 shadow-sm shadow-fz-ink/5';

// VN mobile numbers: 10 digits, grouped 4-3-3. Falls back to raw string otherwise.
function formatPhone(phone: string): string {
	const digits = phone.replace(/\D/g, '');
	if (digits.length !== 10) return phone;
	return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

function maskPhone(phone: string): string {
	const digits = phone.replace(/\D/g, '');
	if (digits.length !== 10) return phone;
	return `${digits.slice(0, 4)} ${digits.slice(4, 7)} •••`;
}

// Masked by default (avoids scraping); tap to reveal, tap again to call.
function PhoneReveal({ phone }: { phone: string }) {
	const [revealed, setRevealed] = useState(false);

	if (revealed) {
		return (
			<a
				href={`tel:${phone}`}
				className={cn(
					buttonVariants({ variant: 'outline' }),
					'h-11 w-full gap-2',
				)}
			>
				<Phone className="size-4" />
				{formatPhone(phone)}
			</a>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setRevealed(true)}
			className={cn(
				buttonVariants({ variant: 'outline' }),
				'h-11 w-full gap-2',
			)}
		>
			<Phone className="size-4" />
			{maskPhone(phone)}
		</button>
	);
}

// Identity + two contact actions (message, call). Quick-message composer lives separately in quick-message.tsx.
export function SellerCard({
	seller,
	productId,
}: {
	seller: ProductSeller;
	productId: number;
}) {
	const { user } = useAuth();

	// Same /dang-nhap?next= round trip as SaveButton.
	const messageHref = user
		? `/tin-nhan?productId=${productId}`
		: `/dang-nhap?next=${encodeURIComponent(`/san-pham/${productId}`)}`;

	return (
		<section className={CARD}>
			<div className="flex items-center gap-3">
				<Image
					src={seller.avatar}
					alt={seller.fullName}
					width={48}
					height={48}
					className="size-12 shrink-0 rounded-full object-cover"
				/>
				<div className="min-w-0">
					<p className="font-heading text-base font-bold text-fz-ink">
						{seller.fullName}
					</p>
					{/* No `truncate` — university name must stay fully visible. */}
					<div className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
						<GraduationCap className="mt-0.5 size-3.5 shrink-0" />
						<span>{seller.university?.name ?? 'Chưa cập nhật trường'}</span>
					</div>
				</div>
			</div>

			{/* /nguoi-dung/[id]: profile page not built yet, linked ahead of it existing.
			    Plain text link (not a button) so it doesn't compete with "Nhắn tin".
			    py-2 -my-2: touch-target padding without affecting layout. */}
			<Link
				href={`/nguoi-dung/${seller.id}`}
				className="-my-2 mt-1 inline-flex items-center py-2 text-xs text-fz-ink underline underline-offset-2 hover:no-underline"
			>
				Xem hồ sơ người bán →
			</Link>

			<div className="mt-3 grid grid-cols-2 gap-2 text-sm">
				<div>
					<p className="text-xs text-muted-foreground">Đánh giá</p>
					<p className="mt-0.5 flex items-center gap-1 font-medium text-fz-ink">
						{seller.avgRating > 0 ? (
							<>
								<Star className="size-3.5 fill-fz-ink text-fz-ink" />
								{seller.avgRating.toFixed(1)}
							</>
						) : (
							'Chưa có'
						)}
					</p>
				</div>
				<div>
					<p className="text-xs text-muted-foreground">Phản hồi</p>
					<p className="mt-0.5 font-medium text-fz-ink">
						{seller.responseRate > 0
							? `${seller.responseRate}%`
							: 'Chưa có dữ liệu'}
					</p>
				</div>
			</div>

			<div className="mt-4 space-y-2">
				<Link
					href={messageHref}
					className={cn(buttonVariants({ variant: 'default' }), 'h-11 w-full')}
				>
					Nhắn tin
				</Link>
				<PhoneReveal phone={seller.phone} />
			</div>
		</section>
	);
}
