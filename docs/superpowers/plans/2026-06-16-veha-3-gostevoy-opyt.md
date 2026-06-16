# Тойли — Веха 3: Гостевой опыт (RSVP + кабинет + рассылка) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Гость открывает приглашение и отвечает «приду/не приду» (имя, число гостей, пожелание) без регистрации. Хозяин получает секретную ссылку-кабинет со списком ответов и счётчиками, плюс кнопки рассылки (WhatsApp / Telegram / копировать ссылку).

**Architecture:** Новая модель `Rsvp` (1-N к `Invitation`, каскадное удаление). Доступ хозяина к кабинету — по секретному `manageKey` (колонка в `Invitation`, генерится при создании), без авторизации (auth — Веха 4). RSVP отправляется серверным экшеном из клиентской формы на публичной странице. Кабинет `/i/[slug]/manage?key=…` — серверный компонент, сверяет ключ. Рассылка — клиентский компонент со ссылками `wa.me` / `t.me/share` и копированием в буфер.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, next-intl v4, Prisma + Neon, zod, nanoid, Vitest. (Сбор подарков в этой вехе НЕ делаем — по решению владельца.)

---

## Структура файлов

```
prisma/schema.prisma                 ← +manageKey, +Rsvp модель, relation
lib/invitation/
  manage-key.ts                      ← генерация manageKey (TDD)
  repository.ts                      ← createInvitation ставит manageKey; getInvitationByManage
lib/rsvp/
  schema.ts                          ← zod RsvpInput (TDD)
  repository.ts                      ← createRsvp, listRsvpByInvitationId, countRsvp
app/actions/
  createInvitation.ts                ← redirect на /i/[slug]/manage?key=…
  submitRsvp.ts                      ← серверный экшен RSVP
components/
  rsvp/RsvpForm.tsx                  ← клиентская форма RSVP
  rsvp/RsvpSummary.tsx               ← счётчики + список (кабинет)
  share/ShareButtons.tsx             ← WhatsApp/Telegram/копировать (TDD на ссылки)
app/[locale]/i/[slug]/
  page.tsx                           ← +RsvpForm
  manage/page.tsx                    ← кабинет хозяина
messages/{ky,ru,kk}.json             ← строки rsvp/share/manage
```

---

### Task 1: Модель Rsvp + manageKey + миграция

**Files:** `prisma/schema.prisma` (migration)

- [ ] **Step 1: Изменить схему**

В `model Invitation` добавить:
```prisma
  manageKey    String   @unique
  rsvps        Rsvp[]
```
Добавить модель:
```prisma
model Rsvp {
  id           String     @id @default(uuid())
  invitationId String
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  name         String
  attending    Boolean
  guests       Int        @default(1)
  message      String?
  createdAt    DateTime   @default(now())
}
```

> ВНИМАНИЕ: `manageKey` — обязательное уникальное поле. В таблице уже могут быть строки без него. Миграция должна предусмотреть дефолт для существующих строк ИЛИ таблица пустая. План: перед `migrate dev` очистить таблицу (данные тестовые) — Step 2.

- [ ] **Step 2: Очистить старые тестовые приглашения** (в БД только тестовые записи; чтобы NOT NULL unique manageKey прошёл без ручного backfill)

Создать временный скрипт `scripts/clear.ts`:
```ts
import { db } from "@/lib/db";
db.invitation.deleteMany({}).then((r) => { console.log("cleared:", r.count); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
```
Run: `node --env-file=.env --import tsx ./scripts/clear.ts`
Затем удалить скрипт: `rm scripts/clear.ts`.

- [ ] **Step 3: Миграция**

Run: `npx prisma migrate dev --name add_rsvp_and_manage_key`
Expected: применена к Neon, клиент перегенерирован.

- [ ] **Step 4: Commit**

```bash
git add prisma -A && git commit -m "feat(db): add Rsvp model and Invitation.manageKey"
```

---

### Task 2: Генерация manageKey (TDD)

**Files:** Create `lib/invitation/manage-key.ts`; Test `tests/lib/manage-key.test.ts`

