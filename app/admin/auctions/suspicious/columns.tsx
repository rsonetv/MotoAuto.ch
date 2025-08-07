"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Auction } from "@/lib/schemas/auction"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Auction>[] = [
  {
    accessorKey: "title",
    header: "Auction Title",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
      if (status === 'live') variant = 'destructive'
      if (status === 'finished') variant = 'default'
      if (status === 'upcoming') variant = 'outline'
      
      return <Badge variant={variant}>{status}</Badge>
    }
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => new Date(row.getValue("start_time")).toLocaleString(),
  },
  {
    accessorKey: "end_time",
    header: "End Time",
    cell: ({ row }) => new Date(row.getValue("end_time")).toLocaleString(),
  },
  {
    accessorKey: "current_bid",
    header: "Current/Winning Bid",
    cell: ({ row }) => {
      const auction = row.original
      const amount = auction.status === 'finished' ? auction.winning_bid : auction.current_bid
      return amount ? `CHF ${amount.toLocaleString()}` : "No Bids"
    }
  },
  {
    header: "Reason for Flagging",
    cell: () => "Frequent bidding by one user"
  }
]