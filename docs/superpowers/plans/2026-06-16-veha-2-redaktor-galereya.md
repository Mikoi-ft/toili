# Тойли — Веха 2: Редактор + Галерея шаблонов — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Пользователь выбирает шаблон в галерее, попадает в редактор с **живым предпросмотром** (поля слева, шаблон справа обновляется на лету), при желании **загружает фото** (Vercel Blob), и публикует приглашение. Несколько шаблонов на старте (КГ-обряды + универсальные), бейджи free/премиум.

**Architecture:** Реестр шаблонов (`templateId → {meta, Component}`) — единый источник правды. Все шаблоны реализуют общий контракт пропсов `InvitationViewData`. Галерея — серверный компонент со списком из реестра и мини-превью (рендер компонента в уменьшенном масштабе). Редактор — клиентский компонент с локальным состоянием полей и живым рендером выбранного шаблона; сабмит вызывает серверный экшен. Фото — прямая загрузка в Vercel Blob через client `upload()` + route handler с `handleUpload`. Премиум в этой вехе только помечается бейджем (оплата — Веха 4).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, next-intl, Prisma + Neon, **@vercel/blob**, Vitest + Testing Library, Vercel.

---

## Структура файлов

```
lib/
  templates/
    types.ts                 ← TemplateMeta, TemplateCategory, InvitationViewData
    registry.ts              ← реестр: getTemplate, listTemplates
  invitation/
    schema.ts                ← +photoUrl (опц.)
components/
  templates/
    ToiClassic.tsx           ← привести к InvitationViewData
    NikeOrnament.tsx         ← новый (КГ, нике/свадьба, орнамент)
    BirthdayModern.tsx       ← новый (универсальный, день рождения)
  editor/
    InvitationEditor.tsx     ← клиентский редактор + живой предпросмотр
    PhotoUpload.tsx          ← загрузка фото в Blob
  gallery/
    TemplateCard.tsx         ← карточка шаблона с мини-превью
app/
  [locale]/
    templates/page.tsx       ← галерея
    create/page.tsx          ← читает ?template=, рендерит редактор
  actions/createInvitation.ts ← +templateId из формы, +photoUrl
  api/blob/upload/route.ts   ← выдача токена клиентской загрузке Blob
prisma/schema.prisma         ← +photoUrl
messages/{ky,ru,kk}.json     ← строки галереи/редактора
```

**Принцип:** шаблоны — изолированные компоненты с единым контрактом; реестр развязывает галерею/редактор от конкретных шаблонов (добавление шаблона = одна запись в реестре).

---

### Task 1: Общий контракт данных шаблона (TDD)

**Files:**
- Create: `lib/templates/types.ts`
- Modify: `components/templates/ToiClassic.tsx`
- Test: `tests/lib/template-types.test.ts`

- [ ] **Step 1: Падающий тест на тип-гард категории**

```ts
// tests/lib/template-types.test.ts
import { describe, it, expect } from "vitest";
import { templateCategories, isTemplateCategory } from "@/lib/templates/types";

describe("template categories", () => {
  it("lists kg-ceremony and universal", () => {
    expect(templateCategories).toEqual(["kg-ceremony", "universal"]);
  });
  it("validates categories", () => {
    expect(isTemplateCategory("kg-ceremony")).toBe(true);
    expect(isTemplateCategory("nope")).toBe(false);
  });
});
```

- [ ] **Step 2: Запустить — FAIL**

Run: `npm test -- tests/lib/template-types.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Реализация типов**

```ts
// lib/templates/types.ts
import type { Locale } from "@/lib/i18n/locales";

export const templateCategories = ["kg-ceremony", "universal"] as const;
export type TemplateCategory = (typeof templateCategories)[number];

export function isTemplateCategory(v: string): v is TemplateCategory {
  return (templateCategories as readonly string[]).includes(v);
}

/** Данные, которые получает любой шаблон для рендера. */
export type InvitationViewData = {
  locale: Locale;
  coupleNames: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  message?: string;
  photoUrl?: string;
};

