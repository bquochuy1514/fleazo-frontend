import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

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
			<main className="flex-1">{children}</main>
			<Footer />
		</>
	);
}
