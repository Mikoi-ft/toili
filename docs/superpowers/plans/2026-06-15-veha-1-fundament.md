# Тойли — Веха 1: Фундамент + первое приглашение — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Получить рабочий вертикальный срез — пользователь создаёт приглашение через простую форму, оно сохраняется в БД и открывается по публичной ссылке как красивая страница, с поддержкой трёх языков (ky/ru/kk). Задеплоено на Vercel.

**Architecture:** Next.js (App Router, TS) + Tailwind v4 + shadcn/ui. Данные в Postgres (Neon) через Prisma. i18n через next-intl. Бизнес-логика (валидация, slug, форматирование) — чистые функции, покрытые тестами (Vitest). Один первый шаблон «той-классик» как React-компонент, принимающий данные приглашения. Серверный экшен создаёт запись, публичная страница `/i/[slug]` рендерит шаблон.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Prisma + Postgres (Neon), next-intl, zod, nanoid, Vitest + Testing Library, Vercel.

---

## Структура файлов (что создаём)

```
toili/                                  ← корень проекта (web-приложение)
  app/
    [locale]/
      layout.tsx                        ← локализованный layout
      page.tsx                          ← временная главная (ссылка на /create)
      create/page.tsx                   ← форма создания приглашения
      i/[slug]/page.tsx                 ← публичная страница приглашения
    actions/createInvitation.ts         ← серверный экшен
  components/
    templates/ToiClassic.tsx            ← первый шаблон
  lib/
    invitation/schema.ts                ← zod-схема входных данных
    invitation/slug.ts                  ← генерация slug
    invitation/format.ts                ← форматирование даты под локаль
    invitation/repository.ts            ← доступ к БД (create, getBySlug)
    db.ts                               ← singleton Prisma client
    i18n/locales.ts                     ← список локалей + валидатор
  messages/{ky,ru,kk}.json              ← переводы UI
  prisma/schema.prisma                  ← модель Invitation
  i18n.ts, middleware.ts                ← конфиг next-intl
  vitest.config.ts, vitest.setup.ts     ← тесты
  tests/lib/...                         ← юнит-тесты
  tests/components/...                  ← тесты компонентов
```

**Принцип:** бизнес-логика в `lib/` — чистые тестируемые модули; UI отдельно; модель приглашения — единый источник правды (`schema.ts`).

---

### Task 1: Скаффолд Next.js + Tailwind

**Files:**
- Create: весь каркас проекта в `C:\Users\Alymbek\toili\`

- [ ] **Step 1: Создать Next.js приложение**

Запускать из `C:\Users\Alymbek\`. Создаём в существующую папку `toili` (там уже лежит `docs/`):

```bash
cd /c/Users/Alymbek
npx create-next-app@latest toili --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack --use-npm
```

Если спросит про существующую непустую папку — подтвердить продолжение (там только `docs/`, файлы не конфликтуют).

- [ ] **Step 2: Проверить, что приложение запускается**

```bash
cd /c/Users/Alymbek/toili
npm run dev
```

Expected: dev-сервер поднимается на `http://localhost:3000`, открывается стартовая страница Next.js. Остановить (Ctrl+C).

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Alymbek/toili
git init
git add -A
git commit -m "chore: scaffold Next.js app with TypeScript and Tailwind"
```

---

### Task 2: Тестовый рантайм (Vitest + Testing Library)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (скрипт `test`)

- [ ] **Step 1: Установить зависимости**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Создать `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Создать `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Добавить скрипт в `package.json`**

В блок `"scripts"` добавить:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Создать sanity-тест `tests/sanity.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Запустить тесты**

Run: `npm test`
Expected: PASS, 1 тест.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add Vitest + Testing Library runtime"
```

---

### Task 3: i18n — список локалей и валидатор (TDD)

**Files:**
- Create: `lib/i18n/locales.ts`
- Test: `tests/lib/locales.test.ts`

- [ ] **Step 1: Написать падающий тест**

```ts
// tests/lib/locales.test.ts
import { describe, it, expect } from "vitest";
import { locales, defaultLocale, isValidLocale } from "@/lib/i18n/locales";

