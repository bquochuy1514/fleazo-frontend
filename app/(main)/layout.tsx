import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { getProvinces } from '@/lib/locations';
import { getCategories } from '@/lib/categories';

// Marketplace shell with full chrome; (header-only)/(bare) groups have less.
//
// No top padding: Header is fixed, so Home's full-bleed hero starts at y=0.
// Other pages add their own top padding.
// Provinces fetched here (not in Header) so Header can stay client-side
// without a network call; `getProvinces` is a cached server fetch.
export default async function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [provinces, categories] = await Promise.all([
		getProvinces(),
		getCategories(),
	]);

	return (
		<div className="flex min-h-full flex-1 flex-col pb-16 md:pb-0">
			<Header provinces={provinces} />
			<main className="min-w-0 flex-1">{children}</main>
			<Footer categories={categories} />
			<BottomNav />
		</div>
	);
}
