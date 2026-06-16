import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/lib/i18n/locales";
import { getInvitationForManage } from "@/lib/invitation/repository";
import { listRsvpByInvitationId } from "@/lib/rsvp/repository";
import { RsvpSummary } from "@/components/rsvp/RsvpSummary";
import { ShareButtons } from "@/components/share/ShareButtons";

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { slug, locale } = await params;
  const { key } = await searchParams;
  if (!isValidLocale(locale)) notFound();
  const invitation = key ? await getInvitationForManage(slug, key) : null;
  if (!invitation) notFound();

  const t = await getTranslations({ locale, namespace: "manage" });

  const rsvps = await listRsvpByInvitationId(invitation.id);
  const inviteUrl = `/${locale}/i/${slug}`;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
      <p className="mb-6 text-gray-600">{t("subtitle")}</p>
      <a href={inviteUrl} className="mb-4 inline-block rounded-lg bg-black px-5 py-2 text-white">{t("open")}</a>
      <div className="mb-8">
        <ShareButtons url={inviteUrl} text="Сиздерди тойго чакырабыз!" />
      </div>
      <h2 className="mb-3 text-xl font-semibold">{t("answers")}</h2>
      <RsvpSummary rsvps={rsvps} />
    </main>
  );
}
