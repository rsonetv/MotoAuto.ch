"use client"

import { Ticket, Message } from "@/lib/schemas/support"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface TicketViewProps {
  ticket: Ticket | null
}

export function TicketView({ ticket }: TicketViewProps) {
  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a ticket to view</p>
      </div>
    )
  }

  const handleReply = () => {
    // In a real app, you'd handle the reply logic here.
    // For now, we'll just log to the console.
    const replyContent = (document.getElementById("reply-textarea") as HTMLTextAreaElement)?.value
    console.log("Reply:", replyContent)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{ticket.subject}</CardTitle>
        <div className="text-sm text-muted-foreground">
          From: {ticket.user.name} ({ticket.user.email})
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-grow p-6 space-y-4 overflow-y-auto">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-4 ${
              message.sender === "admin" ? "justify-end" : ""
            }`}
          >
            {message.sender === "user" && (
              <Avatar>
                <AvatarFallback>{ticket.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-lg p-3 max-w-[75%] ${
                message.sender === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {message.createdAt.toLocaleTimeString()}
              </p>
            </div>
            {message.sender === "admin" && (
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </CardContent>
      <Separator />
      <CardFooter className="p-4 border-t">
        <div className="w-full space-y-2">
          <Textarea id="reply-textarea" placeholder="Type your reply here..." />
          <Button onClick={handleReply}>Send Reply</Button>
        </div>
      </CardFooter>
    </Card>
  )
}