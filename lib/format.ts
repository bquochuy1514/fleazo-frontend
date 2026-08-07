import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
// App-wide default — all user-facing strings are Vietnamese.
dayjs.locale('vi');

// Format a VND price for display: 1500000 -> "1.500.000 ₫"
// Accepts string because Prisma Decimal serializes to string in JSON.
export function formatPrice(price: number | string): string {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		maximumFractionDigits: 0,
	}).format(Number(price));
}

// "2 ngày trước" — createdAt on a listing/message, etc.
export function timeAgo(dateString: string): string {
	return dayjs(dateString).fromNow();
}

// Thousands-grouped count for display: 1234 -> "1.234"
export function formatCount(count: number): string {
	return new Intl.NumberFormat('vi-VN').format(count);
}

// "10:32" — timestamp on a chat message bubble.
export function formatMessageTime(dateString: string): string {
	return dayjs(dateString).format('HH:mm');
}

// Gmail-style: today -> "10:32", this week -> "T3", older -> "05/08".
export function formatConversationTimestamp(dateString: string): string {
	const d = dayjs(dateString);
	if (d.isSame(dayjs(), 'day')) return d.format('HH:mm');
	if (dayjs().diff(d, 'day') < 6) return d.format('ddd');
	return d.format('DD/MM');
}
