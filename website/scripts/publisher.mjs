import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, copyFile, rm } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

function inside(root, name) {
  const result = path.resolve(root, name);
  if (
    path.relative(root, result).startsWith("..") ||
    path.isAbsolute(path.relative(root, result))
  )
    throw new Error(`Path outside repository: ${name}`);
  return result;
}

export async function prepareSite({ repoRoot, manifest }) {
  const root = path.resolve(repoRoot);
  const ids = new Set();
  const sourceNames = new Set();
  for (const page of manifest.pages) {
    if (!/^[a-z0-9][a-z0-9/_-]*$/.test(page.id))
      throw new Error(`Invalid route: ${page.id}`);
    if (ids.has(page.id) || sourceNames.has(page.source))
      throw new Error(`Duplicate route or source: ${page.id}`);
    ids.add(page.id);
    sourceNames.add(page.source);
  }
  for (const source of [
    ...manifest.pages.map((p) => p.source),
    ...manifest.assets,
  ]) {
    if (
      source
        .split(/[\\/]/)
        .some((part) =>
          /^(?:\.env|\.git$|node_modules$)|\.local(?:\.|$)/i.test(part),
        )
    )
      throw new Error(`Private file: ${source}`);
    if (
      !/\.(?:md|pdf|svg|png|jpg|jpeg|csv|docx|pptx|zip|json|sha256)$/i.test(
        source,
      )
    )
      throw new Error(`Disallowed file: ${source}`);
    inside(root, source);
  }
  const site = inside(root, "website");
  const generated = inside(site, ".generated");
  const assetsDir = inside(site, "static/generated");
  // These two exact output directories are verified before recursive removal.
  if (
    generated !== path.join(site, ".generated") ||
    assetsDir !== path.join(site, "static", "generated")
  )
    throw new Error("Invalid output");
  await rm(generated, { recursive: true, force: true });
  await rm(assetsDir, { recursive: true, force: true });
  await mkdir(path.join(generated, "docs"), { recursive: true });
  await mkdir(assetsDir, { recursive: true });
  const pages = new Map(manifest.pages.map((p) => [p.source, p]));
  const assets = new Set(manifest.assets);
  const records = [];
  for (const source of assets) {
    const destination = inside(assetsDir, source);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(inside(root, source), destination);
  }
  for (const page of manifest.pages) {
    const buffer = await readFile(inside(root, page.source));
    let text = buffer.toString("utf8");
    if (
      /(?:sb_secret_|xkeysib-)[A-Za-z0-9_-]{24,}|(?:token|token_hash|code)=[A-Za-z0-9_-]{32,}/.test(
        text,
      )
    )
      throw new Error(`Credential found: ${page.source}`);
    if (page.transform === "database") text = await expandDatabase(text, root);
    text = text.replace(
      /\]\(<([^>]+)>\)/g,
      (_, url) => "](" + url.replaceAll(" ", "%20") + ")",
    );
    text = text.replace(
      /(!?\[[^\]]*\])\(([^\s)]+)(\s+"[^"]*")?\)/g,
      (match, label, raw, title = "") => {
        if (/^(?:https?:|mailto:|#|@site)/.test(raw)) return match;
        const [file, fragment] = raw.split("#");
        let decoded;
        try {
          decoded = decodeURIComponent(file);
        } catch {
          throw new Error(`Invalid link in ${page.source}`);
        }
        const target = path.posix.normalize(
          path.posix.join(
            path.posix.dirname(page.source),
            decoded.replaceAll("\\", "/"),
          ),
        );
        let url;
        if (pages.has(target)) {
          const relative = path.posix.relative(
            path.posix.dirname(page.id),
            pages.get(target).id + ".md",
          );
          url = relative.startsWith(".") ? relative : "./" + relative;
        } else if (assets.has(target)) {
          url = "@site/static/generated/" + target;
        } else {
          if (label.startsWith("!"))
            throw new Error(`Unpublished image ${target} in ${page.source}`);
          if (!existsSync(inside(root, target)))
            return label.slice(1, -1) + " (arquivo indisponível nesta cópia)";
          url =
            "https://github.com/KeziaCalixto/TG-KEZIA2/blob/login/prazo/" +
            target.split("/").map(encodeURIComponent).join("/");
        }
        return `${label}(${url}${fragment ? "#" + fragment : ""}${title})`;
      },
    );
    const meta = `---\nid: ${JSON.stringify(path.posix.basename(page.id))}\ntitle: ${JSON.stringify(page.title)}\nslug: /${page.id}\nedit_url: https://github.com/KeziaCalixto/TG-KEZIA2/edit/login/prazo/${page.source}\n---\n\n`;
    const notice = page.historical
      ? "> **Registro histórico.** Evidências e versões desta página conservam a data da execução original. Consulte [o estado da entrega](/docs/visao-geral/estado) para a síntese atual.\n\n"
      : "";
    const output = inside(path.join(generated, "docs"), page.id + ".md");
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, meta + notice + text, "utf8");
    records.push({
      source: page.source,
      id: page.id,
      sha256: createHash("sha256").update(buffer).digest("hex"),
    });
  }
  await writeFile(
    path.join(generated, "sources.json"),
    JSON.stringify(records, null, 2) + "\n",
  );
  return { pages: records.length, assets: assets.size };
}

