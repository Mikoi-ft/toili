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
