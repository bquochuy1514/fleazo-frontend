'use client';

import { createContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { clearSessionFlag } from '@/lib/session-flag';
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

		if (token) {
			try {
				await api.post<{ message: string }>(
					'/auth/logout',
					{},
					{ headers: { Authorization: `Bearer ${token}` } },
				);
			} catch {
				// best-effort — still clear local state even if this fails
			}
		}

		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		// do not have refresh_token in the sessionStorage
		sessionStorage.removeItem('access_token');
		clearSessionFlag();
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
