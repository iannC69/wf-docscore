import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_PATH = path.join(process.cwd(), "content", "docs");

const FOLDER_META = {
  "informatii": {
    title: "Informații Generale",
    description: "Ghiduri generale, intrebari frecvente, patch notes si regulamente oficiale ale comunitatii Wildfire.ro.",
  },
  "informatii/regulamente": {
    title: "Regulamente Oficiale",
    description: "Toate regulamentele oficiale pentru serverele de Counter-Strike 2 si comunitatea Wildfire.ro.",
  },
  "informatii/regulamente/go": {
    title: "Regulament GO CS2",
    description: "Regulamentul oficial al serverului CS2 Wildfire GO (Jucatori, Staff si VIP).",
  },
  "informatii/staff": {
    title: "Sectiunea STAFF",
    description: "Informatii pentru echipa administrativa, lista de comenzi staff, cerinte de aplicare si motive oficiale de sanctiune.",
  },
  "currency": {
    title: "Sistemul de Currency",
    description: "Economia serverului: Phoenix Coins si Credite in-game.",
  },
  "systems": {
    title: "Sisteme de Joc CS2",
    description: "Ghidul complet al tuturor sistemelor custom dezvoltate pentru Wildfire.ro: skins, gambling, shop si utilitati.",
  },
  "systems/gambling": {
    title: "Sisteme de Gambling",
    description: "Jocuri de noroc in-game: Roulette, Slots (aparate) si Dices (barbut).",
  },
  "systems/other": {
    title: "Alte Sisteme & Utilitati",
    description: "Sisteme auxiliare: MVP Anthem, Hit Effect, C4 Planter, Misiuni, Rankuri, Map Chooser si multe altele.",
  },
  "systems/shop": {
    title: "In-Game Shop (!shop)",
    description: "Personalizari de profil si chat: Chat Colors, Chat Tags, Tag Colors si Name Colors.",
  },
  "systems/skins": {
    title: "Weapon Skins (!ws)",
    description: "Sistemul avansat de skin-uri, cutite, manusi, agenti si deschidere de cutii in CS2.",
  },
  "market": {
    title: "Market & Donatii",
    description: "Magazinul premium si rangurile VIP disponibile pentru sustinerea comunitatii Wildfire.ro.",
  },
  "market/premium-shop": {
    title: "Premium Shop",
    description: "Pachete premium exclusive: Custom MVP, Entry Songs, Sunete Sank si Sloturi rezervate.",
  },
  "market/vip": {
    title: "Grade VIP & Beneficii",
    description: "Comparatia completa a gradelor VIP si avantajele fiecarui nivel: Rebirth, Immortal, Mythic, VIP Night si VIP Test.",
  },
  "about": {
    title: "Despre & Politici",
    description: "Politica de confidentialitate (Privacy Policy) si Termenii de utilizare (Terms of Service) pentru Wildfire.ro.",
  },
  "hub": {
    title: "Hub & Resurse",
    description: "Centrul de actualizari, versiuni, resurse si ghiduri de dezvoltare pentru comunitate.",
  },
  "updates_wiki": {
    title: "Actualizari Wiki",
    description: "Ghiduri de contributie si noutati despre documentatia comunitatii Wildfire.",
  },
};

console.log("Generating missing index.md files for all folders...");

function ensureFolderIndex(dirPath, relPath = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const subDirs = [];
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      subDirs.push(entry.name);
      ensureFolderIndex(path.join(dirPath, entry.name), path.join(relPath, entry.name).replace(/\\/g, "/"));
    } else if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
      files.push(entry.name.replace(/\.md$/, ""));
    }
  }

  if (!relPath) return; // root handled by root index.md

  const indexPath = path.join(dirPath, "index.md");
  if (!fs.existsSync(indexPath)) {
    const meta = FOLDER_META[relPath] || {
      title: relPath.split("/").pop().replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      description: `Ghiduri si informatii despre ${relPath.split("/").pop()}.`,
    };

    let body = `# ${meta.title}\n\n${meta.description}\n\n---\n\n## Articole si Sectiuni\n\n`;

    // Add subfiles
    for (const f of files) {
      const filePath = path.join(dirPath, `${f}.md`);
      let title = f.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(raw);
        if (data.title) title = data.title;
      } catch {}
      body += `- [${title}](/docs/${relPath}/${f})\n`;
    }

    // Add subdirs
    for (const d of subDirs) {
      const subRel = `${relPath}/${d}`;
      const subMeta = FOLDER_META[subRel] || {
        title: d.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      };
      body += `- [${subMeta.title}](/docs/${subRel}) →\n`;
    }

    const frontmatterData = {
      title: meta.title,
      description: meta.description,
    };

    const result = matter.stringify(body.trim(), frontmatterData);
    fs.writeFileSync(indexPath, result, "utf-8");
    console.log(`✓ Created index.md for: /docs/${relPath}`);
  }
}

ensureFolderIndex(DOCS_PATH);
console.log("All folder indexes generated!");
