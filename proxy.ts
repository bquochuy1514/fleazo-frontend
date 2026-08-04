import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedPath } from '@/lib/protected-paths';

// Route prefixes under the (auth) group — a signed-in visitor has no reason
// to see these, and without this check they'd flash the form for one round
// trip before GuestOnlyGuard's client-side effect catches up and bounces
// them (see components/auth/guest-only-guard.tsx). Kept separate from
// PROTECTED_PATHS: that list is "needs a session", this one is "needs the
// absence of one" — a page is never in both.
const AUTH_PATHS = [
	'/dang-nhap',
	'/dang-ky',
	'/xac-thuc-tai-khoan',
	'/quen-mat-khau',
	'/xac-thuc-otp-quen-mat-khau',
	'/dat-lai-mat-khau',
	'/google-callback',
];

// Ported from fleazo-frontend's proxy.ts. `fz_session` is a plain cookie
// mirroring "a token is stored client-side" (see lib/session-flag.ts) — the
// edge has no access to localStorage, so this is the only signal available
// before a page renders. Actual auth still lives in the Bearer token; this
// only decides which page to show first.
export function proxy(request: NextRequest) {
	const hasSession = request.cookies.get('fz_session')?.value === '1';
	const { pathname, search } = request.nextUrl;

	if (isProtectedPath(pathname) && !hasSession) {
		// ?next= so dang-nhap-client.tsx sends the visitor back to what they
		// tapped instead of home — same contract as ProtectedGuard's redirect.
		const loginUrl = new URL('/dang-nhap', request.url);
		loginUrl.searchParams.set('next', pathname + search);
		return NextResponse.redirect(loginUrl);
	}
	if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && hasSession) {
		return NextResponse.redirect(new URL('/', request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
