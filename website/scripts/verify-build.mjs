import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
const site = fileURLToPath(new URL("../", import.meta.url));
const build = path.join(site, "build");
const origin = "https://keziacalixto.github.io";
const prefix = "/TG-KEZIA2/";
const manifest = JSON.parse(
  await readFile(path.join(site, "content-manifest.json"), "utf8"),
);
async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(full)));
    else if (full.endsWith(".html")) result.push(full);
  }
  return result;
}
const html = await walk(build);
const cache = new Map();
async function parse(file) {
  if (!cache.has(file)) cache.set(file, load(await readFile(file, "utf8")));
  return cache.get(file);
}
async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}
let links = 0;
const errors = [];
for (const file of html) {
  const $ = await parse(file);
  const relative = path
    .relative(build, file)
    .replaceAll("\\", "/")
    .replace(/index\.html$/, "");
  const current = new URL(prefix + relative, origin);
  for (const element of $(
    "a[href],img[src],script[src],link[href]",
  ).toArray()) {
    const raw = $(element).attr("href") ?? $(element).attr("src");
    if (!raw || /^(?:mailto:|tel:|data:|javascript:)/.test(raw)) continue;
    let url;
    try {
      url = new URL(raw, current);
    } catch {
      errors.push(`${relative}: invalid URL ${raw}`);
      continue;
    }
    if (url.origin !== origin) continue;
    links++;
    if (!url.pathname.startsWith(prefix)) {
      errors.push(`${relative}: missing Pages prefix ${raw}`);
      continue;
    }
    const local = decodeURIComponent(url.pathname.slice(prefix.length));
    const candidate = path.resolve(build, local);
    if (path.relative(build, candidate).startsWith("..")) {
      errors.push(`${relative}: outside build ${raw}`);
      continue;
    }
    if (
      $(element).is("a") &&
      url.pathname.endsWith("/") &&
      (await exists(candidate))
    ) {
      errors.push(`${relative}: file URL has a trailing slash ${raw}`);
      continue;
    }
    let target;
    for (const f of [
      candidate,
      path.join(candidate, "index.html"),
      candidate + ".html",
    ]) {
      if (await exists(f)) {
        target = f;
        break;
      }
    }
    if (!target) {
      errors.push(`${relative}: missing target ${raw}`);
      continue;
    }
    if (url.hash && target.endsWith(".html")) {
      const id = decodeURIComponent(url.hash.slice(1));
      const targetDoc = await parse(target);
      if (
        !targetDoc("[id]")
          .toArray()
          .some((e) => targetDoc(e).attr("id") === id)
      )
        errors.push(`${relative}: missing anchor ${raw}`);
    }
  }
}
for (const page of manifest.pages) {
  if (!(await exists(path.join(build, "docs", page.id, "index.html"))))
    errors.push(`Missing document: ${page.id}`);
}
const result = {
  pages: html.length,
  documents: manifest.pages.length,
  localLinksChecked: links,
  errors,
};
await writeFile(
  path.join(site, ".generated/build-verification.json"),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  JSON.stringify({ ...result, errors: errors.slice(0, 30) }, null, 2),
);
if (errors.length) process.exitCode = 1;
