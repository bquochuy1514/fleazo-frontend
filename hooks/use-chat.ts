'use client';

import { useContext } from 'react';
import { ChatContext } from '@/providers/chat-provider';

export function useChat() {
	return useContext(ChatContext);
}
