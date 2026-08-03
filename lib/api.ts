import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export { isAxiosError };

// Returns the full ApiErrorResponse so callers can branch on the return
// value directly, rather than reading stale state right after setErrors.
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

// Refresh token lives in localStorage (remember-me) or sessionStorage.
// Returns whichever has it, so the new tokens get written back to the same one.
function getRefreshTokenStorage(): Storage | null {
	if (typeof window === 'undefined') return null;
	if (localStorage.getItem('refresh_token')) return localStorage;
	if (sessionStorage.getItem('refresh_token')) return sessionStorage;
	return null;
}

// Attaches the access token to every call, unless Authorization is already
// set (refresh call below sends the refresh token instead).
api.interceptors.request.use((config) => {
	if (!config.headers.Authorization) {
		const token = getStoredAccessToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

// Set by AuthProvider on mount — api.ts can't call useAuth() itself (not a
// component/hook), so the interceptor calls this instead.
type AuthFailureHandler = () => void;
let authFailureHandler: AuthFailureHandler | null = null;

export function registerAuthFailureHandler(handler: AuthFailureHandler) {
	authFailureHandler = handler;
}

// 401s here aren't token expiry — login/register 401s are normal (wrong
// password), and refresh/logout 401s must not trigger another refresh (recursion).
const AUTH_EXEMPT_PATHS = [
	'/auth/login',
	'/auth/register',
	'/auth/refresh',
	'/auth/logout',
];

type RetriableRequestConfig = InternalAxiosRequestConfig & {
	_retried?: boolean;
};

// Dedup concurrent 401s — only one call hits /auth/refresh, rest await it.
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

		// No token was attached — unauthenticated call, not a session expiry
		if (!originalRequest.headers?.Authorization) {
			return Promise.reject(error);
		}

		// Already retried with a refreshed token and still 401ing — session is dead
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
