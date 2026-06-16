import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { KyzUzatuu } from "@/components/templates/KyzUzatuu";

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
  coupleNames: "Айгерим",
  eventDate: "2026-08-20",
  eventTime: "14:00",
  venueName: "Той-хана Аалам",
  venueAddress: "Бишкек, ул. Токомбаева 21",
  mapUrl: "https://2gis.kg/bishkek/firm/99",
  message: "Кыз узатуу тойуна чакырабыз",
};

describe("KyzUzatuu", () => {
  it("shows names, formatted date and venue", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <KyzUzatuu data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Айгерим")).toBeInTheDocument();
    expect(screen.getByText(/августа 2026/)).toBeInTheDocument();
    expect(screen.getByText("Той-хана Аалам")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <KyzUzatuu data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
