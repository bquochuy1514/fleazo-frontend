'use client';

import { createContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { User } from '@/types/user.types';

type AuthContextValue = {
	user: User | null;
	isLoading: boolean;
	login: (accessToken: string) => Promise<void>;
	logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
	undefined,
);

// Checks localStorage first, then sessionStorage — matches the remember-me
// split in login/page.tsx (localStorage if remembered, sessionStorage if not).
function getStoredAccessToken(): string | null {
	return (
		localStorage.getItem('access_token') ??
		sessionStorage.getItem('access_token')
	);
}

// No interceptor — token is attached by hand for this one call. Returns
// null on any failure (expired/invalid token, network error): the caller
// treats that as "not logged in", never throws further up.
async function fetchProfile(accessToken: string): Promise<User | null> {
	try {
		const { data } = await api.get<User>('/users/profile', {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return data;
	} catch {
		return null;
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// On mount: if a token is already sitting in storage (returning visitor),
	// fetch the profile once so refreshing the page doesn't log anyone out.
	useEffect(() => {
		const token = getStoredAccessToken();

		if (!token) {
			// queueMicrotask avoids react-hooks/set-state-in-effect
			queueMicrotask(() => setIsLoading(false));
			return;
		}

		fetchProfile(token).then((profile) => {
			setUser(profile);
			setIsLoading(false);
		});
	}, []);

	const login = async (accessToken: string) => {
		const profile = await fetchProfile(accessToken);
		setUser(profile);
	};

	const logout = async () => {
		const token = getStoredAccessToken();
		// Backend's own message ("Đăng xuất thành công.") — never hardcode
		// text the API already returns, same rule as ActionBanner (see
		// frontend AGENTS.md → Form Conventions). Fallback only covers the
		// best-effort-failure branch below, where there's no backend
		// message to use at all (no token, or the call itself failed).
		let message = 'Đã đăng xuất.';

		if (token) {
			try {
				const { data } = await api.post<{ message: string }>(
					'/auth/logout',
					{},
					{ headers: { Authorization: `Bearer ${token}` } },
				);
				message = data.message;
			} catch {
				// best-effort — still clear local state even if this fails
			}
		}

		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		// do not have refresh_token in the sessionStorage
		sessionStorage.removeItem('access_token');
		setUser(null);

		// Single source of truth for logout — AccountMenu and
		// MobileAccountSheet both call this same function, so the toast
		// fires regardless of which one triggered it.
		toast.success(message);
	};

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
