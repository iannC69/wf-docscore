import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

console.log("Transforming all remaining Vue components to clean Markdown in content/docs...");

// 1. Convert Privacy.md
const privacyPath = path.join(DOCS_DIR, "about", "privacy.md");
const privacyMarkdown = `---
title: Privacy Policy
description: Politica de confidentialitate pentru utilizatorii platformei Wildfire.ro CS2.
---

# Privacy Policy

*Last updated: March 22, 2026*

---

## 1. Information We Collect
We collect the following types of information:
- **Account Information:** Username, email address, and encrypted passwords.
- **Profile Data:** Steam ID, in-game statistics, rank progression, and playtime.
- **Usage Data:** Server connection activity, login times, and IP addresses for security.
- **Communication Data:** Support tickets, staff applications, and public chat logs.

## 2. How We Use Your Information
Your information is used strictly to:
- Provide, maintain, and protect our gaming servers and web platforms.
- Authenticate your Steam identity and manage your inventory/rank data.
- Process helper and staff applications.
- Enforce server rules, prevent cheating, and maintain community safety.
- Communicate important system updates and announcements.

## 3. Data Storage & Security
We implement industry-standard security measures to protect your data. All sensitive communications utilize HTTPS and secure cryptographic handshakes. Our servers comply with modern data protection regulations and follow strict access control boundaries.

## 4. Data Sharing
We **do not** sell or rent your personal information to third parties. Data is only shared in the following situations:
- With your explicit consent.
- To comply with legitimate legal obligations.
- To protect server security and prevent malicious attacks or exploits.

## 5. Cookies & Local Storage
We use essential local browser storage and session cookies solely to maintain your login session and remember your reading preferences (such as theme and layout modes). We do not use third-party tracking or advertising cookies.

## 6. Contact & Data Deletion Requests
For privacy inquiries, account data deletion, or questions regarding your personal information, contact our administration team on the [Official Discord](https://discord.gg/Knu76DhE9h) or via email at \`contact@wildfire.ro\`.
`;
fs.writeFileSync(privacyPath, privacyMarkdown, "utf-8");
console.log("✓ Converted about/privacy.md to pure Markdown.");

// 2. Convert Terms.md
const termsPath = path.join(DOCS_DIR, "about", "terms.md");
const termsMarkdown = `---
title: Terms of Service
description: Termenii si conditiile de utilizare a serverelor si serviciilor Wildfire.ro.
---

# Terms of Service

*Last updated: March 22, 2026*

---

## 1. Acceptarea Termenilor
Prin accesarea serverelor de joc, a site-ului web sau a comunitatii Wildfire.ro, esti de acord sa respecti acesti Termeni si Conditii, precum si [Regulamentele Oficiale ale Serverelor](/docs/informatii/regulamente/go/regulament-go). Daca nu esti de acord, te rugam sa nu folosesti serviciile noastre.

## 2. Conduita Utilizatorului & Fair Play
- Utilizarea de software tert interzis (coduri, cheat-uri, scripturi de bhop neautorizate) este strict interzisa si rezulta in ban permanent irevocabil.
- Comportamentul toxic, hartuirea, rasismul, discriminarea sau promovarea de continut ilegal pe chat/voice duc la sanctiuni conform regulamentului STAFF.
- Exploatarea bug-urilor sau a vulnerabilitatilor tehnice pentru avantaje necuvenite se pedepseste cu resetarea contului si ban.

## 3. Achizitii, Donatii & Monede Virtuale (Phoenix Coins & VIP)
- Toate donatiile, achizitiile de credite sau ranguri VIP sunt considerate finale si voluntare pentru sustinerea infrastructurii comunitatii.
- Monedele virtuale (Phoenix Coins, Credite) nu au valoare monetara in lumea reala si nu pot fi rascumparate in bani reali.
- Incalcarea regulamentului de joc atrage dupa sine sanctiuni indiferent de rangul VIP sau istoricul de donatii al utilizatorului.

## 4. Disponibilitatea Serviciilor
Echipa Wildfire.ro depune toate eforturile pentru a asigura o disponibilitate continua (99.9% uptime). Totusi, pot aparea intreruperi temporare pentru mentenanta, update-uri de CS2 de la Valve sau optimizari de securitate.

## 5. Contact & Asistenta
Pentru intrebari legate de termeni, deschiderea unui tichet sau solicitari de suport, te asteptam pe serverul nostru de [Discord](https://discord.gg/Knu76DhE9h).
`;
fs.writeFileSync(termsPath, termsMarkdown, "utf-8");
console.log("✓ Converted about/terms.md to pure Markdown.");

