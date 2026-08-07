import { api } from '@/lib/api';
import type { Conversation, PaginatedMessages } from '@/types/chat.types';

// No sendMessage() REST helper here — sending a message always goes through
// the socket's `sendMessage` emit instead, otherwise the other person never
// gets a realtime update. REST is read-only here, plus starting a conversation.

export async function listConversations(): Promise<Conversation[]> {
	const { data } = await api.get<Conversation[]>('/chat/conversations');
	return data;
}

// findOrCreate — returns the existing conversation if this pair already has one.
export async function createConversation(
	recipientId: number,
): Promise<{ id: number }> {
	const { data } = await api.post<{ id: number }>('/chat/conversations', {
		recipientId,
	});
	return data;
}

export async function getMessages(
	conversationId: number,
	params?: { page?: number; limit?: number },
): Promise<PaginatedMessages> {
	const { data } = await api.get<PaginatedMessages>(
		`/chat/conversations/${conversationId}/messages`,
		{ params },
	);
	return data;
}
