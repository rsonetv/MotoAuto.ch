"use client"

import * as React from "react"
import { columns } from "./tickets/columns"
import { DataTable } from "./tickets/data-table"
import { TicketView } from "@/components/admin/support/ticket-view"
import { Ticket } from "@/lib/schemas/support"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"

const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    subject: "Cannot reset my password",
    user: { id: "USR-001", name: "John Doe", email: "john.doe@example.com" },
    status: "Open",
    priority: "High",
    lastUpdatedAt: new Date(),
    createdAt: new Date(),
    messages: [
      {
        id: "MSG-001",
        ticketId: "TKT-001",
        sender: "user",
        content: "I'm trying to reset my password but I'm not receiving the email.",
        createdAt: new Date(),
      },
      {
        id: "MSG-002",
        ticketId: "TKT-001",
        sender: "admin",
        content: "We are looking into this issue.",
        createdAt: new Date(new Date().getTime() + 5 * 60000),
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "Billing issue",
    user: { id: "USR-002", name: "Jane Smith", email: "jane.smith@example.com" },
    status: "In Progress",
    priority: "Medium",
    lastUpdatedAt: new Date(new Date().getTime() - 24 * 60 * 60000),
    createdAt: new Date(new Date().getTime() - 24 * 60 * 60000),
    messages: [
        {
            id: "MSG-003",
            ticketId: "TKT-002",
            sender: "user",
            content: "I was double-charged for my last purchase.",
            createdAt: new Date(new Date().getTime() - 24 * 60 * 60000),
        }
    ],
  },
  {
    id: "TKT-003",
    subject: "Feature request: Dark mode",
    user: { id: "USR-003", name: "Peter Jones", email: "peter.jones@example.com" },
    status: "Closed",
    priority: "Low",
    lastUpdatedAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60000),
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60000),
    messages: [
        {
            id: "MSG-004",
            ticketId: "TKT-003",
            sender: "user",
            content: "Please add a dark mode to the dashboard.",
            createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60000),
        },
        {
            id: "MSG-005",
            ticketId: "TKT-003",
            sender: "admin",
            content: "Thank you for your feedback. We've added it to our roadmap.",
            createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60000 + 10 * 60000),
        }
    ],
  },
]

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
    mockTickets[0]
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">
          Manage and respond to user support tickets.
        </p>
      </div>
      <Separator />
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel defaultSize={40}>
          <div className="p-4 h-full overflow-y-auto">
            <DataTable
              columns={columns}
              data={mockTickets}
              onRowClick={(row) => setSelectedTicket(row.original)}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div className="p-4 h-full">
            <TicketView ticket={selectedTicket} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}