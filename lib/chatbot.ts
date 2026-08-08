import { api } from '@/lib/api';
import type { ChatMessage, ChatResponse } from '@/types/chatbot.types';

export async function sendChatMessage(
	message: string,
	history: ChatMessage[],
): Promise<ChatResponse> {
	const { data } = await api.post<ChatResponse>('/chatbot/message', {
		message,
		history,
	});
	return data;
}
