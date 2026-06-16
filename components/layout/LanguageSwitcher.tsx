"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/locales";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (loc: Locale) => {
    const segments = pathname.split("/");
    segments[1] = loc; // first segment after leading slash is the locale
    router.push(segments.join("/") || `/${loc}`);
  };

  return (
    <div className="flex gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchTo(loc)}
          className={`rounded px-2 py-1 text-sm uppercase ${loc === current ? "bg-black text-white" : "text-gray-500"}`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
