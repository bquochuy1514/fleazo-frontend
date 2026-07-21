import axios, { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export { isAxiosError };

// Shared axios-error parser (see AGENTS.md → Form Conventions). Returns the
// full ApiErrorResponse, including errorCode, so callers can branch on the
// return value directly — reading it back off state right after setErrors
// would still see the old value, since setState isn't synchronous.
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

// NOTE: auth interceptors (attach access token, 401 → refresh → retry)
// still need to be built — token storage strategy is already decided,
// see AGENTS.md → Tech Stack → Confirmed.
