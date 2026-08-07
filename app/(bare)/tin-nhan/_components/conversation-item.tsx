import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatConversationTimestamp } from '@/lib/format';
import { firstImageUrl } from '@/lib/products';
import type { Conversation } from '@/types/chat.types';
import type { Product } from '@/types/product.types';

export function ConversationItem({
	conversation,
	isOnline,
	isTyping,
	active,
	currentUserId,
	products,
	onClick,
}: {
	conversation: Conversation;
	isOnline: boolean;
	// Someone is currently typing to me in THIS conversation — the `typing`
	// event is forwarded to `user:<id>` regardless of which conversation is
	// open, so this is a real signal, not just shown for the open thread.
	isTyping: boolean;
	active: boolean;
	currentUserId: number;
	// Only the products already resolved in the parent's cache — a row whose
	// product hasn't been fetched yet simply skips the thumbnail badge.
	products: Record<number, Product | null>;
	onClick: () => void;
}) {
	const isUnread = conversation.unreadCount > 0;
	const lastMessage = conversation.lastMessage;
	// "Bạn: " only for your own message — the other person's name is already this row's title.
	const lastMessagePrefix = lastMessage?.senderId === currentUserId ? 'Bạn: ' : '';
	const latestProduct =
		conversation.latestProductId != null ? products[conversation.latestProductId] : null;
	const latestProductThumb = latestProduct ? firstImageUrl(latestProduct) : null;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'flex w-full items-center gap-3 border-b border-border/60 p-3 text-left transition-colors',
				active ? 'bg-muted' : 'hover:bg-muted/60',
			)}
		>
			<div className="relative shrink-0">
				<Image
					src={conversation.otherUser.avatar}
					alt={conversation.otherUser.fullName}
					width={48}
					height={48}
					className="size-12 rounded-full object-cover"
				/>
				{isOnline && (
					<span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-fz-ink" />
				)}
				{/* Which listing this thread is about, at a glance — bottom-left,
				    opposite the online dot, so the two never collide. */}
				{latestProductThumb && (
					<div className="absolute bottom-0 left-0 size-4 overflow-hidden rounded-full ring-2 ring-card">
						<Image
							src={latestProductThumb}
							alt=""
							fill
							sizes="16px"
							className="object-cover"
						/>
					</div>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<p
						className={cn(
							'truncate text-sm text-fz-ink',
							isUnread ? 'font-semibold' : 'font-medium',
						)}
					>
						{conversation.otherUser.fullName}
					</p>
					<span className="shrink-0 text-[11px] text-muted-foreground">
						{formatConversationTimestamp(conversation.updatedAt)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-2">
					<p
						className={cn(
							'truncate text-xs',
							isTyping
								? 'font-medium text-fz-ink italic'
								: isUnread
									? 'font-medium text-fz-ink'
									: 'text-muted-foreground',
						)}
					>
						{isTyping
							? 'Đang nhập...'
							: lastMessage
								? `${lastMessagePrefix}${
										lastMessage.isRecalled
											? 'Tin nhắn đã được thu hồi'
											: lastMessage.content
									}`
								: 'Bắt đầu trò chuyện'}
					</p>
					{isUnread && (
						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fz-ink text-[11px] font-semibold text-white">
							{conversation.unreadCount}
						</span>
					)}
				</div>
			</div>
		</button>
	);
}
