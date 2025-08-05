import { z } from 'zod';

export const userSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	last_sign_in_at: z.string(),
	role: z.string(),
	kyc_status: z.string(),
	profile: z.object({
		full_name: z.string().nullable(),
		avatar_url: z.string().url().nullable(),
	}),
});

export type User = z.infer<typeof userSchema>;