import Image from 'next/image';
import { Copy, MoreVertical, Reply, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatMessageTime } from '@/lib/format';
import type { Message } from '@/types/chat.types';

export function MessageBubble({
	message,
	isMine,
	showAvatar,
	otherUserAvatar,
	otherUserName,
	onReply,
	onRecall,
}: {
	message: Message;
	isMine: boolean;
	// True on whichever single message the other person's avatar currently
	// tracks — the read-receipt pin, not shown on every message.
	showAvatar: boolean;
	otherUserAvatar: string;
	otherUserName: string;
	onReply: (message: Message) => void;
	onRecall: (messageId: number) => void;
}) {
	// Nothing actionable on an already-recalled message — no content to copy
	// or reply to, and it can't be re-recalled.
	const showMenu = !message.isRecalled;

	const handleCopy = () => {
		void navigator.clipboard.writeText(message.content);
		toast.success('Đã sao chép tin nhắn');
	};

	const menu = showMenu && (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				className="rounded-full p-1 text-muted-foreground opacity-100 transition hover:bg-muted sm:opacity-0 sm:group-hover:opacity-100"
				aria-label="Tuỳ chọn tin nhắn"
			>
				<MoreVertical className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align={isMine ? 'end' : 'start'} className="w-44">
				<DropdownMenuItem onClick={() => onReply(message)}>
					<Reply className="size-4" />
					Trả lời
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleCopy}>
					<Copy className="size-4" />
					Sao chép
				</DropdownMenuItem>
				{/* Own messages only — recall retracts a sent message, sender-only action */}
				{isMine && (
					<DropdownMenuItem
						variant="destructive"
						onClick={() => onRecall(message.id)}
					>
						<Undo2 className="size-4" />
						Thu hồi tin nhắn
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<div
			className={cn(
				// relative: showAvatar below anchors to this block's bottom-right,
				// regardless of isMine — it must never follow the bubble to the
				// left, always stays on the chat pane's right edge.
				'relative flex flex-col gap-0.5',
				isMine ? 'items-end' : 'items-start',
			)}
		>
			<div
				className={cn(
					'group flex max-w-[75%] items-center gap-1',
					isMine ? 'justify-end' : 'justify-start',
				)}
			>
				{isMine && menu}

				<div
					className={cn(
						'w-fit rounded-2xl px-3.5 py-2 text-sm',
						message.isRecalled
							? 'border border-dashed border-border text-muted-foreground italic'
							: isMine
								? 'bg-fz-ink text-white'
								: 'bg-muted text-fz-ink',
					)}
				>
					{/* Quote-reply snippet, one level deep — a recalled message shows nothing here */}
					{!message.isRecalled && message.replyTo && (
						<div
							className={cn(
								'mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs',
								isMine
									? 'border-white/50 bg-white/10 text-white/80'
									: 'border-fz-ink/30 bg-fz-ink/5 text-muted-foreground',
							)}
						>
							{message.replyTo.isRecalled
								? 'Tin nhắn đã được thu hồi'
								: message.replyTo.content}
						</div>
					)}
					{message.isRecalled ? 'Tin nhắn đã được thu hồi' : message.content}
				</div>

				{!isMine && menu}
			</div>

			<span
				className={cn(
					'px-1 text-[10px] whitespace-nowrap text-muted-foreground',
					isMine && showAvatar && 'mr-5',
				)}
			>
				{formatMessageTime(message.createdAt)}
			</span>

			{showAvatar && (
				<Image
					src={otherUserAvatar}
					alt={otherUserName}
					title={`${otherUserName} đã xem`}
					width={14}
					height={14}
					className="absolute right-1 bottom-0 size-3.5 rounded-full object-cover"
				/>
			)}
		</div>
	);
}
