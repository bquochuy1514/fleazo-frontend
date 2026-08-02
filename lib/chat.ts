import { api } from '@/lib/api';

type Conversation = {
	id: number;
	initiatorId: number;
	recipientId: number;
	createdAt: string;
	updatedAt: string;
};

// Find-or-create — the backend returns the existing conversation if this
// pair already has one (see ChatService.findOrCreateConversation), so this
// is always safe to call before sending a first message.
export async function createConversation(
	recipientId: number,
): Promise<Conversation> {
	const { data } = await api.post<Conversation>('/chat/conversations', {
		recipientId,
	});
	return data;
}

export async function sendMessage(
	conversationId: number,
	payload: { content: string; productId?: number },
): Promise<void> {
	await api.post(`/chat/conversations/${conversationId}/messages`, payload);
}
