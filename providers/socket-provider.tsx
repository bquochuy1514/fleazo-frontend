'use client';

import { createContext, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { getStoredAccessToken } from '@/lib/api';

type SocketContextValue = {
	socket: Socket | null;
};

export const SocketContext = createContext<SocketContextValue>({
	socket: null,
});

// Connects once, app-wide, as soon as the user logs in — not only while the
// Chat page is open, so online status reflects general app presence (see
// backend AGENTS.md → Chat: online status is meant to signal "likely to
// respond right now", which only makes sense if it tracks app presence, not
// just chat-tab presence).
export function SocketProvider({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();
	const [socket, setSocket] = useState<Socket | null>(null);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (isLoading) return;

		if (!user) {
			socketRef.current?.disconnect();
			socketRef.current = null;
			queueMicrotask(() => setSocket(null));
			return;
		}

		const token = getStoredAccessToken();
		if (!token) return;

		const instance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
			auth: { token },
		});
		socketRef.current = instance;
		queueMicrotask(() => setSocket(instance));

		return () => {
			instance.disconnect();
			socketRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, isLoading]);

	return (
		<SocketContext.Provider value={{ socket }}>
			{children}
		</SocketContext.Provider>
	);
}