- [ ] **Step 1: Падающий тест**

```ts
// tests/lib/manage-key.test.ts
import { describe, it, expect } from "vitest";
import { generateManageKey } from "@/lib/invitation/manage-key";

describe("generateManageKey", () => {
  it("returns a url-safe key of length >= 16", () => {
    const k = generateManageKey();
    expect(k).toMatch(/^[A-Za-z0-9_-]{16,}$/);
  });
  it("is unique across calls", () => {
    expect(generateManageKey()).not.toBe(generateManageKey());
  });
});
```

- [ ] **Step 2: Запустить — FAIL** (`npm test -- tests/lib/manage-key.test.ts`)

- [ ] **Step 3: Реализация**

```ts
// lib/invitation/manage-key.ts
import { nanoid } from "nanoid";

export function generateManageKey(): string {
  return nanoid(21);
}
```

- [ ] **Step 4: Запустить — PASS**

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(invitation): add manage key generator"`

---

### Task 3: createInvitation ставит manageKey + getByManage

**Files:** Modify `lib/invitation/repository.ts`

- [ ] **Step 1: Обновить репозиторий**

```ts
// lib/invitation/repository.ts
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/invitation/slug";
import { generateManageKey } from "@/lib/invitation/manage-key";
import type { InvitationInput } from "@/lib/invitation/schema";

export async function createInvitation(input: InvitationInput) {
  return db.invitation.create({
    data: { ...input, slug: generateSlug(), manageKey: generateManageKey() },
  });
}

export function getInvitationBySlug(slug: string) {
  return db.invitation.findUnique({ where: { slug } });
}

export function getInvitationForManage(slug: string, manageKey: string) {
  return db.invitation.findFirst({ where: { slug, manageKey } });
}
```

- [ ] **Step 2: Проверка** — `npx tsc --noEmit`

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(invitation): set manageKey on create; add getInvitationForManage"`

---

### Task 4: RSVP схема (TDD)

**Files:** Create `lib/rsvp/schema.ts`; Test `tests/lib/rsvp-schema.test.ts`

- [ ] **Step 1: Падающий тест**

```ts
// tests/lib/rsvp-schema.test.ts
import { describe, it, expect } from "vitest";
import { rsvpInputSchema } from "@/lib/rsvp/schema";

const valid = { name: "Айбек", attending: true, guests: 2, message: "Поздравляю!" };

describe("rsvpInputSchema", () => {
  it("accepts valid input", () => {
    expect(rsvpInputSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects empty name", () => {
    expect(rsvpInputSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
  it("rejects guests < 1", () => {
    expect(rsvpInputSchema.safeParse({ ...valid, guests: 0 }).success).toBe(false);
  });
  it("allows omitting message", () => {
    const { message, ...rest } = valid;
    expect(rsvpInputSchema.safeParse(rest).success).toBe(true);
  });
});
```

- [ ] **Step 2: Запустить — FAIL**

- [ ] **Step 3: Реализация**

```ts
// lib/rsvp/schema.ts
import { z } from "zod";

export const rsvpInputSchema = z.object({
  name: z.string().min(1).max(120),
  attending: z.boolean(),
  guests: z.number().int().min(1).max(20),
  message: z.string().max(500).optional(),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;
```

- [ ] **Step 4: Запустить — PASS**

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(rsvp): add zod input schema"`

---

### Task 5: RSVP репозиторий

**Files:** Create `lib/rsvp/repository.ts`

- [ ] **Step 1: Реализация**

```ts
// lib/rsvp/repository.ts
import { db } from "@/lib/db";
import type { RsvpInput } from "@/lib/rsvp/schema";

export function createRsvp(invitationId: string, input: RsvpInput) {
  return db.rsvp.create({ data: { ...input, invitationId } });
}

export function listRsvpByInvitationId(invitationId: string) {
  return db.rsvp.findMany({ where: { invitationId }, orderBy: { createdAt: "desc" } });
}
```

- [ ] **Step 2: Проверка** — `npx tsc --noEmit`

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(rsvp): add repository"`

---

### Task 6: Серверный экшен RSVP

