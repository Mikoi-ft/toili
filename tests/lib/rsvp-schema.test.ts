import { describe, it, expect } from "vitest";
import { rsvpInputSchema } from "@/lib/rsvp/schema";

const valid = { name: "Айбек", attending: true, guests: 2, message: "Поздравляю!" };

describe("rsvpInputSchema", () => {
  it("accepts valid input", () => {
    expect(rsvpInputSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects empty name", () => {
    expect(rsvpInputSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
  it("rejects guests < 1", () => {
    expect(rsvpInputSchema.safeParse({ ...valid, guests: 0 }).success).toBe(false);
  });
  it("allows omitting message", () => {
    const { message, ...rest } = valid;
    expect(rsvpInputSchema.safeParse(rest).success).toBe(true);
  });
});
