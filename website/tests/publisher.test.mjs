import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { prepareSite } from "../scripts/publisher.mjs";

test("a reader follows a relative source link to the published document and downloads an allowed file", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prazo-docs-"));
  try {
    await mkdir(path.join(root, "website"), { recursive: true });
    await mkdir(path.join(root, "docs"), { recursive: true });
    await writeFile(
      path.join(root, "docs/a.md"),
      "# Guia\n[Modelo](b.md#dados)\n[PDF](../report.pdf)",
    );
    await writeFile(
      path.join(root, "docs/b.md"),
      "# Modelo\n## Dados\nConteúdo.",
    );
    await writeFile(path.join(root, "report.pdf"), "%PDF-demo");
    const manifest = {
      pages: [
        { source: "docs/a.md", id: "uso/guia", title: "Guia" },
        { source: "docs/b.md", id: "engenharia/modelo", title: "Modelo" },
      ],
      assets: ["report.pdf"],
    };
    const result = await prepareSite({ repoRoot: root, manifest });
    const page = await readFile(
      path.join(root, "website/.generated/docs/uso/guia.md"),
      "utf8",
    );
    assert.match(page, /\.\.\/engenharia\/modelo\.md#dados/);
    assert.match(page, /pathname:\/\/\/generated\/report\.pdf/);
    assert.equal(result.pages, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("publishing refuses private files and credentials instead of exposing them on Pages", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prazo-private-"));
  try {
    await mkdir(path.join(root, "website"), { recursive: true });
    await writeFile(path.join(root, ".env.local"), "PRIVATE=example");
    await assert.rejects(
      prepareSite({
        repoRoot: root,
        manifest: { pages: [], assets: [".env.local"] },
      }),
      /Private|Disallowed/,
    );
    await mkdir(path.join(root, "docs"), { recursive: true });
    await writeFile(
      path.join(root, "docs/unsafe.md"),
      "sb_secret_" + "a".repeat(40),
    );
    await assert.rejects(
      prepareSite({
        repoRoot: root,
        manifest: {
          pages: [{ source: "docs/unsafe.md", id: "unsafe", title: "Unsafe" }],
          assets: [],
        },
      }),
      /Credential/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("source links with spaces and accents resolve to the published document", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prazo-spaces-"));
  try {
    await mkdir(path.join(root, "website"), { recursive: true });
    await mkdir(path.join(root, "docs"), { recursive: true });
    await writeFile(
      path.join(root, "docs/index.md"),
      "[Rascunho](<Concepção original.md>)",
    );
    await writeFile(
      path.join(root, "docs/Concepção original.md"),
      "# Concepção",
    );
    await prepareSite({
      repoRoot: root,
      manifest: {
        pages: [
          { source: "docs/index.md", id: "intro", title: "Início" },
          {
            source: "docs/Concepção original.md",
            id: "concepcao",
            title: "Concepção",
          },
        ],
        assets: [],
      },
    });
    const text = await readFile(
      path.join(root, "website/.generated/docs/intro.md"),
      "utf8",
    );
    assert.match(text, /\[Rascunho\]\(\.\/concepcao\.md\)/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("duplicate routes are rejected instead of silently replacing a topic", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prazo-duplicate-"));
  try {
    await mkdir(path.join(root, "website"), { recursive: true });
    await mkdir(path.join(root, "docs"), { recursive: true });
    await writeFile(path.join(root, "docs/a.md"), "# A");
    await writeFile(path.join(root, "docs/b.md"), "# B");
    await assert.rejects(
      prepareSite({
        repoRoot: root,
        manifest: {
          pages: [
            { source: "docs/a.md", id: "same", title: "A" },
            { source: "docs/b.md", id: "same", title: "B" },
          ],
          assets: [],
        },
      }),
      /Duplicate/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a removed original reference is identified as unavailable rather than linked to a nonexistent GitHub file", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prazo-missing-"));
  try {
    await mkdir(path.join(root, "website"), { recursive: true });
    await mkdir(path.join(root, "docs"), { recursive: true });
    await writeFile(
      path.join(root, "docs/a.md"),
      "[Modelo original](removed.pdf)",
    );
    await prepareSite({
      repoRoot: root,
      manifest: {
        pages: [{ source: "docs/a.md", id: "guide", title: "Guia" }],
        assets: [],
      },
    });
    const output = await readFile(
      path.join(root, "website/.generated/docs/guide.md"),
      "utf8",
    );
    assert.match(output, /Modelo original.*arquivo indisponível/);
    assert(!output.includes("/blob/login/prazo/docs/removed.pdf"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
