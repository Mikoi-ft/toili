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
