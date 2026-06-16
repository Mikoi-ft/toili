# Тойли — Веха «Полировка» (i18n + шаблоны + шапка + тех-причёсывание) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Поднять качество: (1) полная трёхъязычность (ky/ru/kk) всего UI — ни одной хардкод-строки; (2) ещё 2-3 шаблона; (3) общая шапка с логотипом и переключателем языка; (4) тех-причёсывание (next/image, serif-шрифт, timezone у даты).

**Architecture:** Все пользовательские строки — в `messages/{ky,ru,kk}.json`, читаются через next-intl `useTranslations` (изоморфно работает и в серверных, и в клиентских компонентах при наличии `NextIntlClientProvider`, который уже в layout). Шаблоны получают `data.locale` и используют `useTranslations("templates")` для своих подписей. Шапка — общий компонент в `app/[locale]/layout.tsx`; переключатель языка — клиентский, меняет первый сегмент пути. Шрифт — через `next/font/google` (serif), подключённый CSS-переменной в Tailwind. Фото — `next/image`.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, next-intl v4, next/font, next/image, Vitest. Без внешних зависимостей.

> ПЕРЕВОДЫ: ky/ru/kk делаем best-effort; владелец (носитель) вычитает формулировки позже. Структура ключей — финальная.

---

## Структура файлов

```
messages/{ky,ru,kk}.json     ← namespaces: common, nav, home, gallery, editor, rsvp, share, manage, templates
components/
  layout/Header.tsx          ← шапка (лого + nav + LanguageSwitcher)
  layout/LanguageSwitcher.tsx← клиентский переключатель ky/ru/kk
  editor/InvitationEditor.tsx← локализовать
  editor/PhotoUpload.tsx     ← локализовать (строки загрузки)
  rsvp/RsvpForm.tsx          ← локализовать
  rsvp/RsvpSummary.tsx       ← локализовать
  share/ShareButtons.tsx     ← локализовать
  templates/*.tsx            ← локализовать подписи + next/image
  gallery/TemplateCard.tsx   ← next/image для превью (демо без фото — без изменений рендера)
app/[locale]/
  layout.tsx                 ← подключить Header + serif шрифт
  create/page.tsx            ← локализовать заголовок
  i/[slug]/manage/page.tsx   ← (уже частично) дочистить строки
lib/invitation/format.ts     ← timeZone:"UTC"
components/templates/        ← +2-3 новых шаблона
```

---

### Task 1: Расширить messages (ky/ru/kk) всеми ключами

**Files:** Modify `messages/ky.json`, `messages/ru.json`, `messages/kk.json`

- [ ] **Step 1:** Привести каждый файл к единому набору namespaces. Эталон (ru.json) — ниже; ky.json и kk.json повторяют структуру с переводами. Сохранить уже существующие `home`, `gallery`, `rsvp`, `share`, `manage` (дополнить недостающими ключами).

```json
{
  "common": { "create": "Создать", "save": "Сохранить", "back": "Назад", "loading": "Загрузка…" },
  "nav": { "brand": "Тойли", "templates": "Шаблоны", "create": "Создать приглашение" },
  "home": { "title": "Тойли", "subtitle": "Приглашение за 5 минут", "create": "Создать приглашение" },
  "gallery": { "title": "Выберите шаблон", "all": "Все", "kgCeremony": "Той и обряды", "universal": "Универсальные", "premium": "Премиум" },
  "editor": {
    "title": "Создать приглашение",
    "names": "Имена / заголовок", "date": "Дата", "time": "Время",
    "venue": "Место", "address": "Адрес", "mapUrl": "Ссылка 2ГИС (необязательно)",
    "message": "Текст (необязательно)", "photo": "Фото (необязательно)", "uploading": "Загрузка…",
    "submit": "Создать"
  },
  "rsvp": {
    "title": "Подтвердите участие", "name": "Ваше имя", "coming": "Приду", "notComing": "Не приду",
    "guests": "Сколько гостей", "wish": "Пожелание (необязательно)", "submit": "Отправить ответ",
    "thanks": "Рахмат! Ваш ответ записан.", "error": "Не удалось отправить. Попробуйте ещё раз."
  },
  "share": { "whatsapp": "WhatsApp", "telegram": "Telegram", "copy": "Копировать ссылку", "inviteText": "Сиздерди тойго чакырабыз!" },
  "manage": {
    "title": "Ваше приглашение готово", "subtitle": "Поделитесь ссылкой с гостями. Сохраните эту страницу — здесь видны ответы.",
    "open": "Открыть приглашение", "answers": "Ответы гостей",
    "comingCount": "придут", "totalGuests": "всего гостей", "notComingCount": "не придут",
    "noAnswers": "Пока нет ответов", "willCome": "Придёт", "willNotCome": "Не придёт"
  },
  "templates": {
    "toiClassicLabel": "Той", "nikeLabel": "Нике той", "birthdayLabel": "Туулган күн",
    "route": "Маршрут в 2ГИС",
    "kyzUzatuuLabel": "Кыз узатуу", "beshikLabel": "Бешик той", "jubileeLabel": "Юбилей"
  }
}
```