// 3. Convert VIP Overview comparison table
const vipOverviewPath = path.join(DOCS_DIR, "market", "vip", "vip-overview.md");
if (fs.existsSync(vipOverviewPath)) {
  let vipContent = fs.readFileSync(vipOverviewPath, "utf-8");
  const vipTableMarkdown = `
| Beneficiu / Facilitate | VIP Night (Gratuit) | VIP Rebirth (3€ / coins) | VIP Immortal (6.5€ / coins) | VIP Mythic (Skill Top) |
| :--- | :---: | :---: | :---: | :---: |
| **Orar Activare** | Doar Noaptea (23:00-08:00) | Permanent 24/7 | Permanent 24/7 | Permanent 24/7 |
| **HP la Spawn** | 100 HP | 105 HP | 110 HP | 115 HP |
| **Bonus HP la Kill** | +5 HP | +8 HP | +12 HP | +15 HP (Max 125) |
| **Bonus HP la Headshot** | +10 HP | +15 HP | +20 HP | +25 HP |
| **Bani Bonus pe Runda** | +$500 | +$800 | +$1,200 | +$1,500 |
| **Tag & Chat Custom** | - | \`[VIP]\` Verde | \`[IMMORTAL]\` Roz | \`[MYTHIC]\` Auriu |
| **Multiplicator Credite** | 1.1x | 1.3x | 1.6x | 2.0x |
| **Slot Rezervat pe Server** | Nu | Da | Da | Da (Prioritate Maxima) |
| **Acces la Custom MVP** | Nu | Nu | Da | Da |
| **Dublu Jump / BHOP** | Nu | Nu | Asistat | Activ |
`;
  vipContent = vipContent.replace(/<VIPComparison\s*\/>/gi, vipTableMarkdown);
  fs.writeFileSync(vipOverviewPath, vipContent, "utf-8");
  console.log("✓ Converted VIPComparison component to clean Markdown table.");
}

// 4. Convert Hub & Changelogs pages
const hubDir = path.join(DOCS_DIR, "hub");
if (fs.existsSync(hubDir)) {
  const hubFiles = fs.readdirSync(hubDir);
  for (const file of hubFiles) {
    if (file.endsWith(".md")) {
      const p = path.join(hubDir, file);
      let content = fs.readFileSync(p, "utf-8");
      content = content.replace(/<UpdatesHub\s*\/>/gi, `
> [!NOTE]
> Pentru jurnalul complet si istoricul lansarilor de versiuni, consulta pagina oficiala de [Changelog & Releases](/changelog).
`);
      fs.writeFileSync(p, content, "utf-8");
      console.log(`✓ Converted hub/${file}`);
    }
  }
}

// 5. Clean all remaining CaseHeader or unknown JSX tags across entire content/docs
function cleanAllRemainingTags(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanAllRemainingTags(full);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      let content = fs.readFileSync(full, "utf-8");
      const original = content;

      // Remove <CaseHeader ... />
      content = content.replace(/<CaseHeader[\s\S]*?\/>/gi, "");
      content = content.replace(/<CaseHeader[\s\S]*?<\/CaseHeader>/gi, "");

      // Remove any remaining capital tag singletons e.g. <SomeComp />
      content = content.replace(/<([A-Z][a-zA-Z0-9]*)[^>]*?\/>/g, (match, tag) => {
        // Keep known MDX components if any (Callout, Steps, Step, Tabs, Tab, Cards, Card)
        const allowed = ["Callout", "Steps", "Step", "Tabs", "Tab", "Cards", "Card"];
        if (allowed.includes(tag)) return match;
        return "";
      });

      content = content.replace(/\n{3,}/g, "\n\n");

      if (content !== original) {
        fs.writeFileSync(full, content, "utf-8");
      }
    }
  }
}

cleanAllRemainingTags(DOCS_DIR);
console.log("✓ All custom VitePress tags cleaned from content/docs.");
