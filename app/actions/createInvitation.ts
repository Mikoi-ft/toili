"use server";

import { redirect } from "next/navigation";
import { invitationInputSchema } from "@/lib/invitation/schema";
import { createInvitation } from "@/lib/invitation/repository";

export async function createInvitationAction(locale: string, formData: FormData) {
  const parsed = invitationInputSchema.safeParse({
    locale,
    templateId: formData.get("templateId"),
    coupleNames: formData.get("coupleNames"),
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime"),
    venueName: formData.get("venueName"),
    venueAddress: formData.get("venueAddress"),
    mapUrl: (formData.get("mapUrl") as string) || undefined,
    message: (formData.get("message") as string) || undefined,
  });

  if (!parsed.success) {
    throw new Error("Проверьте поля формы");
  }

  const invitation = await createInvitation(parsed.data);
  redirect(`/${locale}/i/${invitation.slug}`);
}
