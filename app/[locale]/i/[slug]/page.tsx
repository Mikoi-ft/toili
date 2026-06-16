import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getInvitationBySlug } from "@/lib/invitation/repository";
import { getTemplate } from "@/lib/templates/registry";
import { ToiClassic } from "@/components/templates/ToiClassic";
import { isValidLocale } from "@/lib/i18n/locales";
import { RsvpForm } from "@/components/rsvp/RsvpForm";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const invitation = await getInvitationBySlug(slug);
  if (!invitation) notFound();

  const data = {
    locale,
    coupleNames: invitation.coupleNames,
    eventDate: invitation.eventDate,
    eventTime: invitation.eventTime,
    venueName: invitation.venueName,
    venueAddress: invitation.venueAddress,
    mapUrl: invitation.mapUrl ?? undefined,
    message: invitation.message ?? undefined,
    photoUrl: invitation.photoUrl ?? undefined,
  };

  const entry = getTemplate(invitation.templateId);
  const TemplateComponent = entry?.Component ?? ToiClassic;

  const t = await getTranslations({ locale, namespace: "rsvp" });

  return (
    <>
      <TemplateComponent data={data} />
      <section className="mx-auto max-w-md px-6 py-10">
        <h2 className="mb-4 text-center text-xl font-semibold">{t("title")}</h2>
        <RsvpForm slug={slug} locale={locale} />
      </section>
    </>
  );
}
