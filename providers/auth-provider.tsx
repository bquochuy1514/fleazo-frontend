'use client';

import { createContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
	api,
	getStoredAccessToken,
	registerAuthFailureHandler,
} from '@/lib/api';
import { isProtectedPath } from '@/lib/protected-paths';
import { clearSessionFlag } from '@/lib/session-flag';
import type { User } from '@/types/user.types';

type AuthContextValue = {
	user: User | null;
	isLoading: boolean;
	login: (accessToken: string) => Promise<void>;
	logout: () => Promise<void>;
	// Guards against a route-guard redirect race during logout: true while
	// logout() is deciding whether to redirect, so the guard skips its own
	// /dang-nhap redirect for that one tick instead of double-handling it.
	isLoggingOut: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
	undefined,
);

// Token attached by hand (no interceptor). Returns null on any failure —
// caller treats that as "not logged in".
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
	const pathname = usePathname();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	// Returning visitor: fetch profile once on mount so refresh doesn't log out.
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
		// Only bounce home from protected pages — public pages have nothing to guard.
		if (isProtectedPath(pathname)) router.push('/');
		setIsLoggingOut(false);
	};

	// Registers this logout as api.ts's 401-exhausted-refresh handler.
	// Ref + one-time registration so the interceptor always calls the
	// latest closure without re-registering every render.
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
