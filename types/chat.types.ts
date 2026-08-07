export type ChatUser = {
	id: number;
	fullName: string;
	avatar: string;
};

// Fields every Message row has. Split out so `replyTo` (one level of quoted
// message) can reuse the same shape without being infinitely
// self-referential — the backend only ever fetches one level deep.
type BaseMessage = {
	id: number;
	conversationId: number;
	senderId: number;
	productId: number | null;
	replyToId: number | null;
	content: string;
	isRead: boolean;
	isRecalled: boolean;
	createdAt: string;
};

export type Message = BaseMessage & {
	replyTo: BaseMessage | null;
};

// GET /chat/conversations item shape — collapses initiator/recipient into "the other person" server-side.
export type Conversation = {
	id: number;
	otherUser: ChatUser;
	lastMessage: Message | null;
	// Most recent product-tagged message across the WHOLE conversation, not
	// just whatever page of messages is currently loaded — the pinned
	// product-context strip needs this even before that message loads.
	latestProductId: number | null;
	unreadCount: number;
	updatedAt: string;
};

export type PaginatedMessages = {
	data: Message[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};
