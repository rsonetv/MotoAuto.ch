import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  sender: z.enum(['user', 'admin']),
  content: z.string(),
  createdAt: z.date(),
});

export const ticketSchema = z.object({
  id: z.string(),
  subject: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  status: z.enum(['Open', 'In Progress', 'Closed']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  lastUpdatedAt: z.date(),
  createdAt: z.date(),
  messages: z.array(messageSchema),
});

export type Ticket = z.infer<typeof ticketSchema>;
export type Message = z.infer<typeof messageSchema>;