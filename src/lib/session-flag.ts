const COOKIE_NAME = 'fz_session';
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày — khớp thời gian sống refresh token backend

export function setSessionFlag(remember: boolean) {
	const maxAge = remember ? `max-age=${REMEMBER_MAX_AGE}` : '';
	document.cookie = `${COOKIE_NAME}=1; path=/; ${maxAge}; samesite=lax`;
}

export function clearSessionFlag() {
	document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
