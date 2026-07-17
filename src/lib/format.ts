/**
 * Format a VND price for display: 1500000 → "1.500.000 ₫"
 * Accepts string because Prisma Decimal serializes to string in JSON.
 */
export function formatPrice(price: number | string): string {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		maximumFractionDigits: 0,
	}).format(Number(price));
}
