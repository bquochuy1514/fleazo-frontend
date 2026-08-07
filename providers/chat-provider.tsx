'use client';

import {
	createContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { listConversations } from '@/lib/chat';
import type { Conversation, Message } from '@/types/chat.types';

type ChatContextValue = {
	conversations: Conversation[];
	setConversations: Dispatch<SetStateAction<Conversation[]>>;
	isLoadingConversations: boolean;
	unreadConversationCount: number;
	// The conversation the user currently has open in tin-nhan, if any — lets
	// a just-arrived message be counted as read instead of bumping the badge.
	activeConversationId: number | null;
	setActiveConversationId: (id: number | null) => void;
};

export const ChatContext = createContext<ChatContextValue>({
	conversations: [],
	setConversations: () => {},
	isLoadingConversations: true,
	unreadConversationCount: 0,
	activeConversationId: null,
	setActiveConversationId: () => {},
});

// App-wide conversation list — single source of truth for both a future
// header unread badge and tin-nhan, kept live via the same socket events
// regardless of whether tin-nhan is the page currently open.
export function ChatProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const socket = useSocket();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [isLoadingConversations, setIsLoadingConversations] = useState(true);
	const [activeConversationId, setActiveConversationId] = useState<
		number | null
	>(null);
	// Mirrors `conversations` for the socket handlers below — they only
	// depend on [socket, user, activeConversationId], so reading the
	// `conversations` state directly there would see a stale snapshot on
	// every message that doesn't also change one of those three.
	const conversationsRef = useRef<Conversation[]>(conversations);
	useEffect(() => {
		conversationsRef.current = conversations;
	}, [conversations]);

	useEffect(() => {
		if (!user) {
			// queueMicrotask avoids react-hooks/set-state-in-effect
			queueMicrotask(() => {
				setConversations([]);
				setIsLoadingConversations(false);
			});
			return;
		}
		listConversations()
			.then(setConversations)
			.catch(() => {})
			.finally(() => setIsLoadingConversations(false));
	}, [user]);

	useEffect(() => {
		if (!socket || !user) return;

		const onNewMessage = (message: Message) => {
			if (message.senderId !== user.id) return;

			// A conversation this client doesn't know about yet (e.g. sent
			// from another tab/device) — the message alone doesn't carry the
			// other person's name/avatar to synthesize a row, so refetch.
			if (
				!conversationsRef.current.some((c) => c.id === message.conversationId)
			) {
				listConversations()
					.then(setConversations)
					.catch(() => {});
				return;
			}

			setConversations((prev) => {
				const next = prev.map((c) =>
					c.id === message.conversationId
						? {
								...c,
								lastMessage: message,
								latestProductId: message.productId ?? c.latestProductId,
								updatedAt: message.createdAt,
								unreadCount:
									message.conversationId === activeConversationId
										? 0
										: c.unreadCount,
							}
						: c,
				);
				return [...next].sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
				);
			});
		};

		// Fires for ANY of this user's conversations, joined or not — the only
		// reliable signal for one that isn't currently open on screen.
		const onNewMessageNotification = (payload: {
			conversationId: number;
			latestMessage: string;
			unreadCount: number;
		}) => {
			// Same "unknown conversation" case as onNewMessage above — happens on
			// the very first message of a brand new conversation, since this
			// client's list was fetched before it existed.
			if (
				!conversationsRef.current.some((c) => c.id === payload.conversationId)
			) {
				listConversations()
					.then(setConversations)
					.catch(() => {});
				return;
			}

			setConversations((prev) => {
				const next = prev.map((c) => {
					if (c.id !== payload.conversationId) return c;
					const now = new Date().toISOString();
					return {
						...c,
						lastMessage: {
							id: c.lastMessage?.id ?? -1,
							conversationId: payload.conversationId,
							senderId: c.otherUser.id,
							productId: c.lastMessage?.productId ?? null,
							replyToId: null,
							replyTo: null,
							content: payload.latestMessage,
							isRead: false,
							isRecalled: false,
							createdAt: now,
						},
						unreadCount:
							payload.conversationId === activeConversationId
								? 0
								: payload.unreadCount,
						updatedAt: now,
					};
				});
				return [...next].sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
				);
			});
		};

		socket.on('newMessage', onNewMessage);
		socket.on('newMessageNotification', onNewMessageNotification);
		return () => {
			socket.off('newMessage', onNewMessage);
			socket.off('newMessageNotification', onNewMessageNotification);
		};
	}, [socket, user, activeConversationId]);

	const unreadConversationCount = useMemo(
		() => conversations.filter((c) => c.unreadCount > 0).length,
		[conversations],
	);

	return (
		<ChatContext.Provider
			value={{
				conversations,
				setConversations,
				isLoadingConversations,
				unreadConversationCount,
				activeConversationId,
				setActiveConversationId,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
}
