// A lightweight "am I logged in" cookie — NOT the JWT itself, which never
// touches a cookie (see lib/api.ts, tokens live in local/sessionStorage).
// This exists for the (planned) proxy.ts route guard: middleware runs on the
// edge before any client JS, so it can't read localStorage — this cookie is
// the cheap, optimistic signal it checks instead. Ported unchanged from
// fleazo-frontend; has no reader yet in this repo (proxy.ts isn't built),
// only a writer — the login page sets it the moment it has a real session.
const COOKIE_NAME = 'fz_session';
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 7; // 7 days — matches the refresh token's backend lifetime

export function setSessionFlag(remember: boolean) {
	const maxAge = remember ? `max-age=${REMEMBER_MAX_AGE}` : '';
	document.cookie = `${COOKIE_NAME}=1; path=/; ${maxAge}; samesite=lax`;
}

export function clearSessionFlag() {
	document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
