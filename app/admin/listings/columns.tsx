'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Listing } from '@/lib/schemas/listing'
import { Checkbox } from '@/components/ui/checkbox'
import {
  featureListing,
  updateListingStatus,
} from '@/lib/actions/listing'
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export const columns: ColumnDef<Listing>[] = [
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
		accessorKey: 'title',
		header: 'Listing',
		cell: ({ row }) => {
			const listing = row.original;
			return (
				<div className="flex items-center">
					{listing.image_url && (
						<Image
							src={listing.image_url}
							alt={listing.title}
							width={64}
							height={64}
							className="mr-4 h-16 w-16 rounded-md object-cover"
						/>
					)}
					<div>
						<div className="font-medium">{listing.title}</div>
						<div className="text-sm text-muted-foreground">
							ID: {listing.vehicle_id}
						</div>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: 'author',
		header: 'Author',
		cell: ({ row }) => {
			const author = row.original.author;
			return (
				<div>
					<div>{author.name}</div>
					<div className="text-sm text-muted-foreground">{author.email}</div>
				</div>
			);
		},
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.original.status;
			let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
				'secondary';
			if (status === 'active') variant = 'default'
			if (status === 'rejected') variant = 'destructive'
			if (status === 'suspended') variant = 'outline'

			return <Badge variant={variant}>{status}</Badge>;
		},
	},
	{
		accessorKey: 'flags',
		header: 'Content Flags',
	},
	{
		accessorKey: 'created_at',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Creation Date
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = new Date(row.original.created_at);
			return <div>{date.toLocaleDateString()}</div>;
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const listing = row.original;
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
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(listing.id)}
						>
							Copy listing ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
						        onClick={() => updateListingStatus(listing.id, 'active')}
						      >
						        Approve
						      </DropdownMenuItem>
						      <DropdownMenuItem
						        onClick={() => updateListingStatus(listing.id, 'rejected')}
						      >
						        Reject
						      </DropdownMenuItem>
						      <DropdownMenuItem
						        onClick={() => updateListingStatus(listing.id, 'suspended')}
						      >
						        Suspend
						      </DropdownMenuItem>
						      <DropdownMenuSeparator />
						      <DropdownMenuItem
						        onClick={() => featureListing(listing.id, !listing.is_featured)}
						      >
						        {listing.is_featured ? 'Unfeature' : 'Feature'}
						      </DropdownMenuItem>
						      <DropdownMenuSeparator />
						<DropdownMenuItem>View Details</DropdownMenuItem>
						<DropdownMenuItem>Edit SEO</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];