import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

console.log("Deep cleaning ALL HTML from all markdown files...");

function cleanEntireMarkdown(text) {
  let md = text;

  // 1. Convert <h1..h6 style="...">Heading</h1..h6> to # Heading
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n");

  // 2. Convert <p style="...">Text</p> to Text\n\n
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");

  // 3. Convert <strong>, <b>, <em>, <i>, <code>
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");

  // 4. Clean up video elements to self-closing valid JSX
  md = md.replace(/<video\s+([^>]*?)>[\s\S]*?<\/video>/gi, (match, attrs) => {
    // Extract src
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : "";
    return `\n\n<video src="${src}" controls className="w-full max-w-2xl rounded-xl my-4 shadow-lg border border-white/10" />\n\n`;
  });

  // 5. Clean up any remaining <span ...>text</span>
  md = md.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1");
  md = md.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1");

  // 6. Clean up any remaining <div ...>text</div>
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "$1\n");
  md = md.replace(/<div\b[^>]*>/gi, "");
  md = md.replace(/<\/div>/gi, "");

  // 7. Strip <br> or unclosed void tags
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");

  // 8. Clean entities &lt; &gt; &amp;
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&amp;/g, "&");

  // 9. Standardize multiple blank lines
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const cleanBody = cleanEntireMarkdown(content);

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
    }
  }
}

walk(DOCS_DIR);
console.log(`Deep-cleaned all HTML tags from ${count} markdown files!`);
