import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

console.log("Cleaning nested headings and broken HTML wrappers in all markdown files...");

function cleanMarkdownFile(filePath) {
  let raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  let text = content;
  const original = text;

  // 1. Fix headings nested inside <div ...> ... ### <span ...>CAP ...</span> ... </div>
  text = text.replace(/<div[^>]*class="[^"]*(?:title-hover|info-title|system-title)[^"]*"[^>]*>[\s\S]*?###\s*<span[^>]*>(?:<svg[\s\S]*?<\/svg>)?(.*?)(?:<\/svg>)?<\/span>\s*<\/div>/gi, (match, headingText) => {
    const cleanHeading = headingText.replace(/<[^>]+>/g, "").trim();
    return `\n## ${cleanHeading}\n`;
  });

  // 2. Fix generic ### inside open div
  text = text.replace(/<div[^>]*>\s*###\s+(.*?)\s*<\/div>/gi, "\n## $1\n");

  // 3. Fix rule-card / info-card into clean markdown cards or blockquotes if broken
  // Check unclosed divs
  const openDivs = (text.match(/<div\b[^>]*>/gi) || []).length;
  const closeDivs = (text.match(/<\/div>/gi) || []).length;

  if (openDivs !== closeDivs) {
    console.log(`  Fixing div mismatch in ${path.basename(filePath)} (open: ${openDivs}, close: ${closeDivs})`);
    // If there's an imbalance, replace custom HTML rule cards with clean markdown items
    text = text.replace(/<div class="(?:wf-info-card|rule-card)[^"]*">[\s\S]*?<div class="(?:wf-info-content|rule-content)">([\s\S]*?)<\/div>\s*<\/div>/gi, (match, body) => {
      const cleanBody = body
        .replace(/<span class="(?:wf-info-number|rule-number)[^"]*">(.*?)<\/span>/gi, "**$1**")
        .replace(/<span class="(?:wf-info-punish|wf-info-badge)[^"]*">(.*?)<\/span>/gi, "`$1`")
        .replace(/<span class="(?:wf-info-highlight|highlight)[^"]*">(.*?)<\/span>/gi, "**$1**")
        .replace(/<[^>]+>/g, "")
        .trim();
      return `\n- ${cleanBody}\n`;
    });

    // Remove any orphan grid wrappers
    text = text.replace(/<div class="(?:wf-info-grid|rules-grid|wf-info-box)[^"]*">/gi, "");
    text = text.replace(/<\/div>/gi, "");
  }

  // Remove any remaining broken svg in headings
  text = text.replace(/^(#{1,6})\s*<span[^>]*>(?:<svg[\s\S]*?<\/svg>)?\s*(.*?)\s*<\/span>$/gm, (m, h, title) => {
    const cleanTitle = title.replace(/<[^>]+>/g, "").trim();
    return `${h} ${cleanTitle}`;
  });

  // Remove empty spans or display:none spans in headings
  text = text.replace(/^#{1,6}\s*<span style="display:none">.*?<\/span>\s*$/gm, "");

  text = text.replace(/\n{3,}/g, "\n\n");

  if (text !== original) {
    const result = matter.stringify(text, data);
    fs.writeFileSync(filePath, result, "utf-8");
    return true;
  }
  return false;
}

let modified = 0;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      if (cleanMarkdownFile(full)) {
        modified++;
        console.log(`✓ Cleaned: ${path.relative(DOCS_DIR, full)}`);
      }
    }
  }
}

walk(DOCS_DIR);
console.log(`Successfully cleaned ${modified} files!`);
