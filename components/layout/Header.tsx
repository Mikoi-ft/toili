import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/locales";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations("nav");
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href={`/${locale}`} className="text-xl font-bold">{t("brand")}</Link>
      <nav className="flex items-center gap-4">
        <Link href={`/${locale}/templates`} className="text-sm text-gray-600 hover:text-black">{t("templates")}</Link>
        <LanguageSwitcher current={locale} />
      </nav>
    </header>
  );
}