describe("locales", () => {
  it("supports Kyrgyz, Russian, Kazakh", () => {
    expect(locales).toEqual(["ky", "ru", "kk"]);
  });

  it("defaults to Kyrgyz", () => {
    expect(defaultLocale).toBe("ky");
  });

  it("validates known locales", () => {
    expect(isValidLocale("ru")).toBe(true);
    expect(isValidLocale("kk")).toBe(true);
  });

  it("rejects unknown locales", () => {
    expect(isValidLocale("en")).toBe(false);
    expect(isValidLocale("")).toBe(false);
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npm test -- tests/lib/locales.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Реализация**

```ts
// lib/i18n/locales.ts
export const locales = ["ky", "ru", "kk"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ky";

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
```

- [ ] **Step 4: Запустить — PASS**

Run: `npm test -- tests/lib/locales.test.ts`
Expected: PASS, 4 теста.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(i18n): add locales list and validator"
```

---

### Task 4: Подключить next-intl (роутинг по локали)

**Files:**
- Create: `i18n.ts`, `middleware.ts`, `messages/ky.json`, `messages/ru.json`, `messages/kk.json`
- Modify: `next.config.ts`
- Move: `app/layout.tsx` → `app/[locale]/layout.tsx`, `app/page.tsx` → `app/[locale]/page.tsx`

- [ ] **Step 1: Установить next-intl**

```bash
npm i next-intl
```

- [ ] **Step 2: Создать файлы переводов**

```json
// messages/ky.json
{ "home": { "title": "Тойли", "subtitle": "Чакыруу 5 мүнөттө", "create": "Чакыруу түзүү" } }
```

```json
// messages/ru.json
{ "home": { "title": "Тойли", "subtitle": "Приглашение за 5 минут", "create": "Создать приглашение" } }
```

```json
// messages/kk.json
{ "home": { "title": "Тойли", "subtitle": "Шақыру 5 минутта", "create": "Шақыру жасау" } }
```

- [ ] **Step 3: Создать `i18n.ts`**

```ts
// i18n.ts
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/locales";

export default getRequestConfig(async ({ locale }) => {
  if (!isValidLocale(locale)) notFound();
  return { messages: (await import(`./messages/${locale}.json`)).default };
});
```

- [ ] **Step 4: Создать `middleware.ts`**

```ts
// middleware.ts
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n/locales";

export default createMiddleware({ locales, defaultLocale });

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 5: Подключить плагин в `next.config.ts`**

```ts
// next.config.ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 6: Перенести layout и page под `app/[locale]/`**

Создать `app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Заменить `app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Home() {
  const t = useTranslations("home");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="text-lg text-gray-600">{t("subtitle")}</p>
      <Link href="create" className="rounded-lg bg-black px-6 py-3 text-white">
        {t("create")}
      </Link>
    </main>
  );
}
```

Удалить старые `app/layout.tsx` и `app/page.tsx` (оставив `app/globals.css`).

- [ ] **Step 7: Проверить вручную**

```bash
npm run dev
```

Expected: `http://localhost:3000/ky` показывает «Тойли / Чакыруу 5 мүнөттө», `/ru` — русский, `/kk` — казахский. `/` редиректит на `/ky`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(i18n): wire next-intl with locale routing (ky/ru/kk)"
```

---

### Task 5: Модель данных приглашения — zod-схема (TDD)

**Files:**
- Create: `lib/invitation/schema.ts`
- Test: `tests/lib/schema.test.ts`

- [ ] **Step 1: Установить zod**

```bash
npm i zod
```

- [ ] **Step 2: Написать падающий тест**

```ts
// tests/lib/schema.test.ts
import { describe, it, expect } from "vitest";
import { invitationInputSchema } from "@/lib/invitation/schema";

const valid = {
  locale: "ky",
  templateId: "toi-classic",
  coupleNames: "Айбек & Айгерим",
  eventDate: "2026-08-15",
  eventTime: "17:00",
  venueName: "Ресторан Достук",
  venueAddress: "Бишкек, пр. Чүй 120",
  mapUrl: "https://2gis.kg/bishkek/firm/123",
  message: "Сиздерди тойго чакырабыз!",
};

describe("invitationInputSchema", () => {
  it("accepts valid input", () => {
    expect(invitationInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing coupleNames", () => {
    const { coupleNames, ...rest } = valid;
    expect(invitationInputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid locale", () => {
    expect(invitationInputSchema.safeParse({ ...valid, locale: "en" }).success).toBe(false);
  });

  it("rejects empty eventDate", () => {
    expect(invitationInputSchema.safeParse({ ...valid, eventDate: "" }).success).toBe(false);
  });

  it("allows omitting optional message and mapUrl", () => {
    const { message, mapUrl, ...rest } = valid;
    expect(invitationInputSchema.safeParse(rest).success).toBe(true);
  });
});
```

- [ ] **Step 3: Запустить — FAIL**

Run: `npm test -- tests/lib/schema.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Реализация**

```ts
// lib/invitation/schema.ts
import { z } from "zod";
import { locales } from "@/lib/i18n/locales";

export const invitationInputSchema = z.object({
  locale: z.enum(locales),
  templateId: z.string().min(1),
  coupleNames: z.string().min(1).max(120),
  eventDate: z.string().min(1), // ISO date "YYYY-MM-DD"
  eventTime: z.string().min(1),
  venueName: z.string().min(1).max(160),
  venueAddress: z.string().min(1).max(240),
  mapUrl: z.string().url().optional(),
  message: z.string().max(600).optional(),
});

export type InvitationInput = z.infer<typeof invitationInputSchema>;
```

- [ ] **Step 5: Запустить — PASS**

Run: `npm test -- tests/lib/schema.test.ts`
Expected: PASS, 5 тестов.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(invitation): add zod input schema"
```

---

### Task 6: Генерация slug (TDD)

**Files:**
- Create: `lib/invitation/slug.ts`
- Test: `tests/lib/slug.test.ts`

- [ ] **Step 1: Установить nanoid**

```bash
npm i nanoid
```

- [ ] **Step 2: Написать падающий тест**

```ts
// tests/lib/slug.test.ts
import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/invitation/slug";

describe("generateSlug", () => {
  it("returns an 8-char lowercase alphanumeric string", () => {
    const slug = generateSlug();
    expect(slug).toMatch(/^[a-z0-9]{8}$/);
  });

  it("returns different values on repeated calls", () => {
    expect(generateSlug()).not.toBe(generateSlug());
  });
});
```

- [ ] **Step 3: Запустить — FAIL**

Run: `npm test -- tests/lib/slug.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Реализация**

```ts
// lib/invitation/slug.ts
import { customAlphabet } from "nanoid";

const nano = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export function generateSlug(): string {
  return nano();
}
```

- [ ] **Step 5: Запустить — PASS**

Run: `npm test -- tests/lib/slug.test.ts`
Expected: PASS, 2 теста.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(invitation): add slug generator"
```

---

### Task 7: Форматирование даты под локаль (TDD)

**Files:**
- Create: `lib/invitation/format.ts`
- Test: `tests/lib/format.test.ts`

- [ ] **Step 1: Написать падающий тест**

```ts
// tests/lib/format.test.ts
import { describe, it, expect } from "vitest";
import { formatEventDate } from "@/lib/invitation/format";

describe("formatEventDate", () => {
  it("formats Russian date with month name", () => {
    expect(formatEventDate("2026-08-15", "ru")).toBe("15 августа 2026");
  });

  it("returns the input unchanged for an invalid date", () => {
    expect(formatEventDate("not-a-date", "ru")).toBe("not-a-date");
  });
});
```

- [ ] **Step 2: Запустить — FAIL**

Run: `npm test -- tests/lib/format.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Реализация**

```ts
// lib/invitation/format.ts
import type { Locale } from "@/lib/i18n/locales";

const intlLocale: Record<Locale, string> = {
  ky: "ky-KG",
  ru: "ru-RU",
  kk: "kk-KZ",
};

export function formatEventDate(isoDate: string, locale: Locale): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
```

- [ ] **Step 4: Запустить — PASS**

Run: `npm test -- tests/lib/format.test.ts`
Expected: PASS, 2 теста.

> Примечание: если форматер вернёт «15 августа 2026 г.» (с « г.»), скорректировать ожидание теста под фактический вывод среды ICU — суть проверки в том, что месяц подставляется словом.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(invitation): add locale-aware date formatter"
```

---

### Task 8: Первый шаблон ToiClassic (TDD-компонент)

**Files:**
- Create: `components/templates/ToiClassic.tsx`
- Test: `tests/components/ToiClassic.test.tsx`

- [ ] **Step 1: Написать падающий тест**

```tsx
// tests/components/ToiClassic.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToiClassic } from "@/components/templates/ToiClassic";

const data = {
  locale: "ru" as const,
  coupleNames: "Айбек & Айгерим",
  eventDate: "2026-08-15",
  eventTime: "17:00",
  venueName: "Ресторан Достук",
  venueAddress: "Бишкек, пр. Чүй 120",
  mapUrl: "https://2gis.kg/bishkek/firm/123",
  message: "Сиздерди тойго чакырабыз!",
};

describe("ToiClassic", () => {
  it("shows couple names", () => {
    render(<ToiClassic data={data} />);
    expect(screen.getByText("Айбек & Айгерим")).toBeInTheDocument();
  });

  it("shows formatted date and time", () => {
    render(<ToiClassic data={data} />);
    expect(screen.getByText(/августа 2026/)).toBeInTheDocument();
    expect(screen.getByText(/17:00/)).toBeInTheDocument();
  });

  it("shows venue and links to the map", () => {
    render(<ToiClassic data={data} />);
    expect(screen.getByText("Ресторан Достук")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /2ГИС|карт|маршрут/i })).toHaveAttribute(
      "href",
      data.mapUrl
    );
  });
});
```

- [ ] **Step 2: Запустить — FAIL**

Run: `npm test -- tests/components/ToiClassic.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Реализация компонента**

```tsx
// components/templates/ToiClassic.tsx
import { formatEventDate } from "@/lib/invitation/format";
import type { Locale } from "@/lib/i18n/locales";

export type ToiClassicData = {
  locale: Locale;
  coupleNames: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  message?: string;
};

export function ToiClassic({ data }: { data: ToiClassicData }) {
  return (
    <article className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-gradient-to-b from-amber-50 to-rose-50 px-6 py-16 text-center">
      <p className="tracking-[0.3em] text-amber-700 uppercase text-sm">Той</p>
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

- [ ] **Step 4: Запустить — PASS**

Run: `npm test -- tests/components/ToiClassic.test.tsx`
Expected: PASS, 3 теста.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(templates): add ToiClassic invitation template"
```

---

### Task 9: Prisma + Neon, модель Invitation

**Files:**
- Create: `prisma/schema.prisma`, `lib/db.ts`, `.env`
- Modify: `package.json` (postinstall — опц.)

- [ ] **Step 1: Создать БД в Neon**

Вручную: на neon.tech создать проект `toili`, скопировать connection string (с `?sslmode=require`).

- [ ] **Step 2: Установить Prisma**

```bash
npm i -D prisma
npm i @prisma/client
npx prisma init
```

- [ ] **Step 3: Прописать строку подключения в `.env`**

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

Убедиться, что `.env` есть в `.gitignore` (create-next-app добавляет `.env*`).

- [ ] **Step 4: Описать модель в `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Invitation {
  id           String   @id @default(uuid())
  slug         String   @unique
  locale       String
  templateId   String
  coupleNames  String
  eventDate    String
  eventTime    String
  venueName    String
  venueAddress String
  mapUrl       String?
  message      String?
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 5: Применить миграцию**

```bash
npx prisma migrate dev --name init_invitation
```

Expected: создаётся таблица `Invitation`, генерируется клиент.

- [ ] **Step 6: Создать singleton клиента `lib/db.ts`**

```ts
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(db): add Prisma schema and Invitation model"
```

---

### Task 10: Репозиторий приглашений (create / getBySlug)

**Files:**
- Create: `lib/invitation/repository.ts`

> Примечание: репозиторий — тонкая обёртка над Prisma; покрываем юнит-тестом slug/schema (Tasks 5-6), а целостность БД-операций проверяем ручным прогоном в Task 12 (создание → открытие). Это сознательный выбор: не поднимаем тестовую БД ради двух запросов в MVP.

- [ ] **Step 1: Реализация**

```ts
// lib/invitation/repository.ts
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/invitation/slug";
import type { InvitationInput } from "@/lib/invitation/schema";

export async function createInvitation(input: InvitationInput) {
  return db.invitation.create({
    data: { ...input, slug: generateSlug() },
  });
}

export function getInvitationBySlug(slug: string) {
  return db.invitation.findUnique({ where: { slug } });
}
```

- [ ] **Step 2: Проверить компиляцию**

Run: `npx tsc --noEmit`
Expected: без ошибок типов.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(invitation): add repository (create, getBySlug)"
```

---

### Task 11: Серверный экшен + форма создания

**Files:**
- Create: `app/actions/createInvitation.ts`, `app/[locale]/create/page.tsx`

- [ ] **Step 1: Серверный экшен**

```ts
// app/actions/createInvitation.ts
"use server";

import { redirect } from "next/navigation";
import { invitationInputSchema } from "@/lib/invitation/schema";
import { createInvitation } from "@/lib/invitation/repository";

export async function createInvitationAction(locale: string, formData: FormData) {
  const parsed = invitationInputSchema.safeParse({
    locale,
    templateId: "toi-classic",
    coupleNames: formData.get("coupleNames"),
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime"),
    venueName: formData.get("venueName"),
    venueAddress: formData.get("venueAddress"),
    mapUrl: (formData.get("mapUrl") as string) || undefined,
    message: (formData.get("message") as string) || undefined,
  });

  if (!parsed.success) {
    throw new Error("Проверьте поля формы");
  }

  const invitation = await createInvitation(parsed.data);
  redirect(`/${locale}/i/${invitation.slug}`);
}
```

- [ ] **Step 2: Форма создания**

```tsx
// app/[locale]/create/page.tsx
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
```

- [ ] **Step 3: Проверить компиляцию**

Run: `npx tsc --noEmit`
Expected: без ошибок.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(create): add invitation form and server action"
```

---

### Task 12: Публичная страница приглашения

**Files:**
- Create: `app/[locale]/i/[slug]/page.tsx`

- [ ] **Step 1: Реализация страницы**

```tsx
// app/[locale]/i/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getInvitationBySlug } from "@/lib/invitation/repository";
import { ToiClassic } from "@/components/templates/ToiClassic";
import { isValidLocale } from "@/lib/i18n/locales";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation || !isValidLocale(locale)) notFound();

  return (
    <ToiClassic
      data={{
        locale,
        coupleNames: invitation.coupleNames,
        eventDate: invitation.eventDate,
        eventTime: invitation.eventTime,
        venueName: invitation.venueName,
        venueAddress: invitation.venueAddress,
        mapUrl: invitation.mapUrl ?? undefined,
        message: invitation.message ?? undefined,
      }}
    />
  );
}
```

- [ ] **Step 2: Ручная проверка полного потока**

```bash
npm run dev
```

Открыть `http://localhost:3000/ru/create`, заполнить форму, нажать «Создать».
Expected: редирект на `/ru/i/<slug>`, отображается шаблон ToiClassic с введёнными данными, кнопка «Маршрут в 2ГИС» ведёт по ссылке. Обновление страницы сохраняет данные (значит, лежат в БД).

- [ ] **Step 3: Прогнать все тесты и типы**

Run: `npm test && npx tsc --noEmit`
Expected: все тесты PASS, ошибок типов нет.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(invitation): add public invitation page by slug"
```

---

### Task 13: Деплой на Vercel

**Files:** —

- [ ] **Step 1: Запушить репозиторий на GitHub**

```bash
git branch -M main
# создать пустой репозиторий toili на GitHub, затем:
git remote add origin https://github.com/<USER>/toili.git
git push -u origin main
```

- [ ] **Step 2: Импортировать проект в Vercel**

На vercel.com → Add New Project → импорт репозитория `toili`.

- [ ] **Step 3: Прописать переменную окружения**

В настройках проекта Vercel добавить `DATABASE_URL` (та же строка Neon).

- [ ] **Step 4: Добавить генерацию Prisma в билд**

В `package.json` изменить скрипт `build`:

```json
"build": "prisma generate && next build"
```

Закоммитить и запушить:

```bash
git add -A
git commit -m "chore: generate prisma client on build"
git push
```

- [ ] **Step 5: Проверить прод**

Открыть выданный Vercel URL → `/ru/create`, создать приглашение, открыть по ссылке.
Expected: всё работает на проде, данные сохраняются.

- [ ] **Step 6 (финальный): Тег вехи**

```bash
git tag veha-1-fundament
git push --tags
```

---

## Self-Review (проверка плана против стратегии)

**Покрытие требований Вехи 1 (из стратегии, Секция 4 «Фундамент»):**
- ✅ Next.js + Tailwind + shadcn-совместимый каркас → Task 1 (shadcn-компоненты добавим в Вехе 2, когда понадобятся; Tailwind готов)
- ✅ Языки KG/RU/KZ → Tasks 3-4 (ky/ru/kk)
- ✅ БД Postgres (Neon) + модель приглашения → Tasks 9-10
- ✅ Первый шаблон → Task 8
- ✅ Создать → сохранить → открыть по ссылке → Tasks 11-12
- ✅ Деплой на Vercel → Task 13
- ✅ Карта 2ГИС (ссылка) → заложена в модель и шаблон (Tasks 5, 8)

**Сознательно отложено (не входит в Веху 1, по плану вех):**
- Галерея/выбор шаблонов, загрузка фото, живой предпросмотр → Веха 2
- RSVP, рассылка, сбор подарков, кабинет → Веха 3
- Авторизация, тарифы, оплата MBANK, конвертация валют → Веха 4 (после Spike 0)
- Авто-конвертация валют пока не нужна (нет цен на экране до Вехи 4)

**Placeholder-скан:** заглушек нет; в каждом шаге, меняющем код, приведён полный код.

**Согласованность типов:** `InvitationInput` (Task 5) используется в репозитории (Task 10) и экшене (Task 11); `ToiClassicData` (Task 8) совпадает с пропсами на странице (Task 12); `Locale`/`isValidLocale` едины (Tasks 3, 7, 8, 12); поля модели Prisma (Task 9) совпадают со схемой zod (Task 5).

**Известное допущение:** тест форматирования даты (Task 7) может потребовать подгонки строки под ICU конкретной среды — отмечено в задаче.