ky.json (перевод на кыргызский) и kk.json (на казахский) — те же ключи. Пример ключевых отличий (ky): `nav.brand`="Тойли", `home.subtitle`="Чакыруу 5 мүнөттө", `rsvp.coming`="Келем", `rsvp.notComing`="Келбейм", `manage.comingCount`="келишет", `templates.route`="2ГИС менен жол". kk: `home.subtitle`="Шақыру 5 минутта", `rsvp.coming`="Келемін", `rsvp.notComing`="Келмеймін".

- [ ] **Step 2:** Проверить, что JSON валиден во всех трёх файлах (`node -e "require('./messages/ky.json')"` и т.д.) и наборы ключей идентичны. Run `npm run build` (next-intl не упадёт на отсутствующих ключах, но проверим сборку).

- [ ] **Step 3: Commit** — `git add messages -A && git commit -m "i18n: add full message keys for ky/ru/kk"`

---

### Task 2: Локализовать клиентские компоненты

**Files:** `components/editor/InvitationEditor.tsx`, `components/editor/PhotoUpload.tsx`, `components/rsvp/RsvpForm.tsx`, `components/rsvp/RsvpSummary.tsx`, `components/share/ShareButtons.tsx`

> next-intl `useTranslations` работает в клиентских компонентах через `NextIntlClientProvider` (уже в layout). Заменить хардкод-строки на `t("...")`.

- [ ] **Step 1: InvitationEditor** — `import { useTranslations } from "next-intl"`, `const t = useTranslations("editor")`, заменить плейсхолдеры/кнопку на `t("names")`, `t("date")`, …, `t("submit")`.

- [ ] **Step 2: PhotoUpload** — `const t = useTranslations("editor")`, «Загрузка…» → `t("uploading")`; подпись поля фото при необходимости.

- [ ] **Step 3: RsvpForm** — `const t = useTranslations("rsvp")`: `t("name")`, `t("coming")`, `t("notComing")`, `t("guests")`, `t("wish")`, `t("submit")`, `t("thanks")`, `t("error")`. Добавить `aria-label={t("guests")}` на числовое поле гостей.

- [ ] **Step 4: RsvpSummary** — сделать клиентским не нужно (серверный). Заменить строки на переводы: компонент серверный → принимать готовые подписи через `useTranslations("manage")` нельзя в серверном без isomorphic… `useTranslations` работает и на сервере. Добавить `import { useTranslations } from "next-intl"; const t = useTranslations("manage")` и заменить «придут»/«всего гостей»/«не придут»/«Придёт»/«Не придёт»/«Пока нет ответов» на `t(...)`.

- [ ] **Step 5: ShareButtons** — `const t = useTranslations("share")`: подписи кнопок → `t("whatsapp")`, `t("telegram")`, `t("copy")`. Текст приглашения для рассылки принимать пропсом `text` (как сейчас) — вызывающий передаёт `t("share.inviteText")`.

- [ ] **Step 6:** Обновить тест `tests/components/ShareButtons.test.tsx` — он рендерит ShareButtons вне провайдера i18n; обернуть в `NextIntlClientProvider` с минимальными messages ИЛИ, поскольку подписи теперь из t(), передать провайдер. Пример обёртки:

```tsx
import { NextIntlClientProvider } from "next-intl";
const messages = { share: { whatsapp: "WhatsApp", telegram: "Telegram", copy: "Copy" } };
render(
  <NextIntlClientProvider locale="ru" messages={messages}>
    <ShareButtons url="https://toili.app/ru/i/abc" text="Чакыруу" />
  </NextIntlClientProvider>
);
```
Ссылки wa.me/t.me проверяются как раньше.

