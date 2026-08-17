import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

function stripCommentsFromFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // Remove HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, "");
  // Clean up excess newlines
  content = content.replace(/\n{3,}/g, "\n\n");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  }
  return false;
}

let count = 0;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      if (stripCommentsFromFile(full)) {
        count++;
      }
    }
  }
}

walk(DOCS_DIR);
console.log(`Stripped HTML comments from ${count} markdown files.`);
