import { createInvitationAction } from "@/app/actions/createInvitation";

export default async function CreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const action = createInvitationAction.bind(null, locale);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Создать приглашение</h1>
      <form action={action} className="flex flex-col gap-4">
        <input name="coupleNames" placeholder="Имена (Айбек & Айгерим)" required className="rounded border p-3" />
        <input name="eventDate" type="date" required className="rounded border p-3" />
        <input name="eventTime" type="time" required className="rounded border p-3" />
        <input name="venueName" placeholder="Место (Ресторан Достук)" required className="rounded border p-3" />
        <input name="venueAddress" placeholder="Адрес" required className="rounded border p-3" />
        <input name="mapUrl" placeholder="Ссылка 2ГИС (необязательно)" className="rounded border p-3" />
        <textarea name="message" placeholder="Текст приглашения (необязательно)" className="rounded border p-3" />
        <button type="submit" className="rounded-lg bg-black px-6 py-3 text-white">
          Создать
        </button>
      </form>
    </main>
  );
}