- [ ] **Step 7:** Аналогично обновить тесты RSVP/шаблонов, если они рендерят компоненты, использующие `useTranslations` (обернуть в `NextIntlClientProvider`). Прогнать `npm test` — всё зелёное.

- [ ] **Step 8: Commit** — `git add -A && git commit -m "i18n: localize editor, rsvp, share components"`

---

### Task 3: Локализовать серверные страницы и подписи шаблонов

**Files:** `app/[locale]/create/page.tsx`, `app/[locale]/i/[slug]/manage/page.tsx`, `components/templates/*.tsx`

- [ ] **Step 1: create/page.tsx** — заголовок → `t("editor.title")` через `getTranslations`.

- [ ] **Step 2: manage/page.tsx** — дочистить оставшиеся строки (`title`, `subtitle`, `open`, `answers`, текст рассылки в ShareButtons = `t("share.inviteText")`) через `getTranslations`.

- [ ] **Step 3: Шаблоны** — в `ToiClassic`, `NikeOrnament`, `BirthdayModern` заменить захардкоженные подписи («Той», «Нике той», «Туулган күн», «Маршрут в 2ГИС») на `useTranslations("templates")` (`t("toiClassicLabel")`, `t("route")` и т.д.). `useTranslations` работает и в серверной странице приглашения, и в клиентском превью редактора.

- [ ] **Step 4:** Обновить тесты шаблонов — обернуть рендер в `NextIntlClientProvider` с messages, содержащими namespace `templates`. Кнопка карты теперь ищется по `t("route")`; в тестах использовать тот же текст из переданных messages. Прогнать `npm test`.

