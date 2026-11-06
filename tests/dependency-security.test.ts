import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// Resolve the exact transitive instance used by the Next.js ESLint plugin.
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("eslint-config-next"));
const pluginRequire = createRequire(
  nextRequire.resolve("@next/eslint-plugin-next"),
);
const globRequire = createRequire(pluginRequire.resolve("fast-glob"));
const matchRequire = createRequire(globRequire.resolve("micromatch"));
interface AstNode {
  type: string;
  nodes?: AstNode[];
  value?: string;
  parent?: AstNode;
}
interface Braces {
  compile(input: string | AstNode): string;
  expand(input: string | AstNode): string[];
  stringify(input: string | AstNode): string;
  parse(input: string): AstNode;
}
const braces = matchRequire("braces") as Braces;
const depthError = "braces: maximum nesting depth of 128 exceeded";

function nestedAst(depth: number): AstNode {
  const root: AstNode = { type: "root", nodes: [] };
  let parent = root;
  for (let index = 0; index < depth; index++) {
    const child: AstNode = { type: "paren", nodes: [], parent };
    parent.nodes!.push(child);
    parent = child;
  }
  parent.nodes!.push({ type: "text", value: "x", parent });
  return root;
}

describe("mitigação local de GHSA-vfj7-8cjw-p6xm", () => {
  it.each(["{", "("])(
    "limita aninhamento de %s antes dos walkers",
    (opening) => {
      const closing = opening === "{" ? "}" : ")";
      const pattern = opening.repeat(4_000) + "x" + closing.repeat(4_000);
      expect(() => braces.parse(pattern)).toThrow(depthError);
      expect(() => braces.compile(pattern)).toThrow(depthError);
      expect(() => braces.expand(pattern)).toThrow(depthError);
    },
  );

  it.each(["compile", "expand", "stringify"] as const)(
    "protege também a API %s que recebe AST diretamente",
    (method) => {
      expect(() => braces[method](nestedAst(10_000))).toThrow(depthError);
    },
  );

  it("preserva expansões comuns e escapes usados em globs", () => {
    expect(braces.expand("src/**/*.{ts,tsx}")).toEqual([
      "src/**/*.ts",
      "src/**/*.tsx",
    ]);
    expect(braces.expand("{a,{b,c}}/{1..3}")).toEqual([
      "a/1",
      "a/2",
      "a/3",
      "b/1",
      "b/2",
      "b/3",
      "c/1",
      "c/2",
      "c/3",
    ]);
    expect(braces.compile("src/*.{ts,tsx}")).toBe("src/*.(ts|tsx)");
    expect(braces.expand("\\{a,b\\}")).toEqual(["{a,b}"]);
    expect(braces.stringify(braces.parse("{a,{b,c}}"))).toBe("{a,{b,c}}");
  });
});
