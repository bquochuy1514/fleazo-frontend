// Logged-in pages that still want the full marketplace chrome from (main)
// above (ca-nhan, quan-ly-tin) — browsing-adjacent enough that BottomNav
// wayfinding still helps.
//
// ⚠️ No pages live here yet. Before the first one lands, wrap `children` in a
// ProtectedGuard — written ONCE here, never re-checked per page. That guard
// needs AuthProvider, which doesn't exist in this repo yet.
export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
