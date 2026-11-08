import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { prepareSite } from "./publisher.mjs";
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const manifest = JSON.parse(
  await readFile(new URL("../content-manifest.json", import.meta.url), "utf8"),
);
console.log(await prepareSite({ repoRoot, manifest }));