export type TemplateMeta = {
  id: string;
  name: Record<Locale, string>;
  category: TemplateCategory;
  premium: boolean;
};
```

- [ ] **Step 4: Привести ToiClassic к общему типу**

В `components/templates/ToiClassic.tsx` заменить локальный `ToiClassicData` на общий тип и добавить рендер фото:

```tsx
// components/templates/ToiClassic.tsx
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function ToiClassic({ data }: { data: InvitationViewData }) {
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-gradient-to-b from-amber-50 to-rose-50 px-6 py-16 text-center">
      <p className="text-sm tracking-[0.3em] text-amber-700 uppercase">Той</p>
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt={data.coupleNames}
          className="h-40 w-40 rounded-full object-cover shadow-md"
        />
      )}
      <h1 className="font-serif text-4xl text-gray-900">{data.coupleNames}</h1>
      {data.message && <p className="text-gray-600">{data.message}</p>}
      <div className="text-lg text-gray-800">
        <p>{formatEventDate(data.eventDate, data.locale)}</p>
        <p>{data.eventTime}</p>
      </div>
      <div className="text-gray-800">
        <p className="font-medium">{data.venueName}</p>
        <p className="text-sm text-gray-600">{data.venueAddress}</p>
      </div>
      {data.mapUrl && (
        <a
          href={data.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-amber-700 px-6 py-2 text-white"
        >
          Маршрут в 2ГИС
        </a>
      )}
    </article>
  );
}
```

- [ ] **Step 5: Обновить существующий тест ToiClassic под новый импорт типа**

В `tests/components/ToiClassic.test.tsx` тип данных теперь `InvitationViewData` — заменить аннотацию `as const` объекта данных так, чтобы `locale: "ru"` оставался литералом; импорт типа не обязателен (объект структурно подходит). Прогнать тест.

- [ ] **Step 6: Запустить все тесты — PASS**

Run: `npm test`
Expected: PASS (новый файл типов + существующие 17).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(templates): add shared template types and view-data contract"
```

---

### Task 2: Реестр шаблонов (TDD)

**Files:**
- Create: `lib/templates/registry.ts`
- Test: `tests/lib/template-registry.test.ts`

- [ ] **Step 1: Падающий тест**

```ts
// tests/lib/template-registry.test.ts
import { describe, it, expect } from "vitest";
import { getTemplate, listTemplates } from "@/lib/templates/registry";

describe("template registry", () => {
  it("returns toi-classic by id", () => {
    const t = getTemplate("toi-classic");
    expect(t?.meta.id).toBe("toi-classic");
    expect(typeof t?.Component).toBe("function");
  });
  it("returns undefined for unknown id", () => {
    expect(getTemplate("nope")).toBeUndefined();
  });
  it("lists all templates", () => {
    expect(listTemplates().length).toBeGreaterThanOrEqual(1);
  });
  it("filters by category", () => {
    const kg = listTemplates("kg-ceremony");
    expect(kg.every((m) => m.category === "kg-ceremony")).toBe(true);
  });
});
```

- [ ] **Step 2: Запустить — FAIL**

Run: `npm test -- tests/lib/template-registry.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Реализация реестра**

```ts
// lib/templates/registry.ts
import type { ComponentType } from "react";
import type { InvitationViewData, TemplateCategory, TemplateMeta } from "@/lib/templates/types";
import { ToiClassic } from "@/components/templates/ToiClassic";

type TemplateEntry = {
  meta: TemplateMeta;
  Component: ComponentType<{ data: InvitationViewData }>;
};

const registry: Record<string, TemplateEntry> = {
  "toi-classic": {
    meta: {
      id: "toi-classic",
      name: { ky: "Классикалык той", ru: "Классический той", kk: "Классикалық той" },
      category: "kg-ceremony",
      premium: false,
    },
    Component: ToiClassic,
  },
};

export function getTemplate(id: string): TemplateEntry | undefined {
  return registry[id];
}

