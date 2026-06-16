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
