import { db } from "@/lib/db";
import { generateSlug } from "@/lib/invitation/slug";
import { generateManageKey } from "@/lib/invitation/manage-key";
import type { InvitationInput } from "@/lib/invitation/schema";

export async function createInvitation(input: InvitationInput) {
  return db.invitation.create({
    data: { ...input, slug: generateSlug(), manageKey: generateManageKey() },
  });
}

export function getInvitationBySlug(slug: string) {
  return db.invitation.findUnique({ where: { slug } });
}

export function getInvitationForManage(slug: string, manageKey: string) {
  return db.invitation.findFirst({ where: { slug, manageKey } });
}
