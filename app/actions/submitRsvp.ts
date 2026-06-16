"use server";

import { revalidatePath } from "next/cache";
import { rsvpInputSchema } from "@/lib/rsvp/schema";
import { getInvitationBySlug } from "@/lib/invitation/repository";
import { createRsvp } from "@/lib/rsvp/repository";

export async function submitRsvpAction(slug: string, locale: string, formData: FormData) {
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) throw new Error("Invitation not found");

  const parsed = rsvpInputSchema.safeParse({
    name: formData.get("name"),
    attending: formData.get("attending") === "yes",
    guests: Number(formData.get("guests") ?? 1),
    message: (formData.get("message") as string) || undefined,
  });
  if (!parsed.success) throw new Error("Проверьте поля");

  await createRsvp(invitation.id, parsed.data);
  revalidatePath(`/${locale}/i/${slug}/manage`);
}
