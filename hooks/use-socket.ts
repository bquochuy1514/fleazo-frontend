'use client';

import { useContext } from 'react';
import { SocketContext } from '@/providers/socket-provider';

// Returns null until the app-wide connection is up (or the user isn't
// logged in) — callers must guard against null, same shape as useAuth's user.
export function useSocket() {
	return useContext(SocketContext).socket;
}
