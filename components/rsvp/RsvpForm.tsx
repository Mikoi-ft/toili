"use client";

import { useState } from "react";
import { submitRsvpAction } from "@/app/actions/submitRsvp";

export function RsvpForm({ slug, locale }: { slug: string; locale: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const action = submitRsvpAction.bind(null, slug, locale);

  if (sent) {
    return <p className="rounded-lg bg-green-50 p-4 text-center text-green-700">Рахмат! Ваш ответ записан.</p>;
  }

  return (
    <form
      action={async (fd) => {
        setError(false);
        try {
          await action(fd);
          setSent(true);
        } catch {
          setError(true);
        }
      }}
      className="mx-auto flex w-full max-w-sm flex-col gap-3"
    >
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-center text-red-600">
          Не удалось отправить. Попробуйте ещё раз.
        </p>
      )}
      <input name="name" placeholder="Ваше имя" required className="rounded border p-3" />
      <div className="flex gap-2">
        <label className="flex flex-1 items-center justify-center gap-2 rounded border p-3">
          <input type="radio" name="attending" value="yes" defaultChecked /> Приду
        </label>
        <label className="flex flex-1 items-center justify-center gap-2 rounded border p-3">
          <input type="radio" name="attending" value="no" /> Не приду
        </label>
      </div>
      <input name="guests" type="number" min={1} max={20} defaultValue={1} className="rounded border p-3" />
      <textarea name="message" placeholder="Пожелание (необязательно)" className="rounded border p-3" />
      <button type="submit" className="rounded-lg bg-black px-6 py-3 text-white">Отправить ответ</button>
    </form>
  );
}
