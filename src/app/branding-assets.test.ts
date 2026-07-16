import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

function pngDimensions(file: string) {
  const buffer = fs.readFileSync(path.join(process.cwd(), file));
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

describe("JuniorFlow AI identity assets", () => {
  it("ships correctly sized official icon derivatives", () => {
    expect(pngDimensions("src/app/icon.png")).toEqual({ width: 512, height: 512 });
    expect(pngDimensions("src/app/apple-icon.png")).toEqual({ width: 180, height: 180 });
    expect(pngDimensions("public/icons/juniorflow-ai-192.png")).toEqual({ width: 192, height: 192 });
    expect(pngDimensions("public/icons/juniorflow-ai-512.png")).toEqual({ width: 512, height: 512 });

    const favicon = fs.readFileSync(path.join(process.cwd(), "src/app/favicon.ico"));
    expect(favicon.readUInt16LE(0)).toBe(0);
    expect(favicon.readUInt16LE(2)).toBe(1);
    expect(favicon.readUInt16LE(4)).toBeGreaterThanOrEqual(3);
  });

  it("references only JuniorFlow AI icons from the manifest", () => {
    const value = manifest();
    expect(value.icons).toEqual([
      expect.objectContaining({ src: "/icons/juniorflow-ai-192.png", sizes: "192x192" }),
      expect.objectContaining({ src: "/icons/juniorflow-ai-512.png", sizes: "512x512" }),
    ]);

    for (const retired of ["next.svg", "vercel.svg"]) {
      expect(fs.existsSync(path.join(process.cwd(), "public", retired))).toBe(false);
    }
  });
});
