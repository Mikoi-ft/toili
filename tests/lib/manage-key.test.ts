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
