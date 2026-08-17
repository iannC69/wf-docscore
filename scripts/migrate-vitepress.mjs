import fs from "fs";
import path from "path";
import matter from "gray-matter";

const VITEPRESS_DOCS = path.join(process.cwd(), ".vitepress", "docs");
const TARGET_DOCS = path.join(process.cwd(), "content", "docs");
const TARGET_PUBLIC = path.join(process.cwd(), "public");

console.log("Starting Wildfire Docs VitePress migration...");

// 1. Copy public assets from .vitepress/docs/public into /public
const sourcePublic = path.join(VITEPRESS_DOCS, "public");
if (fs.existsSync(sourcePublic)) {
  console.log("Copying public assets from .vitepress/docs/public to public/...");
  
  function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        // Do not overwrite existing root icons if already present
        if (!fs.existsSync(destPath) || entry.name.endsWith(".webp") || entry.name.endsWith(".svg") || entry.name.endsWith(".png") || entry.name.endsWith(".jpg")) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  }

  copyRecursive(sourcePublic, TARGET_PUBLIC);
  console.log("Public assets copied successfully!");
}

// 2. Clean VitePress markdown syntax
function convertVitepressMarkdown(content) {
  let cleaned = content;

  // Convert VitePress custom containers: ::: tip, ::: warning, ::: danger, ::: info, ::: details
  cleaned = cleaned.replace(/:::\s*tip(?:\s+(.+?))?\n([\s\S]*?):::/g, (match, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> [!TIP]\n> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  cleaned = cleaned.replace(/:::\s*warning(?:\s+(.+?))?\n([\s\S]*?):::/g, (match, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> [!WARNING]\n> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  cleaned = cleaned.replace(/:::\s*danger(?:\s+(.+?))?\n([\s\S]*?):::/g, (match, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> [!CAUTION]\n> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  cleaned = cleaned.replace(/:::\s*info(?:\s+(.+?))?\n([\s\S]*?):::/g, (match, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> [!NOTE]\n> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  cleaned = cleaned.replace(/:::\s*details(?:\s+(.+?))?\n([\s\S]*?):::/g, (match, title, body) => {
    const summary = title ? title.trim() : "Details";
    return `<details>\n<summary>${summary}</summary>\n\n${body.trim()}\n\n</details>\n`;
  });

  // Generic ::: container fallback
  cleaned = cleaned.replace(/:::\s*[\w-]*(?:\s+(.+?))?\n([\s\S]*?):::/g, (match, title, body) => {
    const t = title ? `**${title.trim()}**\n\n` : "";
    return `> ${t}${body.trim().replace(/\n/g, "\n> ")}\n`;
  });

  // Strip iconify-icon tags
  cleaned = cleaned.replace(/<iconify-icon[^>]*><\/iconify-icon>/gi, "");
  cleaned = cleaned.replace(/<iconify-icon[^>]*\/>/gi, "");

  // Fix image paths: /public/... -> /...
  cleaned = cleaned.replace(/\]\(\/public\//g, "](/");
  cleaned = cleaned.replace(/src="\/public\//g, 'src="/');

  return cleaned;
}

// 3. Migrate docs folders
const docFolders = ["informatii", "currency", "systems", "market", "about", "hub", "panel", "updates_wiki"];

for (const folder of docFolders) {
  const srcDir = path.join(VITEPRESS_DOCS, folder);
  const destDir = path.join(TARGET_DOCS, folder);

  if (fs.existsSync(srcDir)) {
    console.log(`Migrating folder: ${folder}...`);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    function migrateRecursive(src, dest) {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
          migrateRecursive(srcPath, destPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const raw = fs.readFileSync(srcPath, "utf-8");
          const { data, content } = matter(raw);
          const cleanedContent = convertVitepressMarkdown(content);

          // Ensure valid frontmatter title
          const title = data.title || entry.name.replace(/\.md$/, "").replace(/-/g, " ");
          const updatedData = {
            ...data,
            title,
          };

          const newFileContent = matter.stringify(cleanedContent, updatedData);
          fs.writeFileSync(destPath, newFileContent, "utf-8");
          console.log(`  -> Migrated: ${path.relative(TARGET_DOCS, destPath)}`);
        }
      }
    }

    migrateRecursive(srcDir, destDir);
  }
}

console.log("Migration complete!");
