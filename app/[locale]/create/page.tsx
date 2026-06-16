import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/locales";
import { getTemplate } from "@/lib/templates/registry";
import { InvitationEditor } from "@/components/editor/InvitationEditor";

export default async function CreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { locale } = await params;
  const { template } = await searchParams;
  if (!isValidLocale(locale)) notFound();
  const templateId = template && getTemplate(template) ? template : "toi-classic";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Создать приглашение</h1>
      <InvitationEditor locale={locale} templateId={templateId} />
    </main>
  );
}
