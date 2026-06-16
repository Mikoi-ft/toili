import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { Jubilee } from "@/components/templates/Jubilee";

const messages = {
  templates: {
    toiClassicLabel: "Той",
    nikeLabel: "Нике той",
    birthdayLabel: "Туулган күн",
    route: "Маршрут в 2ГИС",
    kyzUzatuuLabel: "Кыз узатуу",
    beshikLabel: "Бешик той",
    jubileeLabel: "Юбилей",
  },
};

const data = {
  locale: "ru" as const,
  coupleNames: "Кадыр Алиев",
  eventDate: "2026-10-15",
  eventTime: "18:00",
  venueName: "Банкетный зал Гранд",
  venueAddress: "Бишкек, просп. Манаса 1",
  mapUrl: "https://2gis.kg/bishkek/firm/77",
  message: "Юбилей 50 лет",
};

describe("Jubilee", () => {
  it("shows name, formatted date and venue", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <Jubilee data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Кадыр Алиев")).toBeInTheDocument();
    expect(screen.getByText(/октября 2026/)).toBeInTheDocument();
    expect(screen.getByText("Банкетный зал Гранд")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <Jubilee data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
