import type { ComponentType } from "react";
import type { InvitationViewData, TemplateCategory, TemplateMeta } from "@/lib/templates/types";
import { ToiClassic } from "@/components/templates/ToiClassic";
import { NikeOrnament } from "@/components/templates/NikeOrnament";
import { BirthdayModern } from "@/components/templates/BirthdayModern";

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
};

export function getTemplate(id: string): TemplateEntry | undefined {
  return registry[id];
}

export function listTemplates(category?: TemplateCategory): TemplateMeta[] {
  return Object.values(registry)
    .map((e) => e.meta)
    .filter((m) => !category || m.category === category);
}
