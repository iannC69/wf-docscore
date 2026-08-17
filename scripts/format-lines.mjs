import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

function cleanLines(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  let lines = content.split("\n");
  let newLines = [];

  for (let line of lines) {
    let trimmed = line.trim();
    // If it starts with **X.Y** or number, format as list item if not already
    if (/^\*\*\d+\.\d+\*\*/.test(trimmed)) {
      newLines.push(`- ${trimmed}`);
    } else if (trimmed.length > 0) {
      newLines.push(trimmed);
    } else {
      // blank line
      if (newLines.length > 0 && newLines[newLines.length - 1] !== "") {
        newLines.push("");
      }
    }
  }

  let finalContent = newLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const result = matter.stringify(finalContent, data);
  fs.writeFileSync(filePath, result, "utf-8");
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      cleanLines(full);
    }
  }
}

walk(DOCS_DIR);
console.log("Cleaned lines and standardized list formatting across all files.");
