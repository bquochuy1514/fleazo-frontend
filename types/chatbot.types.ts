import type { Product } from './product.types';

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
	role: ChatRole;
	content: string;
}

// listings mirrors GET /products' Product shape unchanged — fleazo-ai passes
// it straight through, fleazo-backend passes it straight through too.
export interface ChatResponse {
	reply: string;
	listings?: Product[];
}
