import { notFound } from "next/navigation";
import { getInvitationBySlug } from "@/lib/invitation/repository";
import { ToiClassic } from "@/components/templates/ToiClassic";
import { isValidLocale } from "@/lib/i18n/locales";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const invitation = await getInvitationBySlug(slug);
  if (!invitation) notFound();

  return (
    <ToiClassic
      data={{
        locale,
        coupleNames: invitation.coupleNames,
        eventDate: invitation.eventDate,
        eventTime: invitation.eventTime,
        venueName: invitation.venueName,
        venueAddress: invitation.venueAddress,
        mapUrl: invitation.mapUrl ?? undefined,
        message: invitation.message ?? undefined,
      }}
    />
  );
}
