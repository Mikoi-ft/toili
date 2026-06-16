import type { ComponentType } from "react";
import type { InvitationViewData, TemplateCategory, TemplateMeta } from "@/lib/templates/types";
import { ToiClassic } from "@/components/templates/ToiClassic";
import { NikeOrnament } from "@/components/templates/NikeOrnament";
import { BirthdayModern } from "@/components/templates/BirthdayModern";
import { KyzUzatuu } from "@/components/templates/KyzUzatuu";
import { BeshikToi } from "@/components/templates/BeshikToi";
import { Jubilee } from "@/components/templates/Jubilee";

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
  "nike-ornament": {
    meta: {
      id: "nike-ornament",
      name: { ky: "Нике той", ru: "Нике той", kk: "Нике той" },
      category: "kg-ceremony",
      premium: true,
    },
    Component: NikeOrnament,
  },
  "birthday-modern": {
    meta: {
      id: "birthday-modern",
      name: { ky: "Туулган күн", ru: "День рождения", kk: "Туған күн" },
      category: "universal",
      premium: false,
    },
    Component: BirthdayModern,
  },
  "kyz-uzatuu": {
    meta: {
      id: "kyz-uzatuu",
      name: { ky: "Кыз узатуу", ru: "Кыз узатуу", kk: "Қыз ұзату" },
      category: "kg-ceremony",
      premium: false,
    },
    Component: KyzUzatuu,
  },
  "beshik-toi": {
    meta: {
      id: "beshik-toi",
      name: { ky: "Бешик той", ru: "Бешик той", kk: "Бесік той" },
      category: "kg-ceremony",
      premium: false,
    },
    Component: BeshikToi,
  },
  "jubilee": {
    meta: {
      id: "jubilee",
      name: { ky: "Юбилей", ru: "Юбилей", kk: "Мерейтой" },
      category: "universal",
      premium: false,
    },
    Component: Jubilee,
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
