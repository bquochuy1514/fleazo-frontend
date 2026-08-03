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
