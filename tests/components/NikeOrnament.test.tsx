import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { NikeOrnament } from "@/components/templates/NikeOrnament";

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
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <NikeOrnament data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Нурлан & Айдай")).toBeInTheDocument();
    expect(screen.getByText(/августа 2026/)).toBeInTheDocument();
    expect(screen.getByText("Той-хана Шанырак")).toBeInTheDocument();
  });
  it("links to the map", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <NikeOrnament data={data} />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", data.mapUrl);
  });
});
