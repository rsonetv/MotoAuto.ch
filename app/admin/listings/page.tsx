import { getListings } from '@/lib/actions/listing'
import { columns } from './columns'
import { DataTable } from './data-table'

export default async function AdminListingsPage() {
  const listings = await getListings()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold">Listings Management</h1>
      <DataTable columns={columns} data={listings} />
    </div>
  )
}