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
import {
  updateUserRole,
  suspendUser,
  verifyUserKyc,
} from '@/lib/actions/user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

// We can define a more specific type for the user data in the table
export type UserData = {
  id: string
  full_name: string | null
  email: string
  role: string
  is_verified: boolean
  created_at: string
  // This is a nested object in the original query
  profile?: {
    avatar_url?: string
  }
}

export const columns: ColumnDef<UserData>[] = [
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
			const user = row.original
			return (
				<div className="flex items-center space-x-2">
					<Avatar>
						<AvatarImage src={user.profile?.avatar_url} />
						<AvatarFallback>
							{user.email ? user.email.charAt(0).toUpperCase() : '?'}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">{user.full_name || 'N/A'}</div>
						<div className="text-sm text-muted-foreground">{user.email}</div>
					</div>
				</div>
			)
		},
	},
	{
		accessorKey: 'role',
		header: 'Role',
	},
	{
		accessorKey: 'is_verified',
		header: 'KYC Status',
		cell: ({ row }) => (row.original.is_verified ? 'Verified' : 'Not Verified'),
	},
	{
		accessorKey: 'created_at',
		header: 'Date Joined',
		cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
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
						<DropdownMenuItem asChild>
							<Link href={`/admin/users/${user.id}`}>View Profile</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() =>
								updateUserRole(
									user.id,
									user.role === 'admin' ? 'user' : 'admin'
								)
							}
						>
							{user.role === 'admin' ? 'Make User' : 'Make Admin'}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => suspendUser(user.id)}>
							Suspend User
						</DropdownMenuItem>
						{!user.is_verified && (
							<DropdownMenuItem onClick={() => verifyUserKyc(user.id)}>
								Verify KYC
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];