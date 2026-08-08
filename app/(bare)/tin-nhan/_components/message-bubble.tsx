import Image from 'next/image';
import { Copy, MoreVertical, Reply, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatMessageTime } from '@/lib/format';
import type { Message } from '@/types/chat.types';

const MENU_ITEM =
	'group cursor-pointer gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-muted focus:bg-muted';

const MENU_ICON =
	'flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors duration-200 group-hover:bg-background group-hover:text-fz-ink group-focus:bg-background group-focus:text-fz-ink';

const MENU_ITEM_DANGER = cn(
	MENU_ITEM,
	'hover:bg-fz-danger/10 focus:bg-fz-danger/10',
);

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
				className="relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground opacity-100 transition-all duration-200 after:absolute after:-inset-2 hover:bg-muted hover:text-fz-ink focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-muted data-[state=open]:text-fz-ink sm:opacity-0 sm:group-hover:opacity-100 sm:data-[state=open]:opacity-100"
				aria-label="Tuỳ chọn tin nhắn"
			>
				<MoreVertical aria-hidden className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align={isMine ? 'end' : 'start'}
				sideOffset={8}
				className="w-48 p-1.5 shadow-lg"
			>
				<DropdownMenuItem
					onClick={() => onReply(message)}
					className={MENU_ITEM}
				>
					<span className={MENU_ICON}>
						<Reply aria-hidden className="size-4" />
					</span>
					Trả lời
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleCopy} className={MENU_ITEM}>
					<span className={MENU_ICON}>
						<Copy aria-hidden className="size-4" />
					</span>
					Sao chép
				</DropdownMenuItem>
				{/* Own messages only — recall retracts a sent message, sender-only action */}
				{isMine && (
					<>
						<DropdownMenuSeparator className="my-1.5" />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => onRecall(message.id)}
							className={MENU_ITEM_DANGER}
						>
							<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-fz-danger/10 text-fz-danger">
								<Undo2 aria-hidden className="size-4" />
							</span>
							Thu hồi tin nhắn
						</DropdownMenuItem>
					</>
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
