'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, GraduationCap, Phone, Star } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { ProductSeller } from '@/types/product.types';

const CARD =
	'rounded-2xl border border-border bg-card p-6 shadow-sm shadow-fz-ink/5';

// VN mobile numbers are 10 digits — grouped 4-3-3 (e.g. "0342 637 682"),
// the format shown on the number itself. Falls back to the raw string for
// anything else (landline, already-formatted, etc.) rather than mangling it.
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

// Tap once to reveal the real number (masked by default — a phone number
// splashed across the page in plain text invites scraping more than a
// number a visitor had to deliberately ask for), tap the revealed state to
// actually call. Two states, one button, so it's never a dead click.
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
			<Eye aria-hidden className="ml-auto size-4 text-muted-foreground" />
		</button>
	);
}

// Presentational identity + the two real contact actions (message, call).
// "Nhắn tin nhanh" (suggestion chips + a message composer) is its own card
// now — see quick-message.tsx — not nested in here. This card only has ONE
// primary action (Nhắn tin) plus the phone reveal as its secondary; the
// quick-message form below it on the page is a distinct, lower-commitment
// action, not a rival for the same visual weight.
export function SellerCard({
	seller,
	productId,
}: {
	seller: ProductSeller;
	productId: number;
}) {
	const { user } = useAuth();

	// Same /dang-nhap?next= round trip as SaveButton — a public page with
	// an identity-shaped inline action, not a whole gated page (see
	// AGENTS.md → Layout decisions).
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
					{/* No `truncate` — a long university name used to end in
					    "…", hiding the exact school name a buyer on this
					    campus-trust-based marketplace actually cares about.
					    Wraps instead. */}
					<div className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
						<GraduationCap className="mt-0.5 size-3.5 shrink-0" />
						<span>{seller.university?.name ?? 'Chưa cập nhật trường'}</span>
					</div>
				</div>
			</div>

			{/* /nguoi-dung/[id]: public seller profile — not built yet (see
			    AGENTS.md → Layout decisions). Linked ahead of the page
			    existing, same pattern as /tin-nhan elsewhere. A plain text
			    link, not a button — "Nhắn tin" below is the one action this
			    card wants to sell; a same-weight second button next to it
			    would just compete for attention. py-2 -my-2: touch-target
			    padding without pushing the surrounding layout down (same
			    trick dang-nhap's "Quên mật khẩu?" link uses). */}
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
