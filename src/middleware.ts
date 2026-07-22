import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS: string[] = [
	// thêm dần khi build trang trong (protected): "/ca-nhan", "/dang-tin", "/chat", ...
	'/dang-tin',
];

const AUTH_PATHS = [
	'/dang-nhap',
	'/dang-ky',
	'/xac-thuc-tai-khoan',
	'/quen-mat-khau',
	'/xac-thuc-quen-mat-khau',
	'/dat-lai-mat-khau',
	'/google-callback',
];

export function middleware(request: NextRequest) {
	const hasSession = request.cookies.get('fz_session')?.value === '1';
	const { pathname } = request.nextUrl;

	const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
	const isAuthOnly = AUTH_PATHS.some((p) => pathname.startsWith(p));

	if (isProtected && !hasSession) {
		return NextResponse.redirect(new URL('/dang-nhap', request.url));
	}
	if (isAuthOnly && hasSession) {
		return NextResponse.redirect(new URL('/', request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
