/**
 * build-ai-context.mjs
 * Pre-compiles all documentation markdown files into ai-context.json.
 * Stores docs individually so the API can do relevance filtering.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "content", "docs");
const OUTPUT_FILE = path.join(ROOT, "content", "ai-context.json");

function collectDocs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const docs = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      docs.push(...collectDocs(fullPath));
    } else if (entry.name.endsWith(".md")) {
      const relPath = path.relative(DOCS_DIR, fullPath).replace(/\\/g, "/");
      const raw = fs.readFileSync(fullPath, "utf-8").trim();

      // Extract title from first # heading or filename
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : relPath.replace(/\.md$/, "");

      // Extract plain-text keywords (strip markdown syntax)
      const plainText = raw
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`]+`/g, " ")
        .replace(/#{1,6}\s+/g, " ")
        .replace(/[*_>\[\]()#\-|]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase();

      docs.push({ path: relPath, title, content: raw, plainText });
    }
  }
  return docs;
}

console.log("[ AI Context ] Building docs context...");

const docs = collectDocs(DOCS_DIR);
const totalChars = docs.reduce((sum, d) => sum + d.content.length, 0);

const output = {
  generatedAt: new Date().toISOString(),
  docCount: docs.length,
  totalChars,
  docs,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");

console.log(`[ AI Context ] Done — ${docs.length} docs, ${totalChars.toLocaleString()} chars total`);
console.log(`[ AI Context ] Output: content/ai-context.json`);
