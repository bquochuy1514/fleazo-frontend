import axios from 'axios';

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export { isAxiosError } from 'axios';

// NOTE: auth interceptors (attach access token, 401 → refresh → retry)
// will be added when the auth module is built — token storage strategy
// is still undecided, see AGENTS.md → Tech Stack → Undecided
