import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ListingListSkeleton } from './_components/listing-row-skeleton';
import { QuanLyTinClient } from './quan-ly-tin-client';

export const metadata: Metadata = {
	title: 'Quản lý tin — Fleazo',
};

// Suspense is required, not optional: the client reads useSearchParams (the
// status/search filters live in the URL), which Next refuses to prerender
// without a boundary.
export default function QuanLyTinPage() {
	return (
		<Suspense
			fallback={
				<div className="mx-auto min-h-[calc(100dvh+3rem)] max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
					<ListingListSkeleton />
				</div>
			}
		>
			<QuanLyTinClient />
		</Suspense>
	);
}
