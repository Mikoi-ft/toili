import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToiClassic } from "@/components/templates/ToiClassic";

const data = {
  locale: "ru" as const,
  coupleNames: "Айбек & Айгерим",
  eventDate: "2026-08-15",
  eventTime: "17:00",
  venueName: "Ресторан Достук",
  venueAddress: "Бишкек, пр. Чүй 120",
  mapUrl: "https://2gis.kg/bishkek/firm/123",
  message: "Сиздерди тойго чакырабыз!",
};

describe("ToiClassic", () => {
  it("shows couple names", () => {
    render(<ToiClassic data={data} />);
    expect(screen.getByText("Айбек & Айгерим")).toBeInTheDocument();
  });

  it("shows formatted date and time", () => {
    render(<ToiClassic data={data} />);
    expect(screen.getByText(/августа 2026/)).toBeInTheDocument();
    expect(screen.getByText(/17:00/)).toBeInTheDocument();
  });

  it("shows venue and links to the map", () => {
    render(<ToiClassic data={data} />);
    expect(screen.getByText("Ресторан Достук")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /2ГИС|карт|маршрут/i })).toHaveAttribute(
      "href",
      data.mapUrl
    );
  });
});
