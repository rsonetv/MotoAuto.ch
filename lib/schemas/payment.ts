import { z } from 'zod';

export const paymentSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  amount: z.number(),
  commission: z.number(),
  status: z.enum(['succeeded', 'pending', 'failed', 'refunded']),
  created_at: z.string(),
  stripe_charge_id: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;