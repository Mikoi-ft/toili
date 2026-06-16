import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/lib/i18n/locales";
import { listTemplates } from "@/lib/templates/registry";
import { TemplateCard } from "@/components/gallery/TemplateCard";
import { notFound } from "next/navigation";

export default async function TemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = await getTranslations("gallery");
  const templates = listTemplates();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((meta) => (
          <TemplateCard key={meta.id} meta={meta} locale={locale} />
        ))}
      </div>
    </main>
  );
}
