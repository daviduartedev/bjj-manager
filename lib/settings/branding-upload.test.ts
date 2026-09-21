import { describe, expect, it } from "vitest";

import {
  checkBrandingFile,
  persistBrandingUpload,
  removeBrandingAsset,
} from "./branding-upload";

function pngFile(size = 64): File {
  return new File([new Uint8Array(size)], "marca.png", { type: "image/png" });
}

function svgFile(size = 64): File {
  return new File([new Uint8Array(size)], "marca.svg", { type: "image/svg+xml" });
}

describe("checkBrandingFile", () => {
  it("rejeita ficheiro vazio", () => {
    const r = checkBrandingFile(pngFile(0));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("Ficheiro vazio.");
  });

  it("rejeita ficheiro maior que 256 KB", () => {
    const r = checkBrandingFile(pngFile(256 * 1024 + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("Ficheiro maior que 256 KB.");
  });

  it("rejeita tipo que não é PNG nem SVG", () => {
    const r = checkBrandingFile(new File([new Uint8Array(16)], "x.jpg", { type: "image/jpeg" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("Use PNG ou SVG.");
  });

  it("aceita PNG e SVG dentro do limite", () => {
    expect(checkBrandingFile(pngFile()).ok).toBe(true);
    expect(checkBrandingFile(svgFile()).ok).toBe(true);
  });
});

describe("persistBrandingUpload / removeBrandingAsset — logo", () => {
  it("grava só logo_url ao enviar a logo", async () => {
    const written: Array<{ column: string; value: string | null }> = [];
    const uploaded: string[] = [];

    const r = await persistBrandingUpload({
      accountId: "acc-1",
      kind: "logo",
      file: pngFile(),
      upload: async (path) => {
        uploaded.push(path);
      },
      writePath: async (_accountId, column, value) => {
        written.push({ column, value });
      },
    });

    expect(r).toEqual({ ok: true });
    expect(written).toEqual([{ column: "logo_url", value: expect.any(String) }]);
    expect(written[0]?.value).not.toBeNull();
    expect(uploaded).toHaveLength(1);
  });

  it("substitui a logo gravando de novo só logo_url", async () => {
    const written: Array<{ column: string; value: string | null }> = [];

    await persistBrandingUpload({
      accountId: "acc-1",
      kind: "logo",
      file: pngFile(),
      upload: async () => {},
      writePath: async (_accountId, column, value) => {
        written.push({ column, value });
      },
    });
    await persistBrandingUpload({
      accountId: "acc-1",
      kind: "logo",
      file: svgFile(),
      upload: async () => {},
      writePath: async (_accountId, column, value) => {
        written.push({ column, value });
      },
    });

    expect(written).toHaveLength(2);
    expect(written.every((w) => w.column === "logo_url")).toBe(true);
    expect(written.every((w) => w.value)).toBe(true);
  });

  it("remove só logo_url e não mexe em signature_url", async () => {
    const written: Array<{ column: string; value: string | null }> = [];
    const removed: string[] = [];

    const r = await removeBrandingAsset({
      accountId: "acc-1",
      kind: "logo",
      readPath: async () => "acc-1/logo.png",
      remove: async (paths) => {
        removed.push(...paths);
      },
      writePath: async (_accountId, column, value) => {
        written.push({ column, value });
      },
    });

    expect(r).toEqual({ ok: true });
    expect(written).toEqual([{ column: "logo_url", value: null }]);
    expect(removed).toEqual(["acc-1/logo.png"]);
  });

  it("não grava logo quando o ficheiro é inválido", async () => {
    const written: Array<{ column: string; value: string | null }> = [];

    const r = await persistBrandingUpload({
      accountId: "acc-1",
      kind: "logo",
      file: new File([], "x.jpg", { type: "image/jpeg" }),
      upload: async () => {
        throw new Error("não deveria enviar");
      },
      writePath: async (_accountId, column, value) => {
        written.push({ column, value });
      },
    });

    expect(r.ok).toBe(false);
    expect(written).toEqual([]);
  });
});
