import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function NikeOrnament({ data }: { data: InvitationViewData }) {
  const t = useTranslations("templates");
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-[#5c1a2b] px-6 py-16 text-center text-amber-50">
      <div aria-hidden={true} className="text-2xl tracking-[0.5em] text-amber-300">۞ ۞ ۞</div>
      {data.photoUrl && (
        <Image src={data.photoUrl} alt={data.coupleNames} width={160} height={160} className="rounded-full border-2 border-amber-300 object-cover" />
      )}
      <p className="text-sm tracking-[0.3em] text-amber-300 uppercase">{t("nikeLabel")}</p>
      <h1 className="font-serif text-4xl">{data.coupleNames}</h1>
      {data.message && <p className="text-amber-100/90">{data.message}</p>}
      <div className="text-lg">
        <p>{formatEventDate(data.eventDate, data.locale)}</p>
        <p>{data.eventTime}</p>
      </div>
      <div>
        <p className="font-medium">{data.venueName}</p>
        <p className="text-sm text-amber-100/80">{data.venueAddress}</p>
      </div>
      {data.mapUrl && (
        <a href={data.mapUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-amber-300 px-6 py-2 text-amber-200">
          {t("route")}
        </a>
      )}
    </article>
  );
}