**Files:** Create `app/actions/submitRsvp.ts`

- [ ] **Step 1: Реализация**

```ts
// app/actions/submitRsvp.ts
"use server";

import { revalidatePath } from "next/cache";
import { rsvpInputSchema } from "@/lib/rsvp/schema";
import { getInvitationBySlug } from "@/lib/invitation/repository";
import { createRsvp } from "@/lib/rsvp/repository";

export async function submitRsvpAction(slug: string, locale: string, formData: FormData) {
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) throw new Error("Invitation not found");

  const parsed = rsvpInputSchema.safeParse({
    name: formData.get("name"),
    attending: formData.get("attending") === "yes",
    guests: Number(formData.get("guests") ?? 1),
    message: (formData.get("message") as string) || undefined,
  });
  if (!parsed.success) throw new Error("Проверьте поля");

  await createRsvp(invitation.id, parsed.data);
  revalidatePath(`/${locale}/i/${slug}/manage`);
}
```

- [ ] **Step 2: Проверка** — `npx tsc --noEmit`

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(rsvp): add submit server action"`

---

### Task 7: Кнопки рассылки (TDD)

**Files:** Create `components/share/ShareButtons.tsx`; Test `tests/components/ShareButtons.test.tsx`

- [ ] **Step 1: Падающий тест**

```tsx
// tests/components/ShareButtons.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShareButtons } from "@/components/share/ShareButtons";

describe("ShareButtons", () => {
  it("builds WhatsApp and Telegram share links for the url", () => {
    render(<ShareButtons url="https://toili.app/ru/i/abc" text="Чакыруу" />);
    const wa = screen.getByRole("link", { name: /WhatsApp/i });
    const tg = screen.getByRole("link", { name: /Telegram/i });
    expect(wa).toHaveAttribute("href", expect.stringContaining("wa.me"));
    expect(wa.getAttribute("href")).toContain(encodeURIComponent("https://toili.app/ru/i/abc"));
    expect(tg).toHaveAttribute("href", expect.stringContaining("t.me/share"));
  });
});
```

- [ ] **Step 2: Запустить — FAIL**

- [ ] **Step 3: Реализация**

```tsx
// components/share/ShareButtons.tsx
"use client";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const enc = encodeURIComponent;
  const wa = `https://wa.me/?text=${enc(`${text} ${url}`)}`;
  const tg = `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`;
  return (
    <div className="flex flex-wrap gap-3">
      <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-green-600 px-4 py-2 text-white">
        WhatsApp
      </a>
      <a href={tg} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-sky-500 px-4 py-2 text-white">
        Telegram
      </a>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(url)}
        className="rounded-lg border px-4 py-2"
      >
        Копировать ссылку
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Запустить — PASS**

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(share): add WhatsApp/Telegram/copy share buttons"`

---

### Task 8: Форма RSVP (клиент)

**Files:** Create `components/rsvp/RsvpForm.tsx`

- [ ] **Step 1: Реализация**

```tsx
// components/rsvp/RsvpForm.tsx
"use client";

import { useState } from "react";
import { submitRsvpAction } from "@/app/actions/submitRsvp";

export function RsvpForm({ slug, locale }: { slug: string; locale: string }) {
  const [sent, setSent] = useState(false);
  const action = submitRsvpAction.bind(null, slug, locale);

  if (sent) {
    return <p className="rounded-lg bg-green-50 p-4 text-center text-green-700">Рахмат! Ваш ответ записан.</p>;
  }

  return (
    <form
      action={async (fd) => {
        await action(fd);
        setSent(true);
      }}
      className="mx-auto flex w-full max-w-sm flex-col gap-3"
    >
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
```

- [ ] **Step 2: Проверка** — `npx tsc --noEmit`

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(rsvp): add guest RSVP form"`

---

### Task 9: Публичная страница — встроить RSVP

**Files:** Modify `app/[locale]/i/[slug]/page.tsx`

- [ ] **Step 1: Добавить RSVP-форму под приглашением**

Под рендером `<TemplateComponent .../>` обернуть в фрагмент и добавить секцию RSVP (передать `slug`, `locale`). Пример итогового return:

