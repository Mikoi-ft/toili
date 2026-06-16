import { db } from "@/lib/db";
import type { RsvpInput } from "@/lib/rsvp/schema";

export function createRsvp(invitationId: string, input: RsvpInput) {
  return db.rsvp.create({ data: { ...input, invitationId } });
}

export function listRsvpByInvitationId(invitationId: string) {
  return db.rsvp.findMany({ where: { invitationId }, orderBy: { createdAt: "desc" } });
}