async function expandDatabase(text, root) {
  const schema = JSON.parse(
    await readFile(
      path.join(root, "docs/relatorio-banco/schema-inventario.json"),
      "utf8",
    ),
  );
  const table = (headers, rows) =>
    "| " +
    headers.join(" | ") +
    " |\n| " +
    headers.map(() => "---").join(" | ") +
    " |\n" +
    rows
      .map(
        (row) =>
          "| " +
          row
            .map((x) =>
              String(x ?? "—")
                .replaceAll("|", "\\|")
                .replaceAll("\n", " "),
            )
            .join(" | ") +
          " |",
      )
      .join("\n");
  const dictionary = Object.entries(schema.tables)
    .map(
      ([name, info]) =>
        "### " +
        name +
        "\n\n" +
        table(
          ["Coluna", "Tipo SQL", "Aceita nulo", "Default", "Definição SQL"],
          info.columns.map((c) => [
            "`" + c.name + "`",
            c.type,
            c.nullable ? "Sim" : "Não",
            c.default,
            c.definition,
          ]),
        ),
    )
    .join("\n\n");
  const functions = table(
    ["Função", "Segurança", "Definição final"],
    Object.entries(schema.functions).map(([name, f]) => [
      "`" + name + "`",
      f.security,
      `[SQL linha ${f.line}](https://github.com/KeziaCalixto/TG-KEZIA2/blob/login/prazo/${f.source}#L${f.line})`,
    ]),
  );
  const manifest = JSON.parse(
    await readFile(
      path.join(root, "docs/relatorio-banco/fontes-e-manifesto.json"),
      "utf8",
    ),
  );
  const refs =
    "Fontes P01–P08: migrations, arquitetura, decisões, implementação, configuração, segurança, testes e aceite, preservados no [PDF integral](../../output/documents/prazo-claro-relatorio-banco-de-dados-2026-11-04.pdf).\n\n" +
    Object.entries(manifest.external_sources)
      .map(
        ([key, [title, links]]) =>
          `- **${key}** ${title} ${links.map((link) => "[Fonte oficial](" + link + ")").join(" ")}`,
      )
      .join("\n");
  return text
    .replace("@dictionary", dictionary)
    .replace("@functions", functions)
    .replace(
      "@indexes",
      table(
        ["Índice explícito", "Definição"],
        schema.indexes.map((i) => [i.sql.match(/index\s+(\w+)/i)[1], i.sql]),
      ),
    )
    .replace(
      "@migrations",
      table(
        ["Versão", "Arquivo"],
        schema.migrations.map((m) => [m.version, m.path]),
      ),
    )
    .replace("@references", refs)
    .replace(/^@table (.+)$/gm, "**$1**")
    .replace(
      /^@figure ([^|]+)\|(.+)$/gm,
      (_, name, caption) => `![${caption}](diagramas/${name}.svg)`,
    )
    .replace(/^(#{1,5}) /gm, "$1# ");
}
