import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NikeOrnament } from "@/components/templates/NikeOrnament";

const data = {
  locale: "ru" as const,
  coupleNames: "Нурлан & Айдай",
  eventDate: "2026-08-20",
  eventTime: "16:00",
  venueName: "Той-хана Шанырак",
  venueAddress: "Бишкек, ул. Ахунбаева 5",
  mapUrl: "https://2gis.kg/bishkek/firm/1",
  message: "Никеге чакырабыз",
};

describe("NikeOrnament", () => {
  it("shows names, formatted date and venue", () => {
    render(<NikeOrnament data={data} />);
    expect(screen.getByText("Нурлан & Айдай")).toBeInTheDocument();
    expect(screen.getByText(/августа 2026/)).toBeInTheDocument();
    expect(screen.getByText("Той-хана Шанырак")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(<NikeOrnament data={data} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
