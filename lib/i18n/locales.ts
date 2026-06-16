export const locales = ["ky", "ru", "kk"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ky";

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
