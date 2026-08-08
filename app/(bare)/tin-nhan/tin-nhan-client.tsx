'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowLeft,
	ChevronUp,
	Loader2,
	MessageCircle,
	Reply,
	Search,
	Send,
	X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { useChat } from '@/hooks/use-chat';
import { createConversation, getMessages } from '@/lib/chat';
import { getProduct, firstImageUrl } from '@/lib/products';
import { getPublicUserProfile } from '@/lib/users';
import { ChatAppBar } from './_components/chat-app-bar';
import { ConversationItem } from './_components/conversation-item';
import { ConversationTabs, type ConversationTabKey } from './_components/conversation-tabs';
import { MessageBubble } from './_components/message-bubble';
import { ProductContextCard } from './_components/product-context-card';
import { TypingIndicator } from './_components/typing-indicator';
import type { ChatUser, Message } from '@/types/chat.types';
import type { Product } from '@/types/product.types';

// Real socket/API wiring — mock data is gone. Structure mirrors the mock UI
// pass 1:1 (selected conversation, per-thread messages, pagination, reply
// draft) so nothing about the layout changed, only where the data comes from.
export function TinNhanPageClient() {
	const { user } = useAuth();
	const socket = useSocket();
	const router = useRouter();
	const searchParams = useSearchParams();

	const {
		conversations,
		setConversations,
		isLoadingConversations,
		setActiveConversationId,
	} = useChat();

	const [search, setSearch] = useState('');
	const [activeTab, setActiveTab] = useState<ConversationTabKey>('all');
	// Starts unselected on every viewport — mobile only shows one of
	// list/pane at a time, so a pre-selected default would skip the list.
	const [selectedId, setSelectedId] = useState<number | null>(null);
	// Set instead of selectedId when arriving via ?productId= and no
	// conversation exists yet — a draft screen, no Conversation row created
	// until sent.
	const [pendingRecipient, setPendingRecipient] = useState<ChatUser | null>(null);
	const [isStartingConversation, setIsStartingConversation] = useState(false);
	const [otherUserOnline, setOtherUserOnline] = useState(false);
	const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
	// Conversations someone is CURRENTLY typing to me in — `typing` is
	// forwarded to `user:<id>` regardless of which conversation is open, so
	// this drives both the open pane's bubble and every list row, not just
	// the selected one.
	const [typingConversationIds, setTypingConversationIds] = useState<Set<number>>(
		new Set(),
	);
	const typingTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
	// Whether *this* client currently has an active "typing" signal out for
	// the open conversation — avoids re-emitting `typing` on every keystroke.
	const isTypingRef = useRef(false);
	const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoadingOlder, setIsLoadingOlder] = useState(false);

	const [draft, setDraft] = useState('');
	const [replyTo, setReplyTo] = useState<Message | null>(null);
	// Tags only the next message sent, then clears — lets "Nhắn tin" from a
	// product page carry which listing prompted the conversation.
	const [pendingProductId, setPendingProductId] = useState<number | null>(null);

	const bottomRef = useRef<HTMLDivElement>(null);
	// False right before prepending older messages — otherwise pagination
	// would yank the user back down past what they asked to see.
	const stickToBottomRef = useRef(true);

	const [productCache, setProductCache] = useState<Record<number, Product | null>>({});
	// Tracks ids already requested (or already resolved to "gone") so the
	// fetch effect below never re-requests the same id twice.
	const fetchedProductIdsRef = useRef<Set<number>>(new Set());

	const searchTerm = search.trim().toLowerCase();
	const unreadConversationCount = conversations.filter((c) => c.unreadCount > 0).length;
	const filteredConversations = useMemo(
		() =>
			conversations.filter(
				(c) =>
					c.otherUser.fullName.toLowerCase().includes(searchTerm) &&
					(activeTab === 'all' || c.unreadCount > 0),
			),
		[conversations, searchTerm, activeTab],
	);
	const selected = conversations.find((c) => c.id === selectedId) ?? null;
	// A real conversation always wins over a leftover pending draft
	const activeOtherUser = selected?.otherUser ?? pendingRecipient;
	const isPending = !selected && !!pendingRecipient;

	// Where the other person's avatar pins, right-aligned under whichever
	// message it is (regardless of sender) — their own latest message
	// always qualifies; one of my own only qualifies once read, so an
	// unread message I just sent doesn't hide the avatar off the last one
	// they actually saw.
	const avatarTargetMessage = [...messages]
		.reverse()
		.find((m) => m.senderId !== user?.id || m.isRead);
	const avatarTargetMessageId = avatarTargetMessage?.id ?? null;

	// A conversation can touch several products over time — instead of one
	// "current" product, this renders a small card inline wherever the
	// thread shifts to a different one.
	const messagesWithProductContext = useMemo(() => {
		const result: { message: Message; showProductCard: boolean }[] = [];
		let previousProductId: number | null = null;
		for (const m of messages) {
			result.push({
				message: m,
				showProductCard: m.productId != null && m.productId !== previousProductId,
			});
			previousProductId = m.productId;
		}
		return result;
	}, [messages]);

	// Current topic — used for the role badge text only (see below), NOT
	// rendered as its own card. The single source of "which product is this
	// about" on screen is the inline sticky cards in the message list: each
	// one sticks to the top of the scroll area via CSS `position: sticky`
	// once you scroll past it, so whichever topic is current at the current
	// scroll position naturally reads as "pinned" without a second, separate
	// card duplicating the same info right next to it.
	const currentProduct =
		selected?.latestProductId != null ? productCache[selected.latestProductId] : null;
	// The one exception: a long thread where the current topic's own message
	// is older than what's loaded (>30 messages back) has no sticky card to
	// show yet. Only then does a fallback card render, and only until the
	// real message loads — never alongside it.
	const showFallbackProductContext =
		selected?.latestProductId != null &&
		!messages.some((m) => m.productId === selected.latestProductId);
	// Mirrors how the backend actually resolves a role: Message.productId
	// cross-referenced against Product.sellerId (see backend AGENTS.md → Chat).
	const otherUserRoleLabel = currentProduct
		? currentProduct.sellerId === selected!.otherUser.id
			? 'Người bán'
			: currentProduct.sellerId === user?.id
				? 'Đang hỏi mua'
				: null
		: null;

	// Fetches every product this screen currently needs a preview for:
	// every conversation row's thumbnail badge, the pending draft's tag,
	// and every productId referenced by a loaded message.
	useEffect(() => {
		const neededIds = new Set<number>();
		if (pendingProductId) neededIds.add(pendingProductId);
		for (const c of conversations) if (c.latestProductId) neededIds.add(c.latestProductId);
		for (const m of messages) if (m.productId != null) neededIds.add(m.productId);

		const missing = [...neededIds].filter((id) => !fetchedProductIdsRef.current.has(id));
		if (missing.length === 0) return;
		missing.forEach((id) => fetchedProductIdsRef.current.add(id));

		Promise.all(
			missing.map((id) =>
				// Listing may no longer be ACTIVE (sold/expired) — resolve to
				// null instead of rejecting, the card just won't render for it.
				getProduct(id)
					.then((product) => [id, product] as const)
					.catch(() => [id, null] as const),
			),
		).then((entries) => {
			setProductCache((prev) => {
				const next = { ...prev };
				for (const [id, product] of entries) next[id] = product;
				return next;
			});
		});
	}, [pendingProductId, conversations, messages]);

	// Marks which conversation is "currently open" so a message arriving for
	// it counts as read instead of bumping the header/list unread badge.
	useEffect(() => {
		setActiveConversationId(selectedId);
		return () => setActiveConversationId(null);
	}, [selectedId, setActiveConversationId]);

	// Switching away from a conversation while mid-type owes the other side a
	// stopTyping — otherwise "Đang nhập..." sticks on their screen.
	useEffect(() => {
		queueMicrotask(() => setOtherUserOnline(false));
		return () => {
			if (isTypingRef.current && socket && selectedId) {
				socket.emit('stopTyping', { conversationId: selectedId });
				isTypingRef.current = false;
			}
			if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current);
		};
	}, [selectedId, socket]);

	// The app-wide socket usually connects before this page ever mounts, so
	// userOnline/userOffline listeners below miss whatever fired earlier —
	// this asks for a fresh snapshot every time the page mounts.
	useEffect(() => {
		if (!socket) return;
		socket.emit('getOnlineStatus', (ack: { onlineUserIds: number[] }) => {
			setOnlineUserIds(new Set(ack?.onlineUserIds ?? []));
		});
	}, [socket]);

	// ?productId=<id> — entry point from a product detail page's "Nhắn tin".
	// ?sellerId=<id> — entry point from a seller's public profile "Nhắn tin",
	// not tied to any listing (no pendingProductId set). Both reuse an
	// existing conversation with that person if there is one; otherwise this
	// does NOT create it yet — only handleSend's pending branch does that,
	// on the first real message.
	useEffect(() => {
		if (isLoadingConversations) return;
		const productIdParam = searchParams.get('productId');
		const sellerIdParam = searchParams.get('sellerId');
		if (!productIdParam && !sellerIdParam) return;

		router.replace('/tin-nhan');

		const startWith = (recipient: ChatUser, productId: number | null) => {
			const existing = conversations.find((c) => c.otherUser.id === recipient.id);
			if (existing) {
				queueMicrotask(() => setSelectedId(existing.id));
				return;
			}
			queueMicrotask(() => {
				if (productId) setPendingProductId(productId);
				setPendingRecipient(recipient);
				setMessages([]);
				setPage(1);
				setTotalPages(1);
			});
		};

		if (productIdParam) {
			const productId = Number(productIdParam);
			getProduct(productId)
				.then((product) => startWith(product.seller, productId))
				.catch(() => {});
			return;
		}

		const sellerId = Number(sellerIdParam);
		getPublicUserProfile(sellerId)
			.then((seller) => startWith(seller, null))
			.catch(() => {});
		// Only re-run once the conversations list first finishes loading.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoadingConversations]);

	const loadMessages = (conversationId: number, pageToLoad: number) =>
		getMessages(conversationId, { page: pageToLoad, limit: 30 });

	// Switching conversations: join its room, load first page of history, reset per-thread UI state.
	useEffect(() => {
		if (!selectedId || !socket) return;

		queueMicrotask(() => {
			setDraft('');
			setReplyTo(null);
			setIsLoadingMessages(true);
		});
		stickToBottomRef.current = true;

		socket.emit(
			'joinConversation',
			{ conversationId: selectedId },
			(ack: { otherUserOnline: boolean }) => {
				setOtherUserOnline(ack?.otherUserOnline ?? false);
			},
		);

		loadMessages(selectedId, 1)
			.then((result) => {
				setMessages(result.data);
				setPage(result.page);
				setTotalPages(result.totalPages);
			})
			.catch((err: unknown) => {
				const { message } = parseApiError(err);
				toast.error(message);
			})
			.finally(() => setIsLoadingMessages(false));

		// Selected conversation's own unread badge clears immediately —
		// joinConversation above already marked it read server-side.
		queueMicrotask(() =>
			setConversations((prev) =>
				prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c)),
			),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedId, socket]);

	const handleLoadOlder = () => {
		if (!selectedId || page >= totalPages) return;
		setIsLoadingOlder(true);
		stickToBottomRef.current = false;
		loadMessages(selectedId, page + 1)
			.then((result) => {
				setMessages((prev) => [...result.data, ...prev]);
				setPage(result.page);
				setTotalPages(result.totalPages);
			})
			.catch((err: unknown) => {
				const { message } = parseApiError(err);
				toast.error(message);
			})
			.finally(() => setIsLoadingOlder(false));
	};

	// Keeps stickToBottomRef honest against the user's actual scroll position.
	const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const el = e.currentTarget;
		const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		stickToBottomRef.current = distanceFromBottom < 80;
	};

	useEffect(() => {
		if (stickToBottomRef.current) {
			bottomRef.current?.scrollIntoView({ behavior: 'auto' });
		}
	}, [messages, productCache, typingConversationIds]);

	// Whenever a reply target is picked, the input must already be ready to
	// type into — no extra click to focus it first.
	const draftInputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (replyTo) draftInputRef.current?.focus();
	}, [replyTo]);

	// Self-heals a stuck "Đang nhập..." if stopTyping is ever lost.
	const markTyping = (conversationId: number) => {
		setTypingConversationIds((prev) => new Set(prev).add(conversationId));
		const existing = typingTimeoutsRef.current.get(conversationId);
		if (existing) clearTimeout(existing);
		typingTimeoutsRef.current.set(
			conversationId,
			setTimeout(() => {
				setTypingConversationIds((prev) => {
					const next = new Set(prev);
					next.delete(conversationId);
					return next;
				});
				typingTimeoutsRef.current.delete(conversationId);
			}, 5000),
		);
	};
	const clearTyping = (conversationId: number) => {
		const existing = typingTimeoutsRef.current.get(conversationId);
		if (existing) clearTimeout(existing);
		typingTimeoutsRef.current.delete(conversationId);
		setTypingConversationIds((prev) => {
			const next = new Set(prev);
			next.delete(conversationId);
			return next;
		});
	};

	// Every realtime event this page cares about, wired once per socket instance.
	useEffect(() => {
		if (!socket || !user) return;

		const onNewMessage = (message: Message) => {
			const isMine = message.senderId === user.id;

			if (message.conversationId === selectedId) {
				// Force-scroll only for my own messages. An incoming one
				// respects wherever the user's scroll position has it pinned.
				if (isMine) stickToBottomRef.current = true;
				setMessages((prev) =>
					prev.some((m) => m.id === message.id) ? prev : [...prev, message],
				);
				if (!isMine) {
					// Re-marks as read — the thread is already open.
					socket.emit('joinConversation', { conversationId: message.conversationId });
				}
			}
			if (!isMine) clearTyping(message.conversationId);
		};

		const onMessagesRead = (payload: { conversationId: number }) => {
			if (payload.conversationId !== selectedId) return;
			setMessages((prev) =>
				prev.map((m) => (m.senderId === user.id ? { ...m, isRead: true } : m)),
			);
		};

		const onMessageRecalled = (payload: { messageId: number }) => {
			setMessages((prev) =>
				prev.map((m) => (m.id === payload.messageId ? { ...m, isRecalled: true } : m)),
			);
		};

		const onUserOnline = (payload: { userId: number }) => {
			setOnlineUserIds((prev) => new Set(prev).add(payload.userId));
			if (selected?.otherUser.id === payload.userId) setOtherUserOnline(true);
		};

		const onUserOffline = (payload: { userId: number }) => {
			setOnlineUserIds((prev) => {
				const next = new Set(prev);
				next.delete(payload.userId);
				return next;
			});
			if (selected?.otherUser.id === payload.userId) setOtherUserOnline(false);
		};

		const onTyping = (payload: { conversationId: number }) => {
			markTyping(payload.conversationId);
		};

		const onStopTyping = (payload: { conversationId: number }) => {
			clearTyping(payload.conversationId);
		};

		socket.on('newMessage', onNewMessage);
		socket.on('messagesRead', onMessagesRead);
		socket.on('messageRecalled', onMessageRecalled);
		socket.on('userOnline', onUserOnline);
		socket.on('userOffline', onUserOffline);
		socket.on('typing', onTyping);
		socket.on('stopTyping', onStopTyping);

		return () => {
			socket.off('newMessage', onNewMessage);
			socket.off('messagesRead', onMessagesRead);
			socket.off('messageRecalled', onMessageRecalled);
			socket.off('userOnline', onUserOnline);
			socket.off('userOffline', onUserOffline);
			socket.off('typing', onTyping);
			socket.off('stopTyping', onStopTyping);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket, user, selectedId, selected?.otherUser.id]);

	const handleSelect = (id: number) => {
		setPendingRecipient(null);
		setSelectedId(id);
	};

	const handleReply = (message: Message) => setReplyTo(message);

	const handleRecall = (messageId: number) => {
		socket?.emit('recallMessage', { messageId });
	};

	// Only meaningful for a real (already-created) conversation.
	const stopTypingNow = () => {
		if (!isTypingRef.current || !socket || !selectedId) return;
		isTypingRef.current = false;
		if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current);
		socket.emit('stopTyping', { conversationId: selectedId });
	};

	const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setDraft(value);
		if (!socket || !selectedId) return;

		if (!value.trim()) {
			stopTypingNow();
			return;
		}

		if (!isTypingRef.current) {
			isTypingRef.current = true;
			socket.emit('typing', { conversationId: selectedId });
		}
		// Debounced stopTyping — fires once keystrokes pause, not per character.
		if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current);
		stopTypingTimerRef.current = setTimeout(() => {
			isTypingRef.current = false;
			socket.emit('stopTyping', { conversationId: selectedId });
		}, 2000);
	};

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();
		const content = draft.trim();
		if (!content || !socket || !user) return;

		// Pending draft — this first message is what actually creates the
		// conversation. findOrCreate picks up a concurrent conversation
		// (e.g. the other person messaged first) instead of duplicating it.
		if (isPending && pendingRecipient) {
			setIsStartingConversation(true);
			const recipient = pendingRecipient;
			const productId = pendingProductId ?? undefined;
			setPendingProductId(null);

			createConversation(recipient.id)
				.then((created) => {
					socket.emit('sendMessage', {
						conversationId: created.id,
						content,
						productId,
					});

					const now = new Date().toISOString();
					setConversations((prev) => [
						{
							id: created.id,
							otherUser: recipient,
							lastMessage: {
								id: -1,
								conversationId: created.id,
								senderId: user.id,
								productId: productId ?? null,
								replyToId: null,
								replyTo: null,
								content,
								isRead: false,
								isRecalled: false,
								createdAt: now,
							},
							latestProductId: productId ?? null,
							unreadCount: 0,
							updatedAt: now,
						},
						...prev,
					]);
					setPendingRecipient(null);
					setSelectedId(created.id);
					setDraft('');
				})
				.catch((err: unknown) => {
					const { message } = parseApiError(err);
					toast.error(message);
				})
				.finally(() => setIsStartingConversation(false));
			return;
		}

		if (!selectedId) return;
		socket.emit('sendMessage', {
			conversationId: selectedId,
			content,
			replyToId: replyTo?.id,
			productId: pendingProductId ?? undefined,
		});
		stopTypingNow();
		setPendingProductId(null);
		setDraft('');
		setReplyTo(null);
	};

	const isPane = selectedId != null || isPending;

	return (
		<div className="flex h-dvh flex-col">
			<ChatAppBar search={search} onSearchChange={setSearch} />

			{!isLoadingConversations && conversations.length === 0 && !isPending ? (
				// No conversations at all yet (not just a filtered/searched-empty
				// list) — one unified message, not two panes both saying nothing
				// to pick from. Search is the way in: there's no conversation to
				// start without a listing to ask about first.
				<div className="flex flex-1 items-center justify-center p-6">
					<EmptyState
						icon={Search}
						title="Chưa có cuộc trò chuyện nào"
						description="Tìm sản phẩm bạn quan tâm và nhắn tin cho người bán để bắt đầu."
						action={
							<Link href="/tim-kiem" className={buttonVariants({ variant: 'default' })}>
								Tìm sản phẩm
							</Link>
						}
						className="max-w-sm"
					/>
				</div>
			) : (
			<div className="flex min-h-0 w-full flex-1 overflow-hidden bg-card">
				{/* Conversation list — hidden on mobile once a conversation is open */}
				<aside
					className={cn(
						'flex w-full shrink-0 flex-col sm:w-80 sm:border-r sm:border-border/70',
						isPane && 'hidden sm:flex',
					)}
				>
					<div className="shrink-0 space-y-3 border-b border-border/70 p-4">
						<h1 className="font-heading text-lg font-semibold text-fz-ink">
							Tin nhắn
						</h1>
						<ConversationTabs
							active={activeTab}
							onChange={setActiveTab}
							allCount={conversations.length}
							unreadCount={unreadConversationCount}
						/>
					</div>

					<div className="flex-1 overflow-y-auto scrollbar-refined">
						{isLoadingConversations ? (
							<div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
								<Loader2 className="size-4 animate-spin" />
								Đang tải...
							</div>
						) : filteredConversations.length === 0 ? (
							<EmptyState
								icon={MessageCircle}
								title={
									search
										? `Không tìm thấy cuộc trò chuyện nào khớp với "${search}"`
										: activeTab === 'unread'
											? 'Không có hội thoại chưa đọc'
											: 'Chưa có cuộc trò chuyện nào'
								}
								className="mx-4 mt-4 rounded-2xl"
							/>
						) : (
							filteredConversations.map((c) => (
								<ConversationItem
									key={c.id}
									conversation={c}
									isOnline={onlineUserIds.has(c.otherUser.id)}
									isTyping={typingConversationIds.has(c.id)}
									active={c.id === selectedId}
									currentUserId={user?.id ?? -1}
									products={productCache}
									onClick={() => handleSelect(c.id)}
								/>
							))
						)}
					</div>
				</aside>

				{/* Message pane */}
				<section className={cn('flex min-w-0 flex-1 flex-col', !isPane && 'hidden sm:flex')}>
					{activeOtherUser ? (
						<>
							<div className="shrink-0 border-b border-border/70">
								<div className="flex items-center gap-3 p-3">
									<button
										type="button"
										onClick={() => {
											setSelectedId(null);
											setPendingRecipient(null);
										}}
										className="text-muted-foreground sm:hidden"
										aria-label="Quay lại danh sách"
									>
										<ArrowLeft className="size-5" />
									</button>
									<Link
										href={`/nguoi-dung/${activeOtherUser.id}`}
										className="relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										aria-label={`Xem hồ sơ của ${activeOtherUser.fullName}`}
									>
										<Image
											src={activeOtherUser.avatar}
											alt={activeOtherUser.fullName}
											width={40}
											height={40}
											className="size-10 rounded-full object-cover"
										/>
										{!isPending && otherUserOnline && (
											<span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-card bg-fz-ink" />
										)}
									</Link>
									<Link
										href={`/nguoi-dung/${activeOtherUser.id}`}
										className="min-w-0 flex-1 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
									>
										<p className="truncate text-sm font-medium text-fz-ink hover:text-fz-muted">
											{activeOtherUser.fullName}
										</p>
										{/* No online-status line while pending — only known once joined */}
										{!isPending && (
											<p className="text-xs text-muted-foreground">
												{otherUserOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
											</p>
										)}
									</Link>
									{otherUserRoleLabel && (
										<span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
											{otherUserRoleLabel}
										</span>
									)}
								</div>
							</div>

							<div
								className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-refined"
								onScroll={handleMessagesScroll}
							>
								{isPending ? (
									<div className="flex h-full flex-col">
										{pendingProductId && productCache[pendingProductId] && (
											<ProductContextCard
												productId={pendingProductId}
												title={productCache[pendingProductId]!.title}
												price={productCache[pendingProductId]!.price}
												imageUrl={firstImageUrl(productCache[pendingProductId]!)}
											/>
										)}
										<div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
											<MessageCircle className="size-8" />
											<p>
												Gửi lời nhắn đầu tiên tới {activeOtherUser.fullName} để bắt đầu
												trò chuyện
											</p>
										</div>
									</div>
								) : isLoadingMessages ? (
									<div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
										<Loader2 className="size-4 animate-spin" />
										Đang tải tin nhắn...
									</div>
								) : (
									<>
										{/* Only when the current topic's own message is older than
										    what's loaded — the real inline card (below) takes over
										    the instant that page loads, so this never coexists with it. */}
										{showFallbackProductContext &&
											selected?.latestProductId &&
											currentProduct && (
												<div className="sticky top-0 z-10 pb-1">
													<ProductContextCard
														productId={currentProduct.id}
														title={currentProduct.title}
														price={currentProduct.price}
														imageUrl={firstImageUrl(currentProduct)}
													/>
												</div>
											)}

										{page < totalPages && (
											<div className="flex justify-center pb-1">
												<button
													type="button"
													onClick={handleLoadOlder}
													disabled={isLoadingOlder}
													className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted disabled:opacity-50"
												>
													{isLoadingOlder ? (
														<Loader2 className="size-3 animate-spin" />
													) : (
														<ChevronUp className="size-3" />
													)}
													Xem tin nhắn cũ hơn
												</button>
											</div>
										)}

										{messagesWithProductContext.map(({ message: m, showProductCard }) => {
											const product = m.productId != null ? productCache[m.productId] : undefined;
											return (
												<Fragment key={m.id}>
													{showProductCard && product && (
														<div className="sticky top-0 z-10 pb-1">
															<ProductContextCard
																productId={product.id}
																title={product.title}
																price={product.price}
																imageUrl={firstImageUrl(product)}
															/>
														</div>
													)}
													<MessageBubble
														message={m}
														isMine={m.senderId === user?.id}
														showAvatar={m.id === avatarTargetMessageId}
														otherUserAvatar={activeOtherUser.avatar}
														otherUserName={activeOtherUser.fullName}
														onReply={handleReply}
														onRecall={handleRecall}
													/>
												</Fragment>
											);
										})}
									</>
								)}
								{!isPending &&
									!isLoadingMessages &&
									selectedId != null &&
									typingConversationIds.has(selectedId) && <TypingIndicator />}
								<div ref={bottomRef} />
							</div>

							{replyTo && (
								<div className="flex shrink-0 items-center gap-2 border-t border-border/70 bg-muted/40 px-3 py-2">
									<Reply className="size-4 shrink-0 text-fz-ink" />
									<p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
										Đang trả lời:{' '}
										<span className="text-fz-ink">
											{replyTo.isRecalled ? 'Tin nhắn đã được thu hồi' : replyTo.content}
										</span>
									</p>
									<button
										type="button"
										onClick={() => setReplyTo(null)}
										className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
										aria-label="Huỷ trả lời"
									>
										<X className="size-4" />
									</button>
								</div>
							)}

							<form
								className="flex shrink-0 items-center gap-2 border-t border-border/70 p-3"
								onSubmit={handleSend}
							>
								<Input
									ref={draftInputRef}
									placeholder="Nhắn tin..."
									value={draft}
									onChange={handleDraftChange}
									disabled={isStartingConversation}
									autoComplete="off"
									className="h-11"
								/>
								<Button
									type="submit"
									size="icon"
									disabled={!draft.trim() || !socket || isStartingConversation}
									aria-label="Gửi"
								>
									{isStartingConversation ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Send className="size-4" />
									)}
								</Button>
							</form>
						</>
					) : (
						<EmptyState
							icon={MessageCircle}
							title="Chọn một cuộc trò chuyện để bắt đầu"
							className="m-auto max-w-sm"
						/>
					)}
				</section>
			</div>
			)}
		</div>
	);
}
