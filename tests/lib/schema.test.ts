import { describe, it, expect } from "vitest";
import { invitationInputSchema } from "@/lib/invitation/schema";

const valid = {
  locale: "ky",
  templateId: "toi-classic",
  coupleNames: "Айбек & Айгерим",
  eventDate: "2026-08-15",
  eventTime: "17:00",
  venueName: "Ресторан Достук",
  venueAddress: "Бишкек, пр. Чүй 120",
  mapUrl: "https://2gis.kg/bishkek/firm/123",
  message: "Сиздерди тойго чакырабыз!",
};

describe("invitationInputSchema", () => {
  it("accepts valid input", () => {
    expect(invitationInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing coupleNames", () => {
    const { coupleNames, ...rest } = valid;
    expect(invitationInputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid locale", () => {
    expect(invitationInputSchema.safeParse({ ...valid, locale: "en" }).success).toBe(false);
  });

  it("rejects empty eventDate", () => {
    expect(invitationInputSchema.safeParse({ ...valid, eventDate: "" }).success).toBe(false);
  });

  it("allows omitting optional message and mapUrl", () => {
    const { message, mapUrl, ...rest } = valid;
    expect(invitationInputSchema.safeParse(rest).success).toBe(true);
  });
});
