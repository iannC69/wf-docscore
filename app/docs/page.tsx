import Link from "next/link";
import {
  Flame,
  Gamepad2,
  Swords,
  Clover,
  ShoppingCart,
  Crown,
  Search,
  ArrowRight,
  Shield,
  Coins,
  Cpu,
  BookOpen,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getRecentlyUpdatedDocs } from "@/lib/git";
import { CURRENT_VERSION } from "@/lib/version";
import { getPlatformSettings } from "@/lib/security/settingsStore";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import { RecentlyUpdatedSection } from "@/components/docs/RecentlyUpdatedSection";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getTotalDocsCount(): number {
  const docsDir = path.join(process.cwd(), "content", "docs");
  let count = 0;
  function countFiles(dir: string, base: string = "") {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) countFiles(path.join(dir, e.name), base ? `${base}/${e.name}` : e.name);
      else if (e.isFile() && (e.name.endsWith(".md") || e.name.endsWith(".mdx"))) {
        // Exclude root index
        if (!(base === "" && (e.name === "index.md" || e.name === "index.mdx"))) {
          count++;
        }
      }
    }
  }
  countFiles(docsDir);
  return count;
}

export default async function DocsHomePage() {
  const settings = getPlatformSettings();
  const session = await getAuthenticatedAdminSession();

  if (settings.maintenance.enabled && !session) {
    redirect("/maintenance");
  }

  const recentDocs = getRecentlyUpdatedDocs();
  const totalDocsCount = getTotalDocsCount();

  return (
    <div className="docs-home-wrapper">
      <main className="docs-home" id="main-content">
        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <section className="docs-home-hero">
          <div className="docs-home-badge">
            <span className="docs-badge-dot" aria-hidden="true" />
            <span>Wildfire Documentation Engine v{CURRENT_VERSION}</span>
          </div>
          <h1 className="docs-home-title">
            Wildfire Documentation Hub
          </h1>
          <p className="docs-home-desc">
            Ghiduri complete, regulamente oficiale, economie in-game, sisteme de joc și informații despre gradele VIP pe serverele CS2 Wildfire.ro.
          </p>

          {/* Quick Search / Command hint */}
          <div className="docs-home-search-hint">
            <div className="search-hint-left">
              <Search size={15} className="search-hint-icon" aria-hidden="true" />
              <span>Apasă <kbd>Ctrl K</kbd> oriunde pentru căutare instantanee în documente</span>
            </div>
            <Link href="/docs/informatii/getting-started" className="docs-hero-btn">
              <span>Ghid de Început</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ── Recently Updated Section (Dynamic Git Sync with Collapse & Counters) ── */}
        <RecentlyUpdatedSection
          recentDocs={recentDocs}
          totalDocsCount={totalDocsCount}
        />

        {/* ── Core Sections Navigation Cards ─────────────────────────────── */}
        <section className="docs-home-section">
          <div className="section-header">
            <h2 className="docs-home-section-title">Secțiuni Principale</h2>
            <span className="section-sub">Explorează documentația oficială a comunității</span>
          </div>

          <div className="home-cards-grid">
            <Link href="/docs/informatii/about" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--orange">
                  <Flame size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Ghiduri</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Informații &amp; Ghiduri</h3>
              <p className="home-card-desc">
                Despre comunitate, verificare cont Steam cu Discord și răspunsuri la întrebări frecvente.
              </p>
            </Link>

            <Link href="/docs/informatii/regulamente/go/regulament-go" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--blue">
                  <Gamepad2 size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Oficial</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Regulamente Server</h3>
              <p className="home-card-desc">
                Regulamentul oficial pentru jucători, ghidul administrativ pentru STAFF și regulile deținătorilor VIP.
              </p>
            </Link>

            <Link href="/docs/systems/skins/informatiiws" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--red">
                  <Swords size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">CS2 !ws</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Weapon Skins (!ws)</h3>
              <p className="home-card-desc">
                Sistemul complet de arme, cuțite, mănuși, agenți și deschidere de cutii interactive.
              </p>
            </Link>

            <Link href="/docs/systems/gambling/roulette" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--purple">
                  <Clover size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Gambling</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Sisteme de Gambling</h3>
              <p className="home-card-desc">
                Jocuri de noroc in-game: Ruletă, Slots (aparate) și Dices (barbut) cu credite și Phoenix Coins.
              </p>
            </Link>

            <Link href="/docs/systems/shop/chat-tags" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--teal">
                  <ShoppingCart size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">In-Game</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">In-Game Shop (!shop)</h3>
              <p className="home-card-desc">
                Personalizări de profil și chat: Chat Tags, culori de nume, fumuri colorate și weapon tracers.
              </p>
            </Link>

            <Link href="/docs/market/vip/vip-overview" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--yellow">
                  <Crown size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">VIP &amp; Shop</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Grade VIP &amp; Market</h3>
              <p className="home-card-desc">
                Tabelul comparativ complet al gradelor VIP (Rebirth, Immortal, Mythic), Custom MVP și Entry Songs.
              </p>
            </Link>
          </div>
        </section>

        {/* ── Architecture Highlights ───────────────────────────────────── */}
        <section className="docs-home-section">
          <div className="section-header">
            <h2 className="docs-home-section-title">Economie &amp; Utilități</h2>
            <span className="section-sub">Sisteme native dezvoltate pentru serverele Wildfire</span>
          </div>

          <div className="home-features-list">
            <div className="feature-item">
              <div className="feature-item-icon">
                <Coins size={16} aria-hidden="true" />
              </div>
              <div className="feature-item-content">
                <h3 className="feature-item-title">Economie Dublă (Credits &amp; Phoenix Coins)</h3>
                <p className="feature-item-desc">
                  Câștigă credite jucând pe server și acumulează Phoenix Coins din evenimente, drop-uri și donații.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">
                <Cpu size={16} aria-hidden="true" />
              </div>
              <div className="feature-item-content">
                <h3 className="feature-item-title">Moduri &amp; Misiuni Dinamice</h3>
                <p className="feature-item-desc">
                  Misiuni zilnice, sistem avansat de rank phases, RTV map chooser și echilibrare automată a echipelor.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">
                <Shield size={16} aria-hidden="true" />
              </div>
              <div className="feature-item-content">
                <h3 className="feature-item-title">Securitate &amp; Atestare Criptografică</h3>
                <p className="feature-item-desc">
                  Toate ghidurile și regulamentele sunt semnate criptografic cu SHA-256 pentru integritate totală.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">
                <BookOpen size={16} aria-hidden="true" />
              </div>
              <div className="feature-item-content">
                <h3 className="feature-item-title">Căutare Globală Rapidă (DeepSearch)</h3>
                <p className="feature-item-desc">
                  Indexare în timp real a tuturor comenzilor, sistemelor și regulamentelor cu tastă rapidă <kbd>Ctrl+K</kbd>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Engine Watermark Footer ── */}
        <footer className="docs-home-footer">
          <div className="docs-footer-inner">
            <div className="docs-footer-brand">
              <span className="docs-footer-logo-dot" aria-hidden="true" />
              <span className="docs-footer-title">WILDFIRE DOCS PLATFORM</span>
              <span className="docs-footer-version">v{CURRENT_VERSION}</span>
            </div>
            <p className="docs-footer-copyright">
              Next.js 16 Turbopack Architecture • Author <a href="https://github.com/iannC69" target="_blank" rel="noopener noreferrer" className="docs-footer-author">@iannC69</a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
