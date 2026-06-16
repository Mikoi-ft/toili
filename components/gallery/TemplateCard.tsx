import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { TemplateMeta } from "@/lib/templates/types";
import { getTemplate } from "@/lib/templates/registry";

const demo = (locale: Locale) => ({
  locale,
  coupleNames: "Айбек & Айгерим",
  eventDate: "2026-08-15",
  eventTime: "17:00",
  venueName: "Ресторан Достук",
  venueAddress: "Бишкек",
  message: "",
});

export function TemplateCard({ meta, locale }: { meta: TemplateMeta; locale: Locale }) {
  const entry = getTemplate(meta.id);
  const Preview = entry?.Component;
  return (
    <Link
      href={`/${locale}/create?template=${meta.id}`}
      className="group relative block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="pointer-events-none h-64 overflow-hidden">
        {Preview && (
          <div className="origin-top scale-[0.42]">
            <Preview data={demo(locale)} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3">
        <span className="font-medium">{meta.name[locale]}</span>
        {meta.premium && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Премиум
          </span>
        )}
      </div>
    </Link>
  );
}
