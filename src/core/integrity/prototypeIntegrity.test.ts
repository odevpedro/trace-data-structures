import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

const root = resolve(__dirname, "../../..");
const original = resolve(root, "trace_complete_market_v2.html");
const copy = resolve(root, "prototype/trace_complete_market_v2.html");

describe("INT-001: Integridade do protótipo canônico", () => {
  test("ambos os arquivos existem", () => {
    expect(existsSync(original), "Arquivo raiz ausente").toBe(true);
    expect(existsSync(copy), "Arquivo em prototype/ ausente").toBe(true);
  });

  test("cópia é byte a byte idêntica ao original", () => {
    const originalBytes = readFileSync(original);
    const copyBytes = readFileSync(copy);
    expect(originalBytes.equals(copyBytes), "Os arquivos divergem").toBe(true);
    expect(originalBytes.length).toBeGreaterThan(200_000);
  });

  test("id únicos no HTML: sem duplicatas", () => {
    const html = readFileSync(original, "utf-8");
    const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    const unique = new Set(ids);
    expect(unique.size, "Há ids duplicados no protótipo").toBe(ids.length);
    expect(ids.length).toBeGreaterThan(50);
  });
});
