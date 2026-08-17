import fs from "fs";
import path from "path";
import matter from "gray-matter";

const VITEPRESS_DIR = path.join(process.cwd(), ".vitepress", "docs");
const TARGET_DOCS = path.join(process.cwd(), "content", "docs");
const TARGET_PUBLIC = path.join(process.cwd(), "public");

console.log("==========================================");
console.log("WILDFIRE CLEAN MIGRATION ENGINE (v1.4.0)");
console.log("==========================================");

// 1. Remove panel directory from content/docs if exists
const panelDir = path.join(TARGET_DOCS, "panel");
if (fs.existsSync(panelDir)) {
  fs.rmSync(panelDir, { recursive: true, force: true });
  console.log("✓ Removed old panel directory.");
}

const updatesWikiDir = path.join(TARGET_DOCS, "updates_wiki");
if (fs.existsSync(updatesWikiDir)) {
  fs.rmSync(updatesWikiDir, { recursive: true, force: true });
}

// 2. Copy all public assets (images, icons, sound files, etc.)
const sourcePublic = path.join(VITEPRESS_DIR, "public");
if (fs.existsSync(sourcePublic)) {
  console.log("Syncing media assets from .vitepress/docs/public to public/...");
  
  function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        // Copy files
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyRecursive(sourcePublic, TARGET_PUBLIC);
  console.log("✓ All media assets synchronized!");
}

// 3. Clean Markdown Transformer
function sanitizeMarkdown(rawContent, filename) {
  let text = rawContent;

  // Transform VitePress callout containers
  text = text.replace(/:::\s*tip(?:\s+(.+?))?\n([\s\S]*?):::/g, (_, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> [!TIP]\n> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  text = text.replace(/:::\s*warning(?:\s+(.+?))?\n([\s\S]*?):::/g, (_, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> [!WARNING]\n> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  text = text.replace(/:::\s*danger(?:\s+(.+?))?\n([\s\S]*?):::/g, (_, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> [!CAUTION]\n> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  text = text.replace(/:::\s*info(?:\s+(.+?))?\n([\s\S]*?):::/g, (_, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> [!NOTE]\n> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  text = text.replace(/:::\s*details(?:\s+(.+?))?\n([\s\S]*?):::/g, (_, title, body) => {
    const summary = title ? title.trim() : "Detalii";
    return `<details>\n<summary>${summary}</summary>\n\n${body.trim()}\n\n</details>\n`;
  });

  text = text.replace(/:::\s*[\w-]*(?:\s+(.+?))?\n([\s\S]*?):::/g, (_, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  // Strip Vue template custom elements
  text = text.replace(/<iconify-icon[^>]*>.*?<\/iconify-icon>/gis, "");
  text = text.replace(/<iconify-icon[^>]*\/>/gi, "");
  text = text.replace(/<Badge\s+text="([^"]+)"[^>]*\/>/gi, "`$1`");
  text = text.replace(/<Badge\s+type="[^"]*"\s+text="([^"]+)"[^>]*\/>/gi, "`$1`");

  // Fix image paths
  text = text.replace(/\]\(\/public\//g, "](/");
  text = text.replace(/src="\/public\//g, 'src="/');
  text = text.replace(/src='\/public\//g, "src='/");

  return text;
}

// 4. Map and migrate categories (Excluding panel, templates, etc.)
const CATEGORIES = ["informatii", "currency", "systems", "market", "about", "hub"];

let count = 0;

for (const cat of CATEGORIES) {
  const srcCategoryPath = path.join(VITEPRESS_DIR, cat);
  const destCategoryPath = path.join(TARGET_DOCS, cat);

  if (!fs.existsSync(srcCategoryPath)) continue;
  if (!fs.existsSync(destCategoryPath)) fs.mkdirSync(destCategoryPath, { recursive: true });

  function processCategory(srcDir, destDir) {
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
        processCategory(srcPath, destPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const raw = fs.readFileSync(srcPath, "utf-8");
        const { data, content } = matter(raw);

        // Derive clean title from frontmatter or first H1 or filename
        let title = data.title;
        if (!title) {
          const h1Match = content.match(/^#\s+(.+)$/m);
          if (h1Match) {
            title = h1Match[1].replace(/<[^>]+>/g, "").trim();
          } else {
            title = entry.name.replace(/\.md$/, "").replace(/-/g, " ");
            title = title.charAt(0).toUpperCase() + title.slice(1);
          }
        }

        const cleanedBody = sanitizeMarkdown(content, entry.name);

        const updatedData = {
          ...data,
          title: title.replace(/<[^>]+>/g, "").trim(),
          description: data.description || "",
        };

        const result = matter.stringify(cleanedBody, updatedData);
        fs.writeFileSync(destPath, result, "utf-8");
        count++;
        console.log(`  ✓ ${path.relative(TARGET_DOCS, destPath)}`);
      }
    }
  }

  console.log(`\nImporting category: [${cat}]...`);
  processCategory(srcCategoryPath, destCategoryPath);
}

console.log(`\n==========================================`);
console.log(`SUCCESSFULLY IMPORTED ${count} CLEAN MARKDOWN DOCS!`);
console.log(`==========================================`);
