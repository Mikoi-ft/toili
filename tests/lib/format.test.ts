import { describe, it, expect } from "vitest";
import { formatEventDate } from "@/lib/invitation/format";

describe("formatEventDate", () => {
  it("formats Russian date with month name", () => {
    expect(formatEventDate("2026-08-15", "ru")).toMatch(/августа 2026/);
  });

  it("returns the input unchanged for an invalid date", () => {
    expect(formatEventDate("not-a-date", "ru")).toBe("not-a-date");
  });
});
