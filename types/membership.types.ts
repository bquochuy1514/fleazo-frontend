// price mirrors Product.price — Prisma Decimal serializes to string in JSON (see lib/format.ts).
export interface MembershipPlan {
	id: number;
	key: string;
	name: string;
	price: string;
	durationDays: number;
	maxActiveListings: number;
	listingDurationDays: number;
	maxImagesPerListing: number;
}

export interface MyMembership {
	plan: MembershipPlan;
	expiresAt: string | null;
	// Tin đang PENDING hoặc ACTIVE — the same count plan.maxActiveListings caps.
	activeListingsCount: number;
}

export interface PurchaseMembershipResponse {
	checkoutUrl: string;
	transactionId: number;
}
