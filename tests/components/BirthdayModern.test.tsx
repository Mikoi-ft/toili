import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { BirthdayModern } from "@/components/templates/BirthdayModern";

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
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <BirthdayModern data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Амир, 7 лет")).toBeInTheDocument();
    expect(screen.getByText(/сентября 2026/)).toBeInTheDocument();
    expect(screen.getByText("Кафе Праздник")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <BirthdayModern data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
