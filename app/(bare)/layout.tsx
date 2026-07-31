// No chrome at all — for short, focused, logged-in-only flows where even the
// Header would be a distraction. Content sits directly on the page background.
//
// ⚠️ No pages live here yet. Before the first one lands, wrap `children` in a
// ProtectedGuard — this group is logged-in-only, and that guard needs
// AuthProvider, which doesn't exist in this repo yet.
export default function BareLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-dvh flex-1 items-center justify-center px-4 py-10">
			{children}
		</div>
	);
}
