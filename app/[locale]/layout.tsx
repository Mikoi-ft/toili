import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Playfair_Display } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import type { Locale } from "@/lib/i18n/locales";

const serif = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html lang={locale} className={serif.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
