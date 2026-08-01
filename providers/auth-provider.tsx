'use client';

import { createContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
	api,
	getStoredAccessToken,
	registerAuthFailureHandler,
} from '@/lib/api';
import { clearSessionFlag } from '@/lib/session-flag';
import type { User } from '@/types/user.types';

type AuthContextValue = {
	user: User | null;
	isLoading: boolean;
	login: (accessToken: string) => Promise<void>;
	logout: () => Promise<void>;
	// Set true at the start of logout(), before setUser(null); cleared again
	// by the next successful login() — never reset by the guard itself (that
	// re-triggers its own effect and defeats the flag, see git history). Lets
	// (protected)/layout.tsx's guard tell "user just logged out" apart from
	// "session genuinely stale/missing" and skip its own /dang-nhap redirect,
	// since logout() already navigates home itself. See (protected)/layout.tsx.
	isLoggingOut: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
	undefined,
);

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
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

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
			if (!profile) {
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
				sessionStorage.removeItem('access_token');
				sessionStorage.removeItem('refresh_token');
				clearSessionFlag();
			}
			setUser(profile);
			setIsLoading(false);
		});
	}, []);

	const login = async (accessToken: string) => {
		const profile = await fetchProfile(accessToken);
		setUser(profile);
		setIsLoggingOut(false);
	};

	const logout = async () => {
		setIsLoggingOut(true);
		const token = getStoredAccessToken();

		if (token) {
			try {
				const { data } = await api.post<{ message: string }>(
					'/auth/logout',
					{},
					{ headers: { Authorization: `Bearer ${token}` } },
				);
				toast.success(data.message);
			} catch {
				// best-effort — still clear local state even if this fails
			}
		}

		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		sessionStorage.removeItem('access_token');
		sessionStorage.removeItem('refresh_token');

		clearSessionFlag();
		setUser(null);
		router.push('/');
	};

	// Registers this provider's own logout as api.ts's 401-exhausted-refresh
	// handler (see lib/api.ts) — api.ts is a plain module, can't call
	// useAuth()/useRouter() itself, so it calls back into this instead. Kept
	// behind a ref + one-time registration so the interceptor always calls
	// the latest logout closure without re-registering on every render.
	const logoutRef = useRef(logout);

	useEffect(() => {
		logoutRef.current = logout;
	});

	useEffect(() => {
		registerAuthFailureHandler(() => {
			void logoutRef.current();
		});
	}, []);

	return (
		<AuthContext.Provider
			value={{ user, isLoading, login, logout, isLoggingOut }}
		>
			{children}
		</AuthContext.Provider>
	);
}
