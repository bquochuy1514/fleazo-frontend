import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export { isAxiosError };

// Returns the full ApiErrorResponse (incl. errorCode) so callers can branch
// on the return value directly — reading it back off state right after
// setErrors would still see the old value, since setState isn't synchronous.
export function parseApiError<TFields extends string = string>(
	err: unknown,
): ApiErrorResponse<TFields> {
	const res = isAxiosError<ApiErrorResponse<TFields>>(err)
		? err.response?.data
		: undefined;
	const hasFieldErrors = res?.errors && Object.keys(res.errors).length > 0;

	return {
		...(hasFieldErrors
			? { errors: res.errors }
			: {
					message:
						res?.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
				}),
		errorCode: res?.errorCode,
	};
}

export function getStoredAccessToken(): string | null {
	if (typeof window === 'undefined') return null;
	return (
		localStorage.getItem('access_token') ??
		sessionStorage.getItem('access_token')
	);
}

// Refresh token lives in localStorage (remember-me checked) OR
// sessionStorage (not checked). Returns which Storage actually has it, so
// refreshAccessToken() writes the new tokens back to that same one.
function getRefreshTokenStorage(): Storage | null {
	if (typeof window === 'undefined') return null;
	if (localStorage.getItem('refresh_token')) return localStorage;
	if (sessionStorage.getItem('refresh_token')) return sessionStorage;
	return null;
}

// Request interceptor — attaches the access token to every call, unless the
// caller already set Authorization by hand (the one exception: the refresh
// call below needs to send the REFRESH token instead, in the same header).
api.interceptors.request.use((config) => {
	if (!config.headers.Authorization) {
		const token = getStoredAccessToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

// Registered once by AuthProvider on mount (its own `logout`) — api.ts is a
// plain module, not a React component/hook, so it can't call useAuth()
// itself; this is the hook the response interceptor calls into instead.
type AuthFailureHandler = () => void;
let authFailureHandler: AuthFailureHandler | null = null;

export function registerAuthFailureHandler(handler: AuthFailureHandler) {
	authFailureHandler = handler;
}

// 401s here are never "access token expired" — login/register failures are
// normal (wrong password), and a 401 from refresh/logout themselves must
// never trigger another refresh attempt (would recurse).
const AUTH_EXEMPT_PATHS = [
	'/auth/login',
	'/auth/register',
	'/auth/refresh',
	'/auth/logout',
];

type RetriableRequestConfig = InternalAxiosRequestConfig & {
	_retried?: boolean;
};

// Dedup concurrent 401s during a page with several parallel requests — only
// one actually calls /auth/refresh; the rest await the same promise.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
	const storage = getRefreshTokenStorage();
	const refreshToken = storage?.getItem('refresh_token');
	if (!storage || !refreshToken) return null;

	try {
		const { data } = await api.post<{
			access_token: string;
			refresh_token: string;
		}>(
			'/auth/refresh',
			{},
			{ headers: { Authorization: `Bearer ${refreshToken}` } },
		);
		storage.setItem('access_token', data.access_token);
		storage.setItem('refresh_token', data.refresh_token);
		return data.access_token;
	} catch {
		return null;
	}
}

api.interceptors.response.use(
	(res) => res,
	async (error: unknown) => {
		if (!isAxiosError(error) || error.response?.status !== 401) {
			return Promise.reject(error);
		}

		const originalRequest = error.config as
			| RetriableRequestConfig
			| undefined;
		if (!originalRequest) return Promise.reject(error);

		const url = originalRequest.url ?? '';
		if (AUTH_EXEMPT_PATHS.some((path) => url.includes(path))) {
			return Promise.reject(error);
		}

		// Never had a token attached in the first place — not a session
		// expiry, just an unauthenticated call that isn't allowed
		if (!originalRequest.headers?.Authorization) {
			return Promise.reject(error);
		}

		// Already retried once with a refreshed token and still 401ing —
		// the session is genuinely dead, stop here
		if (originalRequest._retried) {
			authFailureHandler?.();
			return Promise.reject(error);
		}

		if (!refreshPromise) {
			refreshPromise = refreshAccessToken().finally(() => {
				refreshPromise = null;
			});
		}
		const newAccessToken = await refreshPromise;

		if (!newAccessToken) {
			authFailureHandler?.();
			return Promise.reject(error);
		}

		originalRequest._retried = true;
		originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
		return api(originalRequest);
	},
);
