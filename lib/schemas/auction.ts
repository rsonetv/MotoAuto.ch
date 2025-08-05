import { z } from 'zod';

export const auctionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.enum(['live', 'upcoming', 'finished']),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  current_bid: z.number().nullable(),
  winning_bid: z.number().nullable(),
  // Add other auction fields as needed
});

export type Auction = z.infer<typeof auctionSchema>;