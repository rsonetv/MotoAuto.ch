import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Listing } from '@/lib/schemas/listing';
import { columns } from './columns';
import { DataTable } from './data-table';

async function getListings(): Promise<Listing[]> {
	const supabase = createServerComponentClient({ cookies });
	const { data, error } = await supabase
		.from('listings')
		.select(
			`
            id,
            title,
            vehicle_id: id,
            created_at,
            status,
            profiles (
                full_name,
                email
            ),
            flags: listing_flags (
                count
            )
        `
		)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching listings:', error);
		return [];
	}

	return data.map((listing: any) => ({
		id: listing.id,
		title: listing.title,
		vehicle_id: listing.vehicle_id,
		author: {
			name: listing.profiles.full_name,
			email: listing.profiles.email,
		},
		status: listing.status,
		flags: listing.flags[0]?.count || 0,
		created_at: listing.created_at,
		image_url: '', // Placeholder for now
	}));
}

export default async function AdminListingsPage() {
	const listings = await getListings();

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-2xl font-bold">Listings Management</h1>
			<DataTable columns={columns} data={listings} />
		</div>
	);
}