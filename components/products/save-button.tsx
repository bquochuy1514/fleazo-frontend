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
}: {
	productId: number;
	initialSaved: boolean;
	initialCount: number;
	className?: string;
}) {
	const { user } = useAuth();
	const router = useRouter();
	const [saved, setSaved] = useState(initialSaved);
	const [count, setCount] = useState(initialCount);
	const [pending, setPending] = useState(false);

	const onClick = async () => {
		// Public page, gated action — same /dang-nhap?next= round trip the
		// rest of the app uses for a signed-out visitor hitting something
		// identity-shaped (see AGENTS.md → Layout decisions).
		if (!user) {
			router.push(
				`/dang-nhap?next=${encodeURIComponent(`/san-pham/${productId}`)}`,
			);
			return;
		}
		if (pending) return;

		const nextSaved = !saved;
		setPending(true);
		setSaved(nextSaved);
		setCount((c) => c + (nextSaved ? 1 : -1));

		try {
			await (nextSaved ? saveProduct : unsaveProduct)(productId);
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
				// Floating over the photo (see product-detail page), not an
				// inline pill next to the price anymore — that read as too
				// quiet to notice. size-11 (44px) meets the touch-target
				// minimum on its own, no extra hit-area padding needed.
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
