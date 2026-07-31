// Auth screens: no marketplace chrome at all, content centred on the page.
//
// ⚠️ No pages live here yet. Before the first one lands, wrap `children` in a
// GuestOnlyGuard so an already-logged-in visitor gets redirected away — that
// guard needs AuthProvider, which doesn't exist in this repo yet.
export default function AuthLayout({
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
