import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MembershipClient } from './membership-client';
import { MembershipSkeleton } from './_components/membership-skeleton';

export const metadata: Metadata = {
	title: 'Gói thành viên — Fleazo',
	description: 'Nâng cấp gói thành viên để đăng được nhiều tin hơn trên Fleazo.',
};

// Suspense is required: the client reads useSearchParams (the PayOS return
// query ?membership=success|cancelled), which Next refuses to prerender
// without a boundary — same reason quan-ly-tin needs one.
export default function MembershipPage() {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
					<MembershipSkeleton />
				</div>
			}
		>
			<MembershipClient />
		</Suspense>
	);
}