export function listTemplates(category?: TemplateCategory): TemplateMeta[] {
  return Object.values(registry)
    .map((e) => e.meta)
    .filter((m) => !category || m.category === category);
}
```

- [ ] **Step 4: Запустить — PASS**

Run: `npm test -- tests/lib/template-registry.test.ts`
Expected: PASS, 4 теста.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(templates): add template registry (getTemplate, listTemplates)"
```

---

### Task 3: Ещё два шаблона (TDD-рендер) + регистрация

**Files:**
- Create: `components/templates/NikeOrnament.tsx`, `components/templates/BirthdayModern.tsx`
- Modify: `lib/templates/registry.ts`
- Test: `tests/components/NikeOrnament.test.tsx`, `tests/components/BirthdayModern.test.tsx`

Контракт у обоих — `{ data: InvitationViewData }`. Дизайн-направление: **NikeOrnament** — кыргызский орнамент, тёплая бордово-золотая палитра, торжественно (нике/свадьба, kg-ceremony, premium=true). **BirthdayModern** — яркий современный минимализм, праздничные акценты (универсальный день рождения, universal, premium=false).

- [ ] **Step 1: Падающий тест NikeOrnament**

```tsx
// tests/components/NikeOrnament.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NikeOrnament } from "@/components/templates/NikeOrnament";

const data = {
  locale: "ru" as const,
  coupleNames: "Нурлан & Айдай",
  eventDate: "2026-08-20",
  eventTime: "16:00",
  venueName: "Той-хана Шанырак",
  venueAddress: "Бишкек, ул. Ахунбаева 5",
  mapUrl: "https://2gis.kg/bishkek/firm/1",
  message: "Никеге чакырабыз",
};

describe("NikeOrnament", () => {
  it("shows names, formatted date and venue", () => {
    render(<NikeOrnament data={data} />);
    expect(screen.getByText("Нурлан & Айдай")).toBeInTheDocument();
    expect(screen.getByText(/августа 2026/)).toBeInTheDocument();
    expect(screen.getByText("Той-хана Шанырак")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(<NikeOrnament data={data} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
```

- [ ] **Step 2: Запустить — FAIL** (`npm test -- tests/components/NikeOrnament.test.tsx`)

- [ ] **Step 3: Реализация NikeOrnament**

```tsx
// components/templates/NikeOrnament.tsx
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function NikeOrnament({ data }: { data: InvitationViewData }) {
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-[#5c1a2b] px-6 py-16 text-center text-amber-50">
      <div aria-hidden className="text-2xl tracking-[0.5em] text-amber-300">۞ ۞ ۞</div>
      {data.photoUrl && (
        <img src={data.photoUrl} alt={data.coupleNames} className="h-40 w-40 rounded-full border-2 border-amber-300 object-cover" />
      )}
      <p className="text-sm tracking-[0.3em] text-amber-300 uppercase">Нике той</p>
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
          Маршрут в 2ГИС
        </a>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Запустить — PASS**

- [ ] **Step 5: Падающий тест BirthdayModern** (аналогично, имя/дата/место/ссылка)

```tsx
// tests/components/BirthdayModern.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BirthdayModern } from "@/components/templates/BirthdayModern";

const data = {
  locale: "ru" as const,
  coupleNames: "Амир, 7 лет",
  eventDate: "2026-09-10",
  eventTime: "13:00",
  venueName: "Кафе Праздник",
  venueAddress: "Бишкек, пр. Манаса 30",
  mapUrl: "https://2gis.kg/bishkek/firm/2",
  message: "Ждём на праздник!",
};

