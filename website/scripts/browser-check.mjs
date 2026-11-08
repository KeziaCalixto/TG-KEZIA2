import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const site = fileURLToPath(new URL("../", import.meta.url));
const artifacts = path.resolve(site, "../docs/testing/artifacts");
await mkdir(artifacts, { recursive: true });
const server = spawn(
  process.execPath,
  [
    path.join(site, "node_modules/@docusaurus/core/bin/docusaurus.mjs"),
    "serve",
    "--host",
    "127.0.0.1",
    "--port",
    "3081",
    "--no-open",
  ],
  { cwd: site, stdio: "pipe", windowsHide: true },
);
let log = "";
server.stdout.on("data", (d) => {
  log += d;
});
server.stderr.on("data", (d) => {
  log += d;
});
const base = "http://127.0.0.1:3081/TG-KEZIA2/";
let browser;
const findings = [];
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  assert(ready, "Static server did not start: " + log);
  browser = await chromium.launch(
    process.platform === "win32" ? { channel: "msedge" } : { headless: true },
  );
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Começar a leitura" }).waitFor();
    assert.equal(await page.locator("h1").count(), 1);
    await page.evaluate(() => document.fonts.ready);
    const loadedFonts = await page.evaluate(() =>
      Array.from(document.fonts)
        .filter((f) => f.status === "loaded")
        .map((f) => f.family.replaceAll(/['"]/g, "")),
    );
    assert(
      loadedFonts.includes("Lato") && loadedFonts.includes("EB Garamond"),
      "Local brand fonts were not loaded",
    );
    await page.keyboard.press("Tab");
    assert.match(
      await page.evaluate(() => document.activeElement.textContent),
      /pular|skip/i,
    );
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent.trim()),
      "Começar a leitura →",
      "Skip link did not continue navigation inside main",
    );
    await page.locator("h1").click();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "Horizontal overflow at " + device,
    );
    if (device === "mobile") {
      const toggle = page.locator(".navbar__toggle");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator(".navbar-sidebar")).toBeVisible();
      await page.locator(".navbar-sidebar__close").click();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
    }
    await page.screenshot({
      path: path.join(artifacts, `docs-portal-${device}.png`),
      fullPage: true,
      animations: "disabled",
    });
    let axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      axe.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      [],
      "Accessibility homepage " + device,
    );
    if (device === "desktop") {
      const mode = page.getByRole("button", { name: /escuro|dark/i });
      for (
        let i = 0;
        i < 3 &&
        (await page.locator("html").getAttribute("data-theme")) !== "dark";
        i++
      ) {
        const previous = await page
          .locator("html")
          .getAttribute("data-theme-choice");
        await mode.click();
        await page.waitForFunction(
          (before) =>
            document.documentElement.getAttribute("data-theme-choice") !==
            before,
          previous,
        );
      }
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      // Theme attributes change before the finite CSS color transitions finish.
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation.playState === "running" &&
                Number.isFinite(animation.effect?.getComputedTiming().endTime),
            )
            .map((animation) => animation.finished.catch(() => {})),
        ),
      );
      const dark = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        dark.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        [],
        "Dark-mode accessibility",
      );
      await page.screenshot({
        path: path.join(artifacts, "docs-portal-dark.png"),
        fullPage: true,
        animations: "disabled",
      });
      await page.getByRole("button", { name: /claro|light/i }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    }
    const search = page.getByLabel("Pesquisar", { exact: true });
    await search.fill("lembretes");
    await page
      .locator('[class*="hitTitle"]')
      .first()
      .waitFor({ timeout: 20000 });
    await page.locator('[class*="hitTitle"]').first().click();
    await page.waitForURL("**/docs/**");
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Começar a leitura" }).click();
    await page
      .getByRole("heading", {
        name: "Clareza para conferir cada prazo",
        exact: true,
      })
      .waitFor();
    await page.reload({ waitUntil: "networkidle" });
    assert(await page.locator("main").isVisible());
    await page.goto(base + "docs/banco/visao-geral/", {
      waitUntil: "networkidle",
    });
    assert.equal(await page.locator("article img").count(), 2);
    assert(
      await page
        .locator("article img")
        .evaluateAll((images) =>
          images.every((i) => i.complete && i.naturalWidth > 0),
        ),
    );
    const pdf = page.getByRole("link", {
      name: "PDF único de 36 páginas",
      exact: true,
    });
    const response = await page.request.get(
      new URL(await pdf.getAttribute("href"), page.url()).href,
    );
    assert.equal(response.status(), 200);
    assert((await response.body()).subarray(0, 5).toString() === "%PDF-");
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "Bank diagram page overflow " + device,
    );
    axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      axe.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      [],
      "Accessibility bank " + device,
    );
    await page.goto(base + "docs/engenharia/arquitetura/", {
      waitUntil: "networkidle",
    });
    await page
      .locator(".docusaurus-mermaid-container svg")
      .waitFor({ timeout: 30000 });
    await page.goto(base + "docs/banco/relatorio-completo/", {
      waitUntil: "networkidle",
    });
    assert(
      (await page.locator("article").innerText()).includes(
        "scheduler_invocations",
      ),
    );
    assert.equal(
      await page
        .locator("article table")
        .filter({ has: page.getByText("request_id", { exact: true }) })
        .count(),
      1,
    );
    assert.deepEqual(errors, [], "Client runtime errors " + device);
    findings.push({
      device,
      home: true,
      localFonts: true,
      navigation: true,
      keyboardSkipLink: true,
      localSearch: true,
      reload: true,
      bankDiagrams: 2,
      pdfDownload: true,
      mermaid: true,
      dictionary: true,
      axeViolations: 0,
    });
    await context.close();
  }
  const result = { base, findings };
  await writeFile(
    path.join(site, ".generated/browser-verification.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (browser) await browser.close();
  server.kill();
}
