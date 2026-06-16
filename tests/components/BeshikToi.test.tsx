import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { BeshikToi } from "@/components/templates/BeshikToi";

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
  coupleNames: "Малик",
  eventDate: "2026-09-05",
  eventTime: "12:00",
  venueName: "Кафе Бала",
  venueAddress: "Бишкек, ул. Советская 10",
  mapUrl: "https://2gis.kg/bishkek/firm/55",
  message: "Бешик тойго чакырабыз",
};

describe("BeshikToi", () => {
  it("shows name, formatted date and venue", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <BeshikToi data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Малик")).toBeInTheDocument();
    expect(screen.getByText(/сентября 2026/)).toBeInTheDocument();
    expect(screen.getByText("Кафе Бала")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <BeshikToi data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
