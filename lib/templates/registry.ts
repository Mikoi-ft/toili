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
