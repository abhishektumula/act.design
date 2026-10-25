// Reads every registry component and block, highlights it with shiki and writes
// src/registry/sources.json so pages can ship code without runtime file I/O.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { codeToHtml } from "shiki";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(root, "src/registry/sources.json");

type Source = { code: string; html: string };

async function collect(dir: string) {
  const files = (await readdir(join(root, dir))).filter((f) => f.endsWith(".tsx")).sort();
  const out: Record<string, Source> = {};
  for (const file of files) {
    const code = (await readFile(join(root, dir, file), "utf8")).trimEnd();
    const html = await codeToHtml(code, {
      lang: "tsx",
      themes: { light: "github-light", dark: "vesper" },
      defaultColor: "light",
    });
    out[file.replace(/\.tsx$/, "")] = { code, html };
  }
  return out;
}

const components = await collect("src/registry/components");
const blocks = await collect("src/registry/blocks");

await writeFile(outFile, JSON.stringify({ components, blocks }));
console.log(
  `registry: wrote ${Object.keys(components).length} components and ${Object.keys(blocks).length} blocks → src/registry/sources.json`,
);
