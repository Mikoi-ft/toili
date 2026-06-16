import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Home() {
  const t = useTranslations("home");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="text-lg text-gray-600">{t("subtitle")}</p>
      <Link href="templates" className="rounded-lg bg-black px-6 py-3 text-white">
        {t("create")}
      </Link>
    </main>
  );
}
