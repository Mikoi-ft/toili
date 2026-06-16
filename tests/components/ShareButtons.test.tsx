import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ShareButtons } from "@/components/share/ShareButtons";

const messages = {
  share: { whatsapp: "WhatsApp", telegram: "Telegram", copy: "Copy" },
};

describe("ShareButtons", () => {
  it("builds WhatsApp and Telegram share links for the url", () => {
    render(
      <NextIntlClientProvider locale="ru" messages={messages}>
        <ShareButtons url="https://toili.app/ru/i/abc" text="Чакыруу" />
      </NextIntlClientProvider>
    );
    const wa = screen.getByRole("link", { name: /WhatsApp/i });
    const tg = screen.getByRole("link", { name: /Telegram/i });
    expect(wa).toHaveAttribute("href", expect.stringContaining("wa.me"));
    expect(wa.getAttribute("href")).toContain(encodeURIComponent("https://toili.app/ru/i/abc"));
    expect(tg).toHaveAttribute("href", expect.stringContaining("t.me/share"));
  });
});
