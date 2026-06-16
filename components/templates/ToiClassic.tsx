import { useTranslations } from "next-intl";
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function ToiClassic({ data }: { data: InvitationViewData }) {
  const t = useTranslations("templates");
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-gradient-to-b from-amber-50 to-rose-50 px-6 py-16 text-center">
      <p className="text-sm tracking-[0.3em] text-amber-700 uppercase">{t("toiClassicLabel")}</p>
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt={data.coupleNames}
          className="h-40 w-40 rounded-full object-cover shadow-md"
        />
      )}
      <h1 className="font-serif text-4xl text-gray-900">{data.coupleNames}</h1>
      {data.message && <p className="text-gray-600">{data.message}</p>}
      <div className="text-lg text-gray-800">
        <p>{formatEventDate(data.eventDate, data.locale)}</p>
        <p>{data.eventTime}</p>
      </div>
      <div className="text-gray-800">
        <p className="font-medium">{data.venueName}</p>
        <p className="text-sm text-gray-600">{data.venueAddress}</p>
      </div>
      {data.mapUrl && (
        <a
          href={data.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-amber-700 px-6 py-2 text-white"
        >
          {t("route")}
        </a>
      )}
    </article>
  );
}
