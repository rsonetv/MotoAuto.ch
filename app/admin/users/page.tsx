import { columns } from './columns'
import { DataTable } from './data-table'
import { getUsers } from '@/lib/actions/user'


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