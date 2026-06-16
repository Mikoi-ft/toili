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
