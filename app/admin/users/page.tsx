import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

import { columns } from './columns';
import { DataTable } from './data-table';
import { userSchema } from '@/lib/schemas/user';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Simulate a database read for users.
async function getUsers() {
	const cookieStore = await cookies();
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
			},
		}
	);
	const {
		data: { users: authUsers },
		error,
	} = await supabase.auth.admin.listUsers();

	if (error) {
		console.error('Error fetching users:', error);
		return [];
	}

	// Enrich user data with profile information if needed
	const users = await Promise.all(
		authUsers.map(async (user: any) => {
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (profileError) {
				console.error(`Error fetching profile for user ${user.id}:`, profileError);
			}

			return {
				...user,
				profile: profile || {},
				last_sign_in_at: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A',
				role: user.user_metadata?.role || 'User',
				kyc_status: profile?.kyc_status || 'Not Started',
			};
		})
	);

	return z.array(userSchema).parse(users);
}

export default async function TaskPage() {
	const users = await getUsers();

	return (
		<>
			<div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
				<div className="flex items-center justify-between space-y-2">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">User Management</h2>
						<p className="text-muted-foreground">
							Here's a list of all users in the system.
						</p>
					</div>
				</div>
				<DataTable data={users} columns={columns} />
			</div>
		</>
	);
}