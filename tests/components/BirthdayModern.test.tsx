import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BirthdayModern } from "@/components/templates/BirthdayModern";

const data = {
  locale: "ru" as const,
  coupleNames: "Амир, 7 лет",
  eventDate: "2026-09-10",
  eventTime: "13:00",
  venueName: "Кафе Праздник",
  venueAddress: "Бишкек, пр. Манаса 30",
  mapUrl: "https://2gis.kg/bishkek/firm/2",
  message: "Ждём на праздник!",
};

describe("BirthdayModern", () => {
  it("shows title, date and venue", () => {
    render(<BirthdayModern data={data} />);
    expect(screen.getByText("Амир, 7 лет")).toBeInTheDocument();
    expect(screen.getByText(/сентября 2026/)).toBeInTheDocument();
    expect(screen.getByText("Кафе Праздник")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(<BirthdayModern data={data} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
