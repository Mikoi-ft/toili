import type { Locale } from "@/lib/i18n/locales";

const intlLocale: Record<Locale, string> = {
  ky: "ky-KG",
  ru: "ru-RU",
  kk: "kk-KZ",
};

export function formatEventDate(isoDate: string, locale: Locale): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
