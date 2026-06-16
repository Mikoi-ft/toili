import { useTranslations } from "next-intl";
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function BeshikToi({ data }: { data: InvitationViewData }) {
  const t = useTranslations("templates");
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50 px-6 py-16 text-center">
      <div aria-hidden={true} className="text-3xl">🌙</div>
      <p className="text-sm tracking-[0.3em] text-amber-500 uppercase">{t("beshikLabel")}</p>
      {data.photoUrl && (
        <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.photoUrl}
            alt={data.coupleNames}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <h1 className="font-serif text-4xl text-amber-900">{data.coupleNames}</h1>
      {data.message && <p className="text-amber-700">{data.message}</p>}
      <div className="text-lg text-amber-900">
        <p>{formatEventDate(data.eventDate, data.locale)}</p>
        <p>{data.eventTime}</p>
      </div>
      <div className="text-amber-900">
        <p className="font-medium">{data.venueName}</p>
        <p className="text-sm text-amber-600">{data.venueAddress}</p>
      </div>
      {data.mapUrl && (
        <a
          href={data.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-amber-500 px-6 py-2 text-white"
        >
          {t("route")}
        </a>
      )}
    </article>
  );
}
