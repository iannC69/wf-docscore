import fs from "fs";
import path from "path";

const VITEPRESS_DOCS = path.join(process.cwd(), ".vitepress", "docs");
const TARGET_DOCS = path.join(process.cwd(), "content", "docs");
const PUBLIC_DIR = path.join(process.cwd(), "public");

console.log("==================================================");
console.log("AUDITING ALL VITEPRESS DOCS VS NEW WILDFIRE DOCS");
console.log("==================================================");

const ignoredDirs = [".vitepress", "panel", "node_modules"];

// 1. Collect all original markdown files
const originalFiles = [];
function collectOriginal(dir, rel = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.includes(entry.name)) {
        collectOriginal(path.join(dir, entry.name), path.join(rel, entry.name));
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      originalFiles.push(path.join(rel, entry.name));
    }
  }
}

collectOriginal(VITEPRESS_DOCS);
console.log(`Found ${originalFiles.length} original documentation files in VitePress (excluding panel & .vitepress).`);

// 2. Check each original file in content/docs
let missingFiles = [];
let presentFiles = [];

for (const file of originalFiles) {
  const targetPath = path.join(TARGET_DOCS, file);
  if (fs.existsSync(targetPath)) {
    presentFiles.push(file);
  } else {
    missingFiles.push(file);
  }
}

console.log(`\nStatus:`);
console.log(`✓ Successfully migrated & present: ${presentFiles.length} files`);
if (missingFiles.length > 0) {
  console.log(`⚠️ Missing files (${missingFiles.length}):`);
  missingFiles.forEach(f => console.log(`  - ${f}`));
} else {
  console.log(`🎉 100% of all files are present in content/docs!`);
}

// 3. Audit all image references in all markdown files
console.log("\nAuditing image and media references in content/docs...");
let totalImages = 0;
let missingImages = [];

function checkImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkImages(full);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      const content = fs.readFileSync(full, "utf-8");
      // Find ![*](src)
      const matches = content.matchAll(/!\[.*?\]\((.*?)\)/g);
      for (const match of matches) {
        let src = match[1].split(" ")[0].trim();
        if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) continue;
        totalImages++;
        // Remove leading /
        const cleanSrc = src.replace(/^\//, "");
        const localPath = path.join(PUBLIC_DIR, cleanSrc);
        if (!fs.existsSync(localPath)) {
          missingImages.push({ file: path.relative(TARGET_DOCS, full), src });
        }
      }
    }
  }
}

checkImages(TARGET_DOCS);
console.log(`Audited ${totalImages} image/media references across all files.`);
if (missingImages.length > 0) {
  console.log(`⚠️ Found ${missingImages.length} missing image references:`);
  missingImages.forEach(m => console.log(`  - In [${m.file}]: ${m.src}`));
} else {
  console.log(`🎉 100% of all image and media references exist in /public!`);
}

console.log("==================================================");
