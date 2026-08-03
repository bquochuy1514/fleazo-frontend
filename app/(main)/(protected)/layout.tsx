// Logged-in pages that still want full marketplace chrome from (main).
//
// TODO: wrap `children` in a ProtectedGuard once AuthProvider exists.
export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
