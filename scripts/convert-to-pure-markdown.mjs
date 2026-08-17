import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

console.log("Converting all docs to 100% PURE Semantic Markdown (No legacy HTML/CSS)...");

function htmlToMarkdown(html) {
  let md = html;

  // 1. Remove SVG icons entirely
  md = md.replace(/<svg[\s\S]*?<\/svg>/gi, "");

  // 2. Convert old image tags to markdown images: <img src="url" alt="alt" ...>
  md = md.replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, "\n\n![$2]($1)\n\n");
  md = md.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, "\n\n![]($1)\n\n");

  // 3. Convert links: <a href="url">text</a>
  md = md.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // 4. Convert badges and sanctions: <span class="*badge|punish*">TEXT</span> -> `TEXT`
  md = md.replace(/<span[^>]*class="[^"]*(?:punish|badge|number|tag)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, "**$1**");

  // 5. Convert highlights: <span class="*highlight*">TEXT</span> -> **TEXT**
  md = md.replace(/<span[^>]*class="[^"]*highlight[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, "**$1**");

  // 6. Strip all other spans while keeping their inner text
  md = md.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1");
  // Repeat for nested spans
  md = md.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1");

  // 7. Convert <br> or <br/> to newline
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // 8. Convert horizontal dividers / wf-divider to ---
  md = md.replace(/<div[^>]*class="[^"]*divider[^"]*"[^>]*><\/div>/gi, "\n\n---\n\n");

  // 9. Convert rule cards and info cards to clean markdown bullet points
  md = md.replace(/<div[^>]*class="[^"]*(?:rule-card|wf-info-card|wf-system-card)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, (match, inner) => {
    let clean = inner
      .replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "$1\n")
      .replace(/<p>([\s\S]*?)<\/p>/gi, "$1\n\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    return `\n\n${clean}\n\n`;
  });

  // 10. Strip all remaining <div> and </div> tags
  md = md.replace(/<div\b[^>]*>/gi, "");
  md = md.replace(/<\/div>/gi, "");

  // 11. Convert <ul> and <li> to markdown lists
  md = md.replace(/<ul[^>]*>/gi, "\n");
  md = md.replace(/<\/ul>/gi, "\n");
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (m, item) => {
    const cleanItem = item.replace(/<[^>]+>/g, "").trim();
    return `\n- ${cleanItem}`;
  });

  // 12. Clean headings: ### 1.0 Title
  md = md.replace(/^#{1,6}\s*(?:<[^>]+>)*\s*(.*?)\s*(?:<\/[^>]+>)*$/gm, (m, title) => {
    const clean = title.replace(/<[^>]+>/g, "").trim();
    return clean ? `## ${clean}` : "";
  });

  // 13. Fix duplicate or excess newlines and trailing whitespace
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const cleanBody = htmlToMarkdown(content);

  const result = matter.stringify(cleanBody, data);
  fs.writeFileSync(filePath, result, "utf-8");
}

let count = 0;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      processFile(full);
      count++;
      console.log(`  ✓ Converted to pure MD: ${path.relative(DOCS_DIR, full)}`);
    }
  }
}

walk(DOCS_DIR);
console.log(`\n======================================================`);
console.log(`Successfully converted ${count} files to Pure Markdown!`);
console.log(`======================================================`);
