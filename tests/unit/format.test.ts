import { describe, it, expect } from "vitest";
import { formatPrice, purposeLabel, statusLabel, coverImageUrl, locationLabel } from "@/features/properties/format";

describe("formatPrice", () => {
  it("formats valid prices", () => {
    // using breaking space character that Intl.NumberFormat outputs in pt-BR
    expect(formatPrice(1000).replace(/\u00a0/g, ' ')).toContain("R$ 1.000,00");
  });
  it("returns Consulte for null or undefined", () => {
    expect(formatPrice(null)).toBe("Consulte");
    expect(formatPrice(undefined)).toBe("Consulte");
  });
});

describe("purposeLabel", () => {
  it("returns correct labels", () => {
    expect(purposeLabel("sale")).toBe("Venda");
    expect(purposeLabel("rent")).toBe("Aluguel");
  });
});

describe("statusLabel", () => {
  it("returns correct labels", () => {
    expect(statusLabel("published")).toBe("Publicado");
    expect(statusLabel("sold")).toBe("Vendido");
  });
});

describe("coverImageUrl", () => {
  it("returns fallback if empty", () => {
    expect(coverImageUrl([])).toBe("/images/keys-on-table.jpg");
    expect(coverImageUrl(null)).toBe("/images/keys-on-table.jpg");
  });
  it("returns cover image", () => {
    const media = [
      { id: "1", public_url: "url1", is_cover: false, sort_order: 0 },
      { id: "2", public_url: "url2", is_cover: true, sort_order: 1 },
    ];
    expect(coverImageUrl(media)).toBe("url2");
  });
  it("returns first image if no cover", () => {
    const media = [
      { id: "1", public_url: "url1", is_cover: false, sort_order: 0 },
    ];
    expect(coverImageUrl(media)).toBe("url1");
  });
});

describe("locationLabel", () => {
  it("returns correct location", () => {
    expect(locationLabel({ name: "Centro", cities: { name: "Curitiba" } })).toBe("Centro, Curitiba");
  });
});
