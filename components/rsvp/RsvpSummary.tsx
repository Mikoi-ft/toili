import { useTranslations } from "next-intl";

type Rsvp = { id: string; name: string; attending: boolean; guests: number; message: string | null };

export function RsvpSummary({ rsvps }: { rsvps: Rsvp[] }) {
  const t = useTranslations("manage");
  const coming = rsvps.filter((r) => r.attending);
  const totalGuests = coming.reduce((s, r) => s + r.guests, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="rounded-xl border p-4 text-center"><div className="text-2xl font-bold">{coming.length}</div><div className="text-sm text-gray-500">{t("comingCount")}</div></div>
        <div className="rounded-xl border p-4 text-center"><div className="text-2xl font-bold">{totalGuests}</div><div className="text-sm text-gray-500">{t("totalGuests")}</div></div>
        <div className="rounded-xl border p-4 text-center"><div className="text-2xl font-bold">{rsvps.length - coming.length}</div><div className="text-sm text-gray-500">{t("notComingCount")}</div></div>
      </div>
      <ul className="divide-y rounded-xl border">
        {rsvps.map((r) => (
          <li key={r.id} className="flex items-center justify-between p-3">
            <span>{r.name} {r.attending ? `(+${r.guests})` : ""}</span>
            <span className={r.attending ? "text-green-600" : "text-gray-400"}>{r.attending ? t("willCome") : t("willNotCome")}</span>
          </li>
        ))}
        {rsvps.length === 0 && <li className="p-3 text-center text-gray-400">{t("noAnswers")}</li>}
      </ul>
    </div>
  );
}
