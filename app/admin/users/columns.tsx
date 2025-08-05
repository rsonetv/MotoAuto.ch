'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/lib/schemas/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const columns: ColumnDef<User>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={value => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'email',
		header: 'User',
		cell: ({ row }) => {
			const user = row.original;
			return (
				<div className="flex items-center space-x-2">
					<Avatar>
						<AvatarImage src={user.profile?.avatar_url} />
						<AvatarFallback>
							{user.email ? user.email.charAt(0).toUpperCase() : '?'}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">{user.profile?.full_name || 'N/A'}</div>
						<div className="text-sm text-muted-foreground">{user.email}</div>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: 'role',
		header: 'Role',
	},
	{
		accessorKey: 'kyc_status',
		header: 'KYC Status',
	},
	{
		accessorKey: 'last_sign_in_at',
		header: 'Last Login',
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const user = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => console.log('View profile', user.id)}>
							View Profile
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => console.log('Edit user', user.id)}>
							Edit User
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => console.log('Suspend user', user.id)}>
							Suspend User
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];