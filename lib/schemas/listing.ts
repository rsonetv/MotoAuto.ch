import { z } from "zod";

export const listingSchema = z.object({
  id: z.string(),
  title: z.string(),
  vehicle_id: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  status: z.enum(['active', 'pending', 'rejected', 'suspended']),
  flags: z.number().int().min(0),
  created_at: z.string().datetime(),
  image_url: z.string().url().optional(),
  is_featured: z.boolean().optional(),
 });

export type Listing = z.infer<typeof listingSchema>;