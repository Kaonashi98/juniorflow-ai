import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SCAN_ROOTS = ["src/app", "src/components"];
const VISIBLE_ATTRIBUTES = new Set([
  "alt",
  "aria-label",
  "aria-description",
  "placeholder",
  "title",
]);

const ALLOWED_VISIBLE_LITERALS = [
  /^(?:JuniorFlow(?: AI)?|AI|GPT-5\.6|OpenAI|Codex)$/,
  /^(?:English|Italiano)$/,
  /^(?:FRONT-END|JF-\d+|React(?: · TypeScript)?|\/\s*100)$/,
  /^(?:[/.][A-Za-z0-9_./:[\]-]+)$/,
];

function sourceFiles(root: string): string[] {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.(?:tsx|jsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function isAllowed(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!/[A-Za-zÀ-ÿ]/.test(normalized)) return true;
  return ALLOWED_VISIBLE_LITERALS.some((pattern) => pattern.test(normalized));
}

function visibleLiterals(file: string) {
  const sourceText = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const findings: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) {
      const value = node.getText(source).replace(/\s+/g, " ").trim();
      if (value && !isAllowed(value)) {
        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
        findings.push(`${path.relative(process.cwd(), file)}:${line}: JSX text "${value}"`);
      }
    }

    if (
      ts.isJsxAttribute(node) &&
      VISIBLE_ATTRIBUTES.has(node.name.getText(source)) &&
      ts.isJsxOpeningLikeElement(node.parent.parent) &&
      /^[a-z]/.test(node.parent.parent.tagName.getText(source)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      const value = node.initializer.text;
      if (!isAllowed(value)) {
        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
        findings.push(`${path.relative(process.cwd(), file)}:${line}: ${node.name.getText(source)}="${value}"`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(source);
  return findings;
}

describe("visible copy guard", () => {
  it("keeps natural-language JSX in the typed localization system", () => {
    const findings = SCAN_ROOTS
      .flatMap((root) => sourceFiles(path.join(process.cwd(), root)))
      .flatMap(visibleLiterals);

    expect(findings, findings.join("\n")).toEqual([]);
  });
});
