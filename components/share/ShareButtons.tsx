"use client";

import { useTranslations } from "next-intl";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const t = useTranslations("share");
  const abs = url.startsWith("http") ? url : (typeof window !== "undefined" ? window.location.origin + url : url);
  const enc = encodeURIComponent;
  const wa = `https://wa.me/?text=${enc(`${text} ${abs}`)}`;
  const tg = `https://t.me/share/url?url=${enc(abs)}&text=${enc(text)}`;
  return (
    <div className="flex flex-wrap gap-3">
      <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-green-600 px-4 py-2 text-white">
        {t("whatsapp")}
      </a>
      <a href={tg} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-sky-500 px-4 py-2 text-white">
        {t("telegram")}
      </a>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(abs)}
        className="rounded-lg border px-4 py-2"
      >
        {t("copy")}
      </button>
    </div>
  );
}
