import { useTranslations } from "next-intl";
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function KyzUzatuu({ data }: { data: InvitationViewData }) {
  const t = useTranslations("templates");
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-gradient-to-b from-rose-50 via-pink-50 to-fuchsia-50 px-6 py-16 text-center">
      <div aria-hidden={true} className="text-3xl">🌸</div>
      <p className="text-sm tracking-[0.3em] text-rose-400 uppercase">{t("kyzUzatuuLabel")}</p>
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
      <h1 className="font-serif text-4xl text-gray-900">{data.coupleNames}</h1>
      {data.message && <p className="text-gray-600">{data.message}</p>}
      <div className="text-lg text-gray-800">
        <p>{formatEventDate(data.eventDate, data.locale)}</p>
        <p>{data.eventTime}</p>
      </div>
      <div className="text-gray-800">
        <p className="font-medium">{data.venueName}</p>
        <p className="text-sm text-gray-500">{data.venueAddress}</p>
      </div>
      {data.mapUrl && (
        <a
          href={data.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-rose-400 px-6 py-2 text-white"
        >
          {t("route")}
        </a>
      )}
    </article>
  );
}
