import { z } from "zod";

export const listingSchema = z.object({
  id: z.string(),
  title: z.string(),
  vehicle_id: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  status: z.enum(["Active", "Pending Review", "Rejected", "Sold"]),
  flags: z.number().int().min(0),
  created_at: z.string().datetime(),
  image_url: z.string().url().optional(),
});

export type Listing = z.infer<typeof listingSchema>;