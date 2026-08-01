import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { getProvinces } from '@/lib/locations';

// Marketplace shell with full chrome. Pages wanting less chrome live in the
// sibling (header-only)/(bare) groups — a layout nested deeper inside this one
// cannot un-render what's below.
//
// No top padding here on purpose: Header is fixed and takes no flow space, so
// a page with a full-bleed hero (Home) wants content starting at y=0. Pages
// without one add their own top padding.
// The province list is fetched here rather than inside the Header so the
// Header can stay a client component (it needs scroll state) without pulling
// a network call into the browser. `getProvinces` is a cached server fetch,
// so this costs one outbound request a day, not one per page.
export default async function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const provinces = await getProvinces();

	return (
		<div className="flex min-h-full flex-1 flex-col pb-16 md:pb-0">
			<Header provinces={provinces} />
			<main className="flex-1">
				{children}
				<div className="h-[1000px]"></div>
			</main>
			<Footer />
			<BottomNav />
		</div>
	);
}
