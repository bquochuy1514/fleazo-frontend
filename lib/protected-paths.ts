// Route prefixes requiring a signed-in user; keep in sync with routes
// wrapped in ProtectedGuard. Checked against pathname since route groups
// like `(header-only)` never appear in the URL.
export const PROTECTED_PATHS = ['/dang-tin'] as const;

export function isProtectedPath(pathname: string): boolean {
	return PROTECTED_PATHS.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);
}
