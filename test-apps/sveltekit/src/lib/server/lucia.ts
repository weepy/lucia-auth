import lucia, { generateRandomString } from 'lucia-auth';
import supabase from '@lucia-auth/adapter-supabase';
import { dev } from '$app/environment';
import { SUPABASE_URL, SUPABASE_SECRET } from '$env/static/private';

export const auth = lucia({
	adapter: supabase(SUPABASE_URL, SUPABASE_SECRET),
	env: dev ? 'DEV' : 'PROD',
	generateCustomUserId: async () => generateRandomString(8),
	sessionTimeout: 1000 * 5,
	transformUserData: (userData) => {
		return {
			userId: userData.id,
			username: userData.username
		};
	}
});

export type Auth = typeof auth;
