import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

console.log("Cleaning Vue / VitePress syntax from MDX files in content/docs...");

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1. Remove <DocHeader ... /> tags (single or multi-line)
  content = content.replace(/<DocHeader[\s\S]*?\/>/gi, "");
  content = content.replace(/<DocHeader[\s\S]*?<\/DocHeader>/gi, "");

  // 2. Remove <Icon ... /> tags
  content = content.replace(/<Icon\s+[^>]*?\/>/gi, "");
  content = content.replace(/<Icon\s+[^>]*?>.*?<\/Icon>/gis, "");

  // 3. Remove <iconify-icon ... />
  content = content.replace(/<iconify-icon[^>]*?>.*?<\/iconify-icon>/gis, "");
  content = content.replace(/<iconify-icon[^>]*?\/>/gi, "");

  // 4. Remove any Vue `:attribute="val"` or `@event="val"` or `v-bind` / `v-if` from remaining HTML tags
  content = content.replace(/<([a-zA-Z0-9_-]+)([^>]*?)>/g, (match, tag, attrs) => {
    let cleanedAttrs = attrs
      .replace(/\s+:[a-zA-Z0-9_-]+="[^"]*"/g, "")
      .replace(/\s+:[a-zA-Z0-9_-]+='[^']*'/g, "")
      .replace(/\s+@[a-zA-Z0-9_-]+="[^"]*"/g, "")
      .replace(/\s+v-[a-zA-Z0-9_-]+="[^"]*"/g, "")
      .replace(/\s+v-[a-zA-Z0-9_-]+/g, "");
    return `<${tag}${cleanedAttrs}>`;
  });

  // 5. Remove orphan <style> or <script> tags if any
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // 6. Clean up multiple empty lines
  content = content.replace(/\n{3,}/g, "\n\n");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  }
  return false;
}

let cleanedCount = 0;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      if (cleanFile(full)) {
        cleanedCount++;
        console.log(`  ✓ Cleaned: ${path.relative(DOCS_DIR, full)}`);
      }
    }
  }
}

walk(DOCS_DIR);
console.log(`\nSuccessfully cleaned ${cleanedCount} files!`);
