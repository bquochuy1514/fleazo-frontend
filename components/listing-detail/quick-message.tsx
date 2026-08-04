'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { buttonVariants } from '@/components/ui/button';
import { SectionHeader } from '@/components/form/section-header';
import { useAuth } from '@/hooks/use-auth';
import { createConversation, sendMessage } from '@/lib/chat';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
	'Sản phẩm còn không ạ?',
	'Có thể bớt giá không ạ?',
	'Mình xem trực tiếp được không ạ?',
];

const CARD =
	'rounded-2xl border border-border bg-card p-6 shadow-sm shadow-fz-ink/5';

// Separate card from SellerCard's "Nhắn tin" — lower-commitment secondary action.
export function QuickMessage({
	sellerId,
	sellerName,
	productId,
}: {
	sellerId: number;
	sellerName: string;
	productId: number;
}) {
	const { user } = useAuth();
	const router = useRouter();
	const [message, setMessage] = useState('');
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);

	const onSend = async () => {
		const content = message.trim();
		if (!content) return;

		if (!user) {
			router.push(
				`/dang-nhap?next=${encodeURIComponent(`/san-pham/${productId}`)}`,
			);
			return;
		}

		setSending(true);
		try {
			const conversation = await createConversation(sellerId);
			await sendMessage(conversation.id, { content, productId });
			setSent(true);
		} catch {
			toast.error('Không gửi được tin nhắn, vui lòng thử lại.');
		} finally {
			setSending(false);
		}
	};

	if (sent) {
		return (
			<section className={CARD}>
				<div className="flex items-start gap-2.5">
					<CheckCircle2
						aria-hidden
						className="mt-0.5 size-5 shrink-0 text-fz-accent"
					/>
					<div>
						<p className="text-sm font-medium text-fz-ink">
							Đã gửi tin nhắn cho {sellerName}.
						</p>
						<Link
							href={`/tin-nhan?productId=${productId}`}
							className="mt-1 inline-block text-sm text-fz-ink underline underline-offset-2 hover:no-underline"
						>
							Xem cuộc trò chuyện →
						</Link>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className={CARD}>
			<SectionHeader icon={MessageCircle} title="Nhắn tin nhanh" />

			<div className="flex flex-wrap gap-1.5">
				{SUGGESTIONS.map((suggestion) => (
					<button
						key={suggestion}
						type="button"
						onClick={() => setMessage(suggestion)}
						className="rounded-full border border-border px-3 py-2 text-xs text-fz-ink transition-colors hover:bg-muted"
					>
						{suggestion}
					</button>
				))}
			</div>

			<Textarea
				rows={3}
				placeholder="Nhắn gì đó cho người bán..."
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				disabled={sending}
				className="mt-3"
			/>

			<button
				type="button"
				onClick={onSend}
				disabled={sending || !message.trim()}
				className={cn(
					buttonVariants({ variant: 'default' }),
					'mt-3 h-11 w-full gap-1.5',
				)}
			>
				<Send className="size-4" />
				{sending ? 'Đang gửi...' : 'Gửi'}
			</button>
		</section>
	);
}
