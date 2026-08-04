'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { saveProduct, unsaveProduct } from '@/lib/products';
import { cn } from '@/lib/utils';

export function SaveButton({
	productId,
	sellerId,
	initialSaved,
	initialCount,
	className,
	onUnsaveRequested,
}: {
	productId: number;
	sellerId?: number;
	initialSaved: boolean;
	initialCount: number;
	className?: string;
	onUnsaveRequested?: () => void;
}) {
	const { user } = useAuth();
	const [saved, setSaved] = useState(initialSaved);
	const [count, setCount] = useState(initialCount);
	const [pending, setPending] = useState(false);
	const isOwnListing = sellerId !== undefined && user?.id === sellerId;

	// Legacy self-saves may still exist from before the server-side guard.
	// Keep the control only for removing that old record.
	if (isOwnListing && !saved) return null;

	const onClick = async () => {
		if (!user) {
			toast.error('Đăng nhập để lưu tin.');
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
			disabled={pending}
			aria-pressed={saved}
			aria-label={saved ? 'Bỏ lưu tin' : 'Lưu tin'}
			className={cn(
				// The button stays a 44px target, while the visible control is lighter on small cards.
				'group/save relative flex size-11 items-center justify-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:cursor-wait',
				className,
			)}
		>
			<span
				aria-hidden
				className={cn(
					'flex size-8 items-center justify-center rounded-full border border-border/70 bg-card/95 shadow-sm backdrop-blur-sm transition-colors group-hover/save:border-fz-ink/30',
					saved && 'border-fz-accent/25 bg-fz-accent-soft',
				)}
			>
				<Heart
					className={cn(
						'size-4',
						saved ? 'fill-fz-accent text-fz-accent' : 'text-fz-ink',
					)}
				/>
			</span>
			{count > 0 && (
				<span className="sr-only">{count} lượt lưu</span>
			)}
		</button>
	);
}