```tsx
  return (
    <>
      <TemplateComponent data={data} />
      <section className="mx-auto max-w-md px-6 py-10">
        <h2 className="mb-4 text-center text-xl font-semibold">Подтвердите участие</h2>
        <RsvpForm slug={slug} locale={locale} />
      </section>
    </>
  );
```
Добавить импорт `import { RsvpForm } from "@/components/rsvp/RsvpForm";`.

- [ ] **Step 2: Проверка** — `npx tsc --noEmit`, `npm run build`

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(invitation): embed RSVP form on public page"`

---

### Task 10: Кабинет хозяина + редирект после создания

**Files:** Create `components/rsvp/RsvpSummary.tsx`, `app/[locale]/i/[slug]/manage/page.tsx`; Modify `app/actions/createInvitation.ts`

- [ ] **Step 1: Сводка RSVP**

```tsx
// components/rsvp/RsvpSummary.tsx
type Rsvp = { id: string; name: string; attending: boolean; guests: number; message: string | null };

export function RsvpSummary({ rsvps }: { rsvps: Rsvp[] }) {
  const coming = rsvps.filter((r) => r.attending);
  const totalGuests = coming.reduce((s, r) => s + r.guests, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="rounded-xl border p-4 text-center"><div className="text-2xl font-bold">{coming.length}</div><div className="text-sm text-gray-500">придут</div></div>
        <div className="rounded-xl border p-4 text-center"><div className="text-2xl font-bold">{totalGuests}</div><div className="text-sm text-gray-500">всего гостей</div></div>
        <div className="rounded-xl border p-4 text-center"><div className="text-2xl font-bold">{rsvps.length - coming.length}</div><div className="text-sm text-gray-500">не придут</div></div>
      </div>
      <ul className="divide-y rounded-xl border">
        {rsvps.map((r) => (
          <li key={r.id} className="flex items-center justify-between p-3">
            <span>{r.name} {r.attending ? `(+${r.guests})` : ""}</span>
            <span className={r.attending ? "text-green-600" : "text-gray-400"}>{r.attending ? "Придёт" : "Не придёт"}</span>
          </li>
        ))}
        {rsvps.length === 0 && <li className="p-3 text-center text-gray-400">Пока нет ответов</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Страница кабинета**

```tsx
// app/[locale]/i/[slug]/manage/page.tsx
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/locales";
import { getInvitationForManage } from "@/lib/invitation/repository";
import { listRsvpByInvitationId } from "@/lib/rsvp/repository";
import { RsvpSummary } from "@/components/rsvp/RsvpSummary";
import { ShareButtons } from "@/components/share/ShareButtons";

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { slug, locale } = await params;
  const { key } = await searchParams;
  if (!isValidLocale(locale)) notFound();
  const invitation = key ? await getInvitationForManage(slug, key) : null;
  if (!invitation) notFound();

  const rsvps = await listRsvpByInvitationId(invitation.id);
  const inviteUrl = `/${locale}/i/${slug}`;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold">Ваше приглашение готово</h1>
      <p className="mb-6 text-gray-600">Поделитесь ссылкой с гостями. Сохраните эту страницу — здесь видны ответы.</p>
      <a href={inviteUrl} className="mb-4 inline-block rounded-lg bg-black px-5 py-2 text-white">Открыть приглашение</a>
      <div className="mb-8">
        <ShareButtons url={inviteUrl} text="Сиздерди тойго чакырабыз!" />
      </div>
      <h2 className="mb-3 text-xl font-semibold">Ответы гостей</h2>
      <RsvpSummary rsvps={rsvps} />
    </main>
  );
}
```

> Примечание: `ShareButtons` получает относительный `inviteUrl`; для абсолютной ссылки в рассылке можно позже подставлять origin на клиенте. Для MVP относительной ссылки достаточно (WhatsApp/Telegram примут полный URL после добавления домена — улучшение на будущее: пробросить `window.location.origin` в клиентском ShareButtons). В этой вехе ShareButtons сам достроит абсолютный URL: см. Step 3.

- [ ] **Step 3: ShareButtons достраивает абсолютный URL на клиенте** — обновить `components/share/ShareButtons.tsx`, чтобы перед использованием строить `const abs = url.startsWith("http") ? url : (typeof window !== "undefined" ? window.location.origin + url : url);` и использовать `abs`. Тест из Task 7 передаёт абсолютный URL и остаётся валидным.

- [ ] **Step 4: Редирект после создания** — в `app/actions/createInvitation.ts` поменять `redirect(\`/${locale}/i/${invitation.slug}\`)` на `redirect(\`/${locale}/i/${invitation.slug}/manage?key=${invitation.manageKey}\`)`.

- [ ] **Step 5: Проверка** — `npx tsc --noEmit`, `npm test`, `npm run build`.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat(manage): add host dashboard with RSVP summary and share; redirect after create"`

---

### Task 11: i18n строки

**Files:** Modify `messages/{ky,ru,kk}.json`

- [ ] **Step 1:** Добавить разделы `rsvp` (`title`, `name`, `coming`, `notComing`, `guests`, `wish`, `submit`, `thanks`), `share` (`whatsapp`, `telegram`, `copy`), `manage` (`title`, `subtitle`, `open`, `answers`, `comingCount`, `totalGuests`, `notComingCount`, `noAnswers`) на ky/ru/kk. (Подключение строк в компонентах — где они серверные, через `getTranslations`; в клиентских RsvpForm/ShareButtons допустимо оставить хардкод в этой вехе ИЛИ принять как пропсы — для MVP оставить текущие строки, перевод как улучшение. Минимально: перевести серверные тексты страницы кабинета и заголовок RSVP-секции.)

- [ ] **Step 2: Commit** — `git add -A && git commit -m "i18n: add rsvp/share/manage strings"`

---

### Task 12: Деплой и проверка на проде

**Files:** —

- [ ] **Step 1: Push** — `git push` (авто-деплой, публичный репозиторий).

- [ ] **Step 2: Проверка прода** — создать приглашение → редирект в кабинет (есть `?key=`), открыть приглашение по ссылке, отправить RSVP → в кабинете увеличились счётчики. Проверить, что без правильного `key` кабинет даёт 404. curl'ом 200 на ключевых страницах.

- [ ] **Step 3: Тег** — `git tag veha-3-gostevoy-opyt && git push --tags`

---

## Self-Review

**Покрытие требований Вехи 3:**
- ✅ RSVP без регистрации → Tasks 4-6, 8-9 (модель, схема, репо, экшен, форма, встроена в страницу)
- ✅ Кабинет хозяина по секретной ссылке → Tasks 1-3, 10 (manageKey, getInvitationForManage, страница manage, редирект)
- ✅ Рассылка WhatsApp/Telegram/копировать → Task 7, встроено в кабинет (Task 10)
- ✅ Счётчики (придут/не придут/гостей) → RsvpSummary (Task 10)
- ✅ Без сбора подарков (по решению владельца) — НЕ реализуется
- ✅ i18n → Task 11 (серверные тексты; перевод клиентских строк — допустимое улучшение)

**Placeholder-скан:** код в каждом шаге; миграция учитывает NOT NULL manageKey через очистку тестовых данных (Step Task1.2).

**Согласованность типов:** `RsvpInput` (Task 4) → репозиторий (Task 5) → экшен (Task 6) → форма (Task 8); `manageKey` (Task 1) ставится в createInvitation (Task 3), проверяется в getInvitationForManage (Task 3) и в кабинете (Task 10), генерится generateManageKey (Task 2); `Rsvp` тип в RsvpSummary совпадает с полями модели; ShareButtons URL-логика согласована между Task 7 и Task 10 Step 3.

**Риски:** миграция с NOT NULL unique `manageKey` требует пустой таблицы — Task 1 Step 2 чистит тестовые данные (в проде реальных данных ещё нет). RSVP без анти-спама (для MVP приемлемо; возможный спам — улучшение позже). Абсолютный URL для рассылки строится на клиенте (Task 10 Step 3).
