import { db } from "@/lib/db";
import { generateSlug } from "@/lib/invitation/slug";
import type { InvitationInput } from "@/lib/invitation/schema";

export async function createInvitation(input: InvitationInput) {
  return db.invitation.create({
    data: { ...input, slug: generateSlug() },
  });
}

export function getInvitationBySlug(slug: string) {
  return db.invitation.findUnique({ where: { slug } });
}
