import { z } from "zod";
import { locales } from "@/lib/i18n/locales";

export const invitationInputSchema = z.object({
  locale: z.enum(locales),
  templateId: z.string().min(1),
  coupleNames: z.string().min(1).max(120),
  eventDate: z.string().min(1), // ISO date "YYYY-MM-DD"
  eventTime: z.string().min(1),
  venueName: z.string().min(1).max(160),
  venueAddress: z.string().min(1).max(240),
  mapUrl: z.string().url().optional(),
  message: z.string().max(600).optional(),
});

export type InvitationInput = z.infer<typeof invitationInputSchema>;
