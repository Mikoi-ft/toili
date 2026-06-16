import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemplateCard } from "@/components/gallery/TemplateCard";

const meta = {
  id: "nike-ornament",
  name: { ky: "Нике", ru: "Нике", kk: "Нике" },
  category: "kg-ceremony" as const,
  premium: true,
};

describe("TemplateCard", () => {
  it("shows localized name and premium badge, links to editor", () => {
    render(<TemplateCard meta={meta} locale="ru" />);
    expect(screen.getByText("Нике")).toBeInTheDocument();
    expect(screen.getByText(/Премиум/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/ru/create?template=nike-ornament");
  });
});
