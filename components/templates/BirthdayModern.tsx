import { useTranslations } from "next-intl";
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function BirthdayModern({ data }: { data: InvitationViewData }) {
  const t = useTranslations("templates");
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-gradient-to-br from-sky-100 via-white to-fuchsia-100 px-6 py-16 text-center text-slate-900">
      {data.photoUrl && (
        <img src={data.photoUrl} alt={data.coupleNames} className="h-44 w-44 rounded-3xl object-cover shadow-lg" />
      )}
      <p className="text-sm font-bold tracking-widest text-fuchsia-600 uppercase">🎉 {t("birthdayLabel")}</p>
      <h1 className="text-4xl font-extrabold">{data.coupleNames}</h1>
      {data.message && <p className="text-slate-600">{data.message}</p>}
      <div className="text-lg">
        <p>{formatEventDate(data.eventDate, data.locale)}</p>
        <p>{data.eventTime}</p>
      </div>
      <div>
        <p className="font-semibold">{data.venueName}</p>
        <p className="text-sm text-slate-500">{data.venueAddress}</p>
      </div>
      {data.mapUrl && (
        <a href={data.mapUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-fuchsia-600 px-6 py-2 font-medium text-white">
          {t("route")}
        </a>
      )}
    </article>
  );
}
