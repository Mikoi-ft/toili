import { z } from "zod";

export const rsvpInputSchema = z.object({
  name: z.string().min(1).max(120),
  attending: z.boolean(),
  guests: z.number().int().min(1).max(20),
  message: z.string().max(500).optional(),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;
