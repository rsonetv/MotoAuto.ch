import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { Payment } from "@/lib/schemas/payment"
import { columns } from "./columns"
import { DataTable } from "./data-table"

async function getPayments(): Promise<Payment[]> {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase.from("payments").select()

  if (error) {
    console.error("Error fetching payments:", error)
    return []
  }

  return data as Payment[]
}

export default async function PaymentsPage() {
  const data = await getPayments()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Payment Management</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}