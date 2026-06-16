import type { Locale } from "@/lib/i18n/locales";

export const templateCategories = ["kg-ceremony", "universal"] as const;
export type TemplateCategory = (typeof templateCategories)[number];

export function isTemplateCategory(v: string): v is TemplateCategory {
  return (templateCategories as readonly string[]).includes(v);
}

/** Данные, которые получает любой шаблон для рендера. */
export type InvitationViewData = {
  locale: Locale;
  coupleNames: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  message?: string;
  photoUrl?: string;
};

export type TemplateMeta = {
  id: string;
  name: Record<Locale, string>;
  category: TemplateCategory;
  premium: boolean;
};
