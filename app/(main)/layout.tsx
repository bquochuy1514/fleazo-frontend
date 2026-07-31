import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';

// Marketplace shell with full chrome. Pages wanting less chrome live in the
// sibling (header-only)/(bare) groups — a layout nested deeper inside this one
// cannot un-render what's below.
//
// No top padding here on purpose: Header is fixed and takes no flow space, so
// a page with a full-bleed hero (Home) wants content starting at y=0. Pages
// without one add their own top padding.
export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-full flex-1 flex-col pb-16 md:pb-0">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
			<BottomNav />
		</div>
	);
}
