// Non-httpOnly cookie mirroring "is a token stored client-side", since
// proxy.ts runs on the edge with no access to web storage. Carries no auth
// weight itself — backend never reads it; forging it can't bypass Bearer auth.
const COOKIE_NAME = 'fz_session';
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, matches the backend's refresh-token lifetime

export function setSessionFlag(remember: boolean) {
	const maxAge = remember ? `max-age=${REMEMBER_MAX_AGE}` : '';
	document.cookie = `${COOKIE_NAME}=1; path=/; ${maxAge}; samesite=lax`;
}

export function clearSessionFlag() {
	document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
