import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { TemplateCard } from "@/components/gallery/TemplateCard";

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

const meta = {
  id: "nike-ornament",
  name: { ky: "Нике", ru: "Нике", kk: "Нике" },
  category: "kg-ceremony" as const,
  premium: true,
};

describe("TemplateCard", () => {
  it("shows localized name and premium badge, links to editor", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <TemplateCard meta={meta} locale="ru" />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("Нике")).toBeInTheDocument();
    expect(screen.getByText(/Премиум/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/ru/create?template=nike-ornament");
  });
});
