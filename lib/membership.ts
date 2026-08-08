import { api } from '@/lib/api';
import type {
	MembershipPlan,
	MyMembership,
	PurchaseMembershipResponse,
} from '@/types/membership.types';

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
	const { data } = await api.get<MembershipPlan[]>('/membership/plans');
	return data;
}

export async function getMyMembership(): Promise<MyMembership> {
	const { data } = await api.get<MyMembership>('/membership/me');
	return data;
}

export async function purchaseMembership(
	planKey: string,
): Promise<PurchaseMembershipResponse> {
	const { data } = await api.post<PurchaseMembershipResponse>(
		'/membership/purchase',
		{ planKey },
	);
	return data;
}
