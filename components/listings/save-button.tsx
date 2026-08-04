'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { saveProduct, unsaveProduct } from '@/lib/products';
import { cn } from '@/lib/utils';

export function SaveButton({
	productId,
	initialSaved,
	initialCount,
	className,
	onUnsaveRequested,
}: {
	productId: number;
	initialSaved: boolean;
	initialCount: number;
	className?: string;
	onUnsaveRequested?: () => void;
}) {
	const { user } = useAuth();
	const router = useRouter();
	const [saved, setSaved] = useState(initialSaved);
	const [count, setCount] = useState(initialCount);
	const [pending, setPending] = useState(false);

	const onClick = async () => {
		// Gated action: redirect signed-out visitors through /dang-nhap?next=.
		if (!user) {
			router.push(
				`/dang-nhap?next=${encodeURIComponent(`/san-pham/${productId}`)}`,
			);
			return;
		}
		if (pending) return;
		if (saved && onUnsaveRequested) {
			onUnsaveRequested();
			return;
		}

		const nextSaved = !saved;
		setPending(true);
		setSaved(nextSaved);
		setCount((c) => c + (nextSaved ? 1 : -1));

		try {
			await (nextSaved ? saveProduct : unsaveProduct)(productId);
			toast.success(
				nextSaved
					? 'Đã lưu tin — xem lại ở "Tin đã lưu".'
					: 'Đã bỏ lưu tin.',
			);
			// Cues the Header's heart icon to beat once — a quiet stand-in
			// for animating the card itself across the screen (see globals.css).
			if (nextSaved) {
				window.dispatchEvent(new Event('fz:saved'));
			}
		} catch {
			setSaved(!nextSaved);
			setCount((c) => c + (nextSaved ? -1 : 1));
			toast.error('Đã có lỗi xảy ra, vui lòng thử lại.');
		} finally {
			setPending(false);
		}
	};

	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={saved}
			aria-label={saved ? 'Bỏ lưu tin' : 'Lưu tin'}
			className={cn(
				// size-11 (44px) meets touch-target minimum without extra padding.
				'flex size-11 items-center justify-center rounded-full border border-border/60 bg-card shadow-md transition-transform hover:scale-105 active:scale-95',
				className,
			)}
		>
			<Heart
				aria-hidden
				className={cn(
					'size-5',
					saved ? 'fill-fz-accent text-fz-accent' : 'text-fz-ink',
				)}
			/>
			{count > 0 && (
				<span className="sr-only">{count} lượt lưu</span>
			)}
		</button>
	);
}
