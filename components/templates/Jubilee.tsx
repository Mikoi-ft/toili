import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function Jubilee({ data }: { data: InvitationViewData }) {
  const t = useTranslations("templates");
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-gray-950 px-6 py-16 text-center text-amber-100">
      <div aria-hidden={true} className="text-2xl tracking-[0.5em] text-yellow-500">✦ ✦ ✦</div>
      <p className="text-sm tracking-[0.4em] text-yellow-500 uppercase">{t("jubileeLabel")}</p>
      {data.photoUrl && (
        <Image
          src={data.photoUrl}
          alt={data.coupleNames}
          width={160}
          height={160}
          className="rounded-full border-2 border-yellow-500 object-cover shadow-md"
        />
      )}
      <h1 className="font-serif text-4xl text-yellow-300">{data.coupleNames}</h1>
      {data.message && <p className="text-amber-100/80">{data.message}</p>}
      <div className="text-lg text-amber-100">
        <p>{formatEventDate(data.eventDate, data.locale)}</p>
        <p>{data.eventTime}</p>
      </div>
      <div className="text-amber-100">
        <p className="font-medium">{data.venueName}</p>
        <p className="text-sm text-amber-100/70">{data.venueAddress}</p>
      </div>
      {data.mapUrl && (
        <a
          href={data.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-yellow-500 px-6 py-2 text-yellow-400"
        >
          {t("route")}
        </a>
      )}
    </article>
  );
}