- [ ] **Step 5: Проверка** — `npx tsc --noEmit`, `npm run build`.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "i18n: localize server pages and template labels"`

---

### Task 4: Шапка + переключатель языка

**Files:** Create `components/layout/LanguageSwitcher.tsx`, `components/layout/Header.tsx`; Modify `app/[locale]/layout.tsx`

- [ ] **Step 1: LanguageSwitcher (клиент)**

```tsx
// components/layout/LanguageSwitcher.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/locales";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (loc: Locale) => {
    const segments = pathname.split("/");
    segments[1] = loc; // first segment after leading slash is the locale
    router.push(segments.join("/") || `/${loc}`);
  };

  return (
    <div className="flex gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchTo(loc)}
          className={`rounded px-2 py-1 text-sm uppercase ${loc === current ? "bg-black text-white" : "text-gray-500"}`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Header (сервер)**

```tsx
// components/layout/Header.tsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/locales";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations("nav");
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href={`/${locale}`} className="text-xl font-bold">{t("brand")}</Link>
      <nav className="flex items-center gap-4">
        <Link href={`/${locale}/templates`} className="text-sm text-gray-600 hover:text-black">{t("templates")}</Link>
        <LanguageSwitcher current={locale} />
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Подключить в layout** — в `app/[locale]/layout.tsx` отрендерить `<Header locale={locale as Locale} />` над `{children}` внутри провайдера. Импортировать тип `Locale`.

- [ ] **Step 4: Проверка** — `npm run build`; вручную: на всех страницах есть шапка; клик по ky/ru/kk меняет язык, сохраняя текущий путь.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(nav): add header with logo and language switcher"`

---

### Task 5: Ещё шаблоны (до 5+ free)

**Files:** Create `components/templates/KyzUzatuu.tsx`, `components/templates/BeshikToi.tsx`, `components/templates/Jubilee.tsx`; Modify `lib/templates/registry.ts`; Tests.

Контракт — `{ data: InvitationViewData }`, подписи через `useTranslations("templates")`, фото через next/image (Task 6). Дизайн-направление: **KyzUzatuu** (проводы невесты, kg, нежная пастель, free); **BeshikToi** (бешик той — укладывание в люльку, kg, тёплый детский, free); **Jubilee** (юбилей, universal, строгий тёмно-золотой, free).

- [ ] **Step 1:** TDD-тест на каждый (рендер имени/даты/места + ссылка карты), по образцу существующих, обёрнутый в `NextIntlClientProvider` с `templates` messages.

- [ ] **Step 2:** Реализовать 3 компонента (структура как у BirthdayModern/NikeOrnament, разные палитры; подпись события — соответствующий `t("...Label")`).

- [ ] **Step 3:** Зарегистрировать в реестре: `kyz-uzatuu` (kg, free), `beshik-toi` (kg, free), `jubilee` (universal, free).

- [ ] **Step 4:** `npm test` — все зелёные (реестр теперь содержит 6 шаблонов).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(templates): add KyzUzatuu, BeshikToi, Jubilee templates"`

---

### Task 6: Тех-причёсывание (next/image, шрифт, timezone)

**Files:** `lib/invitation/format.ts`, `app/[locale]/layout.tsx`, `app/globals.css`, все `components/templates/*.tsx`, `next.config.ts`

- [ ] **Step 1: timezone у даты** — в `formatEventDate` добавить `timeZone: "UTC"` в опции `Intl.DateTimeFormat`, чтобы дата не «съезжала» на день. Обновить тест при необходимости (ожидание остаётся `/августа 2026/`).

- [ ] **Step 2: serif-шрифт** — в `app/[locale]/layout.tsx` подключить serif через `next/font/google` (например `Playfair_Display`), выставить CSS-переменную:

```tsx
import { Playfair_Display } from "next/font/google";
const serif = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-serif" });
// на <html> или <body>: className={serif.variable}
```
В `app/globals.css` сопоставить `--font-serif` с утилитой Tailwind (через `@theme` v4 или класс). Шаблоны используют `font-serif` → теперь это Playfair.

- [ ] **Step 3: next/image** — в шаблонах и где есть `<img src={photoUrl}>` заменить на `next/image` `<Image>` с заданными `width`/`height` (или `fill` + контейнер). Разрешить домен Blob в `next.config.ts`:

```ts
images: { remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] },
```
(для picsum в тестах не нужно — тесты проверяют рендер строки/alt; при использовании next/image проверять по `alt`/`src` через `screen.getByRole("img")`).

- [ ] **Step 4: Проверка** — `npx tsc --noEmit`, `npm test`, `npm run build` (next/image требует корректных width/height — убедиться, что нет ворнингов про размеры).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "chore: next/image, serif font, UTC date formatting"`

---

### Task 7: Деплой и проверка

**Files:** —

- [ ] **Step 1: Push** — `git push`.

- [ ] **Step 2: Проверка прода** — на `toili-ten.vercel.app`: шапка с переключателем языка (ky/ru/kk меняет язык и сохраняет путь); галерея с 6 шаблонами; редактор/форма RSVP/кабинет — на выбранном языке; фото через next/image; новые шаблоны открываются. curl 200 на ключевых страницах, переключение `/ru/...` vs `/ky/...` отдаёт разные языки.

- [ ] **Step 3: Тег** — `git tag veha-polish && git push --tags`.

---

## Self-Review

**Покрытие выбранного скоупа:**
- ✅ Полная трёхъязычность → Tasks 1-3 (ключи + клиентские компоненты + серверные страницы + подписи шаблонов)
- ✅ Больше шаблонов → Task 5 (6 шаблонов всего)
- ✅ Навигация/шапка + переключатель языка → Task 4
- ✅ Тех-причёсывание (next/image, serif, timezone) → Task 6

**Placeholder-скан:** структура ключей и код приведены; полные переводы ky/kk заполняет имплементер по образцу (best-effort, помечено для вычитки носителем).

**Согласованность:** namespaces из Task 1 используются во всех компонентах (Tasks 2-5); `useTranslations` изоморфен (сервер+клиент) — отмечено; тесты компонентов, использующих `useTranslations`, оборачиваются в `NextIntlClientProvider` (Tasks 2,3,5); `Locale` тип единый; реестр (Task 5) расширяется без изменения контракта `InvitationViewData`.

**Риски:** (1) next-intl `useTranslations` в серверных компонентах — поддерживается, но если возникнут проблемы с конкретной версией, серверные места перевести через `getTranslations` (async). (2) Тесты, рендерящие компоненты с `useTranslations`, упадут без провайдера — обязательная обёртка `NextIntlClientProvider` в тестах. (3) next/image требует разрешённый домен Blob в next.config (Task 6 Step 3) и явные размеры. (4) Качество ky/kk переводов — best-effort, вычитка владельцем.
