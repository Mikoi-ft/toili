"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { getTemplate } from "@/lib/templates/registry";
import { createInvitationAction } from "@/app/actions/createInvitation";

export function InvitationEditor({ locale, templateId }: { locale: Locale; templateId: string }) {
  const entry = getTemplate(templateId);
  const Preview = entry?.Component;
  const [f, setF] = useState({
    coupleNames: "",
    eventDate: "",
    eventTime: "",
    venueName: "",
    venueAddress: "",
    mapUrl: "",
    message: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const action = createInvitationAction.bind(null, locale);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="templateId" value={templateId} />
        <input name="coupleNames" value={f.coupleNames} onChange={set("coupleNames")} placeholder="Имена / заголовок" required className="rounded border p-3" />
        <input name="eventDate" value={f.eventDate} onChange={set("eventDate")} type="date" required className="rounded border p-3" />
        <input name="eventTime" value={f.eventTime} onChange={set("eventTime")} type="time" required className="rounded border p-3" />
        <input name="venueName" value={f.venueName} onChange={set("venueName")} placeholder="Место" required className="rounded border p-3" />
        <input name="venueAddress" value={f.venueAddress} onChange={set("venueAddress")} placeholder="Адрес" required className="rounded border p-3" />
        <input name="mapUrl" value={f.mapUrl} onChange={set("mapUrl")} placeholder="Ссылка 2ГИС (необязательно)" className="rounded border p-3" />
        <textarea name="message" value={f.message} onChange={set("message")} placeholder="Текст (необязательно)" className="rounded border p-3" />
        <button type="submit" className="rounded-lg bg-black px-6 py-3 text-white">Создать</button>
      </form>

      <div className="h-[600px] overflow-hidden rounded-2xl border md:sticky md:top-6">
        <div className="w-[142.857%] origin-top-left scale-[0.7]">
          {Preview && (
            <Preview
              data={{
                locale,
                coupleNames: f.coupleNames || "Имена",
                eventDate: f.eventDate || "2026-08-15",
                eventTime: f.eventTime || "17:00",
                venueName: f.venueName || "Место",
                venueAddress: f.venueAddress || "Адрес",
                mapUrl: f.mapUrl || undefined,
                message: f.message || undefined,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
