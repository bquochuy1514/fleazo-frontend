import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';

// Marketplace shell — wraps both (public) and (protected) pages.
// Must live here, not inside (public), so (protected) pages get Header/Footer too.
// See AGENTS.md → Project Structure.
export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Header />
			<BottomNav />
			<main className="flex-1">
				{children}
				<div className="min-h-[2000px]">Nội dung test scroll...</div>
			</main>
			<Footer />
		</>
	);
}
