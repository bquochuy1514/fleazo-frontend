import { ProtectedGuard } from '@/components/auth/protected-guard';

// No marketplace chrome at all — a neutral, full-height passthrough. Does NOT
// force centering/padding: a full-bleed page (e.g. /tin-nhan) can't opt out of
// that if the shell provides it, but a page wanting a centered card can trivially
// wrap itself in one. Every occupant still needs a session — same ProtectedGuard
// (header-only) uses, just without a Header/provinces fetch (nothing here renders one).
export default function BareLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-dvh flex-1 flex-col">
			<ProtectedGuard>{children}</ProtectedGuard>
		</div>
	);
}
