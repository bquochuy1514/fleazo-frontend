import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
// App-wide default — every user-facing string here is Vietnamese (see
// AGENTS.md → Key Conventions), and nothing else in the codebase sets a
// dayjs locale yet, so there's no other call site to conflict with.
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
