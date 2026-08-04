import { ProtectedGuard } from '@/components/auth/protected-guard';

// Logged-in pages that still want full marketplace chrome from (main).
// Keep PROTECTED_PATHS (lib/protected-paths.ts) in sync with what lands here.
export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <ProtectedGuard>{children}</ProtectedGuard>;
}