describe("BirthdayModern", () => {
  it("shows title, date and venue", () => {
    render(<BirthdayModern data={data} />);
    expect(screen.getByText("Амир, 7 лет")).toBeInTheDocument();
    expect(screen.getByText(/сентября 2026/)).toBeInTheDocument();
    expect(screen.getByText("Кафе Праздник")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(<BirthdayModern data={data} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
```

- [ ] **Step 6: Запустить — FAIL**, затем реализация BirthdayModern

```tsx
// components/templates/BirthdayModern.tsx
import { formatEventDate } from "@/lib/invitation/format";
import type { InvitationViewData } from "@/lib/templates/types";

export function BirthdayModern({ data }: { data: InvitationViewData }) {
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-gradient-to-br from-sky-100 via-white to-fuchsia-100 px-6 py-16 text-center text-slate-900">
      {data.photoUrl && (
        <img src={data.photoUrl} alt={data.coupleNames} className="h-44 w-44 rounded-3xl object-cover shadow-lg" />
      )}
      <p className="text-sm font-bold tracking-widest text-fuchsia-600 uppercase">🎉 Туулган күн</p>
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
          Маршрут в 2ГИС
        </a>
      )}
    </article>
  );
}
```

- [ ] **Step 7: Запустить — PASS** (оба теста)

- [ ] **Step 8: Зарегистрировать оба шаблона** в `lib/templates/registry.ts` (добавить записи `nike-ornament` → NikeOrnament, premium=true, kg-ceremony; `birthday-modern` → BirthdayModern, premium=false, universal). Прогнать `npm test` (registry-тест на фильтр категории должен остаться зелёным).

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat(templates): add NikeOrnament and BirthdayModern templates"
```

---

### Task 4: Карточка шаблона с мини-превью (TDD)

**Files:**
- Create: `components/gallery/TemplateCard.tsx`
- Test: `tests/components/TemplateCard.test.tsx`

Превью — рендер компонента шаблона с демо-данными внутри уменьшающего контейнера (`scale`), поверх — ссылка на редактор и бейдж премиум.

- [ ] **Step 1: Падающий тест**

```tsx
// tests/components/TemplateCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemplateCard } from "@/components/gallery/TemplateCard";

const meta = {
  id: "nike-ornament",
  name: { ky: "Нике", ru: "Нике", kk: "Нике" },
  category: "kg-ceremony" as const,
  premium: true,
};

describe("TemplateCard", () => {
  it("shows localized name and premium badge, links to editor", () => {
    render(<TemplateCard meta={meta} locale="ru" />);
    expect(screen.getByText("Нике")).toBeInTheDocument();
    expect(screen.getByText(/Премиум/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/ru/create?template=nike-ornament");
  });
});
```

- [ ] **Step 2: Запустить — FAIL**

- [ ] **Step 3: Реализация**

```tsx
// components/gallery/TemplateCard.tsx
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { TemplateMeta } from "@/lib/templates/types";
import { getTemplate } from "@/lib/templates/registry";

const demo = (locale: Locale) => ({
  locale,
  coupleNames: "Айбек & Айгерим",
  eventDate: "2026-08-15",
  eventTime: "17:00",
  venueName: "Ресторан Достук",
  venueAddress: "Бишкек",
  mapUrl: "https://2gis.kg",
  message: "",
});

export function TemplateCard({ meta, locale }: { meta: TemplateMeta; locale: Locale }) {
  const entry = getTemplate(meta.id);
  const Preview = entry?.Component;
  return (
    <Link
      href={`/${locale}/create?template=${meta.id}`}
      className="group relative block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="pointer-events-none h-64 overflow-hidden">
        {Preview && (
          <div className="origin-top scale-[0.42]">
            <Preview data={demo(locale)} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3">
        <span className="font-medium">{meta.name[locale]}</span>
        {meta.premium && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Премиум
          </span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Запустить — PASS**

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(gallery): add TemplateCard with mini-preview"
```

---

### Task 5: Страница галереи

**Files:**
- Create: `app/[locale]/templates/page.tsx`
- Modify: `messages/{ky,ru,kk}.json` (раздел `gallery`)
- Modify: `app/[locale]/page.tsx` (ссылка «Создать» ведёт на галерею)

- [ ] **Step 1: Добавить строки i18n** в каждый messages-файл, раздел `gallery`: `title`, `all`, `kgCeremony`, `universal` (на ky/ru/kk).

- [ ] **Step 2: Реализация галереи**

```tsx
// app/[locale]/templates/page.tsx
import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/lib/i18n/locales";
import { listTemplates } from "@/lib/templates/registry";
import { TemplateCard } from "@/components/gallery/TemplateCard";
import { notFound } from "next/navigation";

export default async function TemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = await getTranslations("gallery");
  const templates = listTemplates();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((meta) => (
          <TemplateCard key={meta.id} meta={meta} locale={locale} />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Главная ведёт на галерею** — в `app/[locale]/page.tsx` поменять `href="create"` на `href="templates"`.

- [ ] **Step 4: Проверка** — `npm run build`; вручную (dev в фоне, затем остановить) `/ru/templates` показывает карточки.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(gallery): add templates gallery page"
```

---

### Task 6: Клиентский редактор с живым предпросмотром

**Files:**
- Create: `components/editor/InvitationEditor.tsx`
- Modify: `app/[locale]/create/page.tsx`, `app/actions/createInvitation.ts`

- [ ] **Step 1: Серверный экшен принимает templateId** — в `createInvitationAction` заменить хардкод `templateId: "toi-classic"` на чтение `formData.get("templateId")` (валидируется существующей zod-схемой как непустая строка). Оставить редирект на `/{locale}/i/{slug}`.

- [ ] **Step 2: Клиентский редактор**

```tsx
// components/editor/InvitationEditor.tsx
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

      <div className="overflow-hidden rounded-2xl border">
        <div className="origin-top scale-[0.7]">
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
```

- [ ] **Step 3: Страница create использует редактор**

```tsx
// app/[locale]/create/page.tsx
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/locales";
import { getTemplate } from "@/lib/templates/registry";
import { InvitationEditor } from "@/components/editor/InvitationEditor";

export default async function CreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { locale } = await params;
  const { template } = await searchParams;
  if (!isValidLocale(locale)) notFound();
  const templateId = template && getTemplate(template) ? template : "toi-classic";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Создать приглашение</h1>
      <InvitationEditor locale={locale} templateId={templateId} />
    </main>
  );
}
```

- [ ] **Step 4: Проверка** — `npx tsc --noEmit`; `npm run build`; вручную: галерея → карточка → редактор, ввод полей меняет превью в реальном времени, сабмит создаёт и открывает приглашение с выбранным шаблоном.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(editor): add client editor with live preview, template selection"
```

---

### Task 7: Поле photoUrl в модели и схеме

**Files:**
- Modify: `prisma/schema.prisma`, `lib/invitation/schema.ts`, `app/actions/createInvitation.ts`, `app/[locale]/i/[slug]/page.tsx`
- Migration: `prisma/migrations/...`

- [ ] **Step 1: Добавить поле в модель** — в `prisma/schema.prisma` в `Invitation` добавить `photoUrl String?`.

- [ ] **Step 2: Миграция**

Run: `npx prisma migrate dev --name add_photo_url`
Expected: миграция применена к Neon, клиент перегенерирован.

- [ ] **Step 3: zod-схема** — в `invitationInputSchema` добавить `photoUrl: z.string().url().optional()`.

- [ ] **Step 4: Экшен сохраняет photoUrl** — в `createInvitationAction` добавить `photoUrl: (formData.get("photoUrl") as string) || undefined` в объект для `safeParse`.

- [ ] **Step 5: Публичная страница передаёт photoUrl** — в `app/[locale]/i/[slug]/page.tsx` добавить `photoUrl: invitation.photoUrl ?? undefined` в data.

- [ ] **Step 6: Проверка** — `npx tsc --noEmit`, `npm test`, `npm run build`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(invitation): add optional photoUrl field and migration"
```

---

### Task 8: Загрузка фото в Vercel Blob

> ВНЕШНЯЯ ЗАВИСИМОСТЬ: нужен `BLOB_READ_WRITE_TOKEN`. Создаётся в дашборде Vercel (Storage → Create Blob store) или `vercel blob`. Контроллер запросит токен у пользователя и добавит его в `.env` и в переменные Vercel перед этим тэском.

**Files:**
- Create: `app/api/blob/upload/route.ts`, `components/editor/PhotoUpload.tsx`
- Modify: `components/editor/InvitationEditor.tsx`
- Install: `@vercel/blob`

- [ ] **Step 1: Установить пакет** — `npm i @vercel/blob`

- [ ] **Step 2: Route handler выдачи клиентского токена**

```ts
// app/api/blob/upload/route.ts
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        maximumSizeInBytes: 5 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
```

- [ ] **Step 3: Компонент загрузки**

```tsx
// components/editor/PhotoUpload.tsx
"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export function PhotoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const blob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/blob/upload",
            });
            onChange(blob.url);
          } finally {
            setBusy(false);
          }
        }}
        className="rounded border p-2"
      />
      {busy && <span className="text-sm text-gray-500">Загрузка…</span>}
      {value && <img src={value} alt="" className="h-20 w-20 rounded object-cover" />}
    </div>
  );
}
```

- [ ] **Step 4: Встроить в редактор** — в `InvitationEditor.tsx` добавить состояние `photoUrl`, отрисовать `<PhotoUpload value={photoUrl} onChange={setPhotoUrl} />`, скрытый `<input type="hidden" name="photoUrl" value={photoUrl} />`, и передавать `photoUrl: photoUrl || undefined` в данные превью.

- [ ] **Step 5: Проверка** — `npx tsc --noEmit`, `npm run build`; вручную: загрузка фото в редакторе показывает его в превью; после публикации фото видно на странице приглашения.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(editor): add photo upload via Vercel Blob"
```

---

### Task 9: Деплой и проверка на проде

**Files:** —

- [ ] **Step 1: Добавить BLOB_READ_WRITE_TOKEN в Vercel** (production/preview/development) — контроллер выполнит `vercel env add` или подскажет дашборд.

- [ ] **Step 2: Push в main** — авто-деплой (репозиторий публичный, сборка проходит).

```bash
git push
```

- [ ] **Step 3: Проверка прода** — `toili-ten.vercel.app/ru/templates` (галерея), выбор шаблона → редактор → живое превью → публикация → открытие приглашения с выбранным шаблоном и фото. Проверить curl'ом 200 на ключевых страницах.

- [ ] **Step 4: Тег вехи**

```bash
git tag veha-2-redaktor-galereya && git push --tags
```

---

## Self-Review

**Покрытие требований Вехи 2:**
- ✅ Галерея шаблонов → Task 5 (+ карточка Task 4)
- ✅ Несколько шаблонов (КГ + универсальные), бейджи free/премиум → Tasks 1-3 (toi-classic, nike-ornament[premium/kg], birthday-modern[universal])
- ✅ Редактор с живым предпросмотром → Task 6
- ✅ Загрузка фото (Vercel Blob) → Tasks 7-8
- ✅ Языки ky/ru/kk для нового UI → Task 5 (строки gallery); поля редактора — лейблы добавить в messages при желании (минор)
- ✅ Премиум помечается, оплата отложена в Веху 4 → meta.premium + бейдж

**Placeholder-скан:** код приведён в каждом шаге; дизайн новых шаблонов задан направлением + полным кодом.

**Согласованность типов:** `InvitationViewData` (Task 1) — единый контракт для ToiClassic/NikeOrnament/BirthdayModern (Tasks 1,3), реестра (Task 2), карточки (Task 4), редактора (Task 6); `templateId` из формы валидируется существующей `invitationInputSchema` (string.min(1)); `photoUrl` добавляется согласованно в модель, схему, экшен, страницу (Task 7) и UI (Task 8).

**Зависимости/риски:** Task 8 требует `BLOB_READ_WRITE_TOKEN` (внешняя зависимость, как Neon). Task 7 миграция требует живой Neon (уже подключён). `<img>` вместо next/image — осознанно для простоты MVP (можно перевести на next/image позже). Мини-превью через CSS `scale` — дёшево и не требует генерации картинок.
