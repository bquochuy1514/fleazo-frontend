import { Header } from '@/components/layout/header';
import { ProtectedGuard } from '@/components/auth/protected-guard';
import { getProvinces } from '@/lib/locations';

// Header only — no Footer/BottomNav. For focused logged-in task flows
// (dang-tin, tin-nhan) where marketplace nav still helps wayfinding but the
// rest of the chrome would pull focus mid-task.
//
// pt clears the fixed Header, which occupies no flow space; unlike (main),
// nothing here has a full-bleed hero to sit underneath it.
export default async function HeaderOnlyLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Same cached server fetch the (main) layout uses — see its comment.
	const provinces = await getProvinces();

	return (
		<div className="flex min-h-full flex-1 flex-col">
			<Header provinces={provinces} />
			<main className="flex-1 pt-24">
				<ProtectedGuard>{children}</ProtectedGuard>
			</main>
		</div>
	);
}
