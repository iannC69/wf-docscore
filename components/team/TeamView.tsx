"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  Eye,
  Check,
  Sparkles,
  Cpu,
  Layers,
  FileText,
  Lock,
  Flame,
  ArrowRight,
  Shield,
  Clock,
  CheckCheck,
  UserCheck,
  User,
  GitCommit,
  ExternalLink,
  ChevronDown,
  EyeOff,
} from "lucide-react";
import type { PublicTeamMember } from "@/lib/security/teamStore";
import { CURRENT_VERSION } from "@/lib/version";

interface TeamViewProps {
  initialMembers: PublicTeamMember[];
}

function SteamIcon({ size = 11, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-10 9.87l5.65 2.33a3.54 3.54 0 0 1 1.95-.58l2.9-4.2a3.7 3.7 0 0 1 7.23-1.22 3.7 3.7 0 0 1-5.18 5.18l-4.2 2.9a3.54 3.54 0 0 1-.58 1.95L4.44 20.9A10 10 0 1 0 12 2zm3.73 6.27a2.22 2.22 0 1 0 2.22 2.22 2.22 2.22 0 0 0-2.22-2.22zm-7.6 9.47a2.08 2.08 0 1 0 2.08 2.08 2.08 2.08 0 0 0-2.08-2.08z" />
    </svg>
  );
}

function DiscordIcon({ size = 11, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GithubIcon({ size = 11, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function getSteamProfileUrl(steamId?: string): string | null {
  if (!steamId) return null;
  const clean = steamId.trim();
  if (!clean) return null;
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  if (/^7656119\d{10}$/.test(clean)) {
    return `https://steamcommunity.com/profiles/${clean}`;
  }
  return `https://steamcommunity.com/id/${clean}`;
}

function getDiscordDefaultAvatar(userId?: string): string {
  if (!userId) return "https://cdn.discordapp.com/embed/avatars/0.png";
  try {
    const bigId = BigInt(userId.trim());
    const idx = Number((bigId >> BigInt(22)) % BigInt(6));
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
}

function getRoleMeta(role: string, isRoot: boolean) {
  if (isRoot || role === "root_admin") {
    return {
      label: "Root Super Admin",
      categoryName: "Root Admin",
      iconBoxClass: "recent-card-item-icon--orange",
      icon: <ShieldCheck size={13} className="text-amber-400" />,
      accentColor: "#ff7700",
    };
  }
  switch (role) {
    case "doc_lead":
      return {
        label: "Co-Lead & Systems",
        categoryName: "Co-Lead & Systems",
        iconBoxClass: "recent-card-item-icon--orange",
        icon: <Award size={13} className="text-amber-400" />,
        accentColor: "#f59e0b",
      };
    case "content_editor":
      return {
        label: "Content Editor",
        categoryName: "Content Editor",
        iconBoxClass: "recent-card-item-icon--green",
        icon: <BookOpen size={13} className="text-emerald-400" />,
        accentColor: "#10b981",
      };
    case "custom":
      return {
        label: "Content Lead & Reviewer",
        categoryName: "Content Lead",
        iconBoxClass: "recent-card-item-icon--green",
        icon: <Sparkles size={13} className="text-emerald-400" />,
        accentColor: "#10b981",
      };
    case "moderator":
      return {
        label: "Reviewer & Mod",
        categoryName: "Reviewer",
        iconBoxClass: "recent-card-item-icon--purple",
        icon: <CheckCircle2 size={13} className="text-purple-400" />,
        accentColor: "#a855f7",
      };
    case "viewer":
    default:
      return {
        label: "Auditor Docs",
        categoryName: "Auditor",
        iconBoxClass: "recent-card-item-icon--teal",
        icon: <Eye size={13} className="text-blue-400" />,
        accentColor: "#3b82f6",
      };
  }
}

function getResponsibilityIcon(tag: string) {
  const lower = tag.toLowerCase();
  if (lower.includes("arhitectur") || lower.includes("core") || lower.includes("engine") || lower.includes("sistem")) {
    return <Cpu size={11} className="text-amber-400" />;
  }
  if (lower.includes("securitat") || lower.includes("2fa") || lower.includes("auth")) {
    return <Lock size={11} className="text-blue-400" />;
  }
  if (lower.includes("ghid") || lower.includes("jucator") || lower.includes("continut") || lower.includes("redactare")) {
    return <BookOpen size={11} className="text-emerald-400" />;
  }
  if (lower.includes("media") || lower.includes("asset") || lower.includes("vault")) {
    return <Layers size={11} className="text-cyan-400" />;
  }
  if (lower.includes("verific") || lower.includes("acuratete") || lower.includes("audit") || lower.includes("optimizare")) {
    return <CheckCheck size={11} className="text-purple-400" />;
  }
  return <FileText size={11} className="text-zinc-400" />;
}

interface DiscordProfileInfo {
  avatarUrl: string;
  username?: string;
  globalName?: string;
}

export function TeamView({ initialMembers }: TeamViewProps) {
  const [filter, setFilter] = useState<"all" | "root" | "editors">("all");
  const [copiedDiscordId, setCopiedDiscordId] = useState<string | null>(null);
  const [steamAvatars, setSteamAvatars] = useState<Record<string, string>>({});
  const [discordProfiles, setDiscordProfiles] = useState<Record<string, DiscordProfileInfo>>({});
  const [repoStats, setRepoStats] = useState<Record<string, { totalCommits: number; docsCommits: number }>>({});
  const [collapseDescriptions, setCollapseDescriptions] = useState<boolean>(true);
  const [cardCollapseOverrides, setCardCollapseOverrides] = useState<Record<string, boolean>>({});

  const handleGlobalCollapseToggle = () => {
    const nextVal = !collapseDescriptions;
    setCollapseDescriptions(nextVal);
    setCardCollapseOverrides({});
  };

  const toggleCardCollapse = (memberId: string) => {
    setCardCollapseOverrides((prev) => {
      const currentVal = prev[memberId] !== undefined ? prev[memberId] : collapseDescriptions;
      return { ...prev, [memberId]: !currentVal };
    });
  };

  // Auto-fetch Real Repository Contributions and Steam & Discord avatars
  useEffect(() => {
    fetch("/api/team/contributors")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.contributors && Array.isArray(data.contributors)) {
          const map: Record<string, { totalCommits: number; docsCommits: number }> = {};
          for (const c of data.contributors) {
            map[c.username.toLowerCase()] = {
              totalCommits: c.stats?.totalCommits || 0,
              docsCommits: c.stats?.docsCommits || 0,
            };
          }
          setRepoStats(map);
        }
      })
      .catch(() => {});

    initialMembers.forEach((member) => {
      // Steam avatar fetch
      if (member.steamId && !steamAvatars[member.id]) {
        fetch(`/api/steam/avatar?id=${encodeURIComponent(member.steamId)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.avatarUrl) {
              setSteamAvatars((prev) => ({ ...prev, [member.id]: data.avatarUrl }));
            }
          })
          .catch(() => {});
      }

      // Discord avatar & profile info fetch
      if (member.discord && !discordProfiles[member.id]) {
        fetch(`/api/discord/avatar?id=${encodeURIComponent(member.discord)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.avatarUrl) {
              setDiscordProfiles((prev) => ({
                ...prev,
                [member.id]: {
                  avatarUrl: data.avatarUrl,
                  username: data.username,
                  globalName: data.globalName || data.global_name,
                },
              }));
            }
          })
          .catch(() => {});
      }
    });
  }, [initialMembers]);

  const handleCopyDiscord = (e: React.MouseEvent, copyText: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopiedDiscordId(id);
    setTimeout(() => {
      setCopiedDiscordId(null);
    }, 2000);
  };

  const rootCount = initialMembers.filter((m) => m.isRoot || m.role === "root_admin" || m.role === "doc_lead").length;
  const editorCount = initialMembers.filter((m) => m.role === "content_editor" || m.role === "custom" || m.role === "moderator" || m.role === "viewer").length;

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((m) => {
      if (filter === "root" && !m.isRoot && m.role !== "root_admin" && m.role !== "doc_lead") return false;
      if (filter === "editors" && m.role !== "content_editor" && m.role !== "custom" && m.role !== "moderator" && m.role !== "viewer") return false;
      return true;
    });
  }, [initialMembers, filter]);

  return (
    <div className="docs-home-wrapper">
      <main className="docs-home" id="main-content">
        {/* ── Hero Section (Compact & Seamless) ─────────── */}
        <section className="docs-home-hero" style={{ marginBottom: "var(--space-6)", paddingBottom: "var(--space-6)" }}>
          <div className="docs-home-badge">
            <span className="docs-badge-dot" aria-hidden="true" />
            <span>Wildfire Documentation Workforce v{CURRENT_VERSION}</span>
          </div>

          <h1 className="docs-home-title">
            Wildfire Core Team &amp; Contributors
          </h1>

          <p className="docs-home-desc" style={{ marginBottom: 0 }}>
            Echipa oficială, arhitecții de sisteme și contribuitorii care redactează, revizuiesc și mențin documentația pe serverele CS2 Wildfire.ro.
          </p>
        </section>

        {/* ── Main Section: Team Members Grid ────────────────────────── */}
        <section className="docs-home-section">
          <div className="section-header section-header--flex">
            <div className="section-header-left-col">
              <div className="section-title-badge-row">
                <h2 className="docs-home-section-title">Echipa Noastră</h2>

                {/* Live Pulse Badge */}
                <span className="live-pulse-badge">
                  <span className="pulse-dot" aria-hidden="true" />
                  <span>Live Team Sync</span>
                </span>

                {/* Count Pill */}
                <span className="recent-count-pill" title="Membri activi înregistrați în echipă">
                  <Sparkles size={12} className="text-amber-400" aria-hidden="true" />
                  <span><strong>{initialMembers.length}</strong> membri activi</span>
                  <span className="count-pill-divider">/</span>
                  <span><strong>{rootCount}</strong> lead &amp; root</span>
                </span>
              </div>

              <span className="section-sub">
                Toți membrii verificați cu acces de editare în documentație • Contactează-i pe Discord sau Steam
              </span>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="section-header-actions">
              <div className="recent-page-pills">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`recent-collapse-toggle-btn ${filter === "all" ? "admin-filter-pill--active" : ""}`}
                  style={{ fontSize: "0.72rem", padding: "4px 10px" }}
                >
                  Toți ({initialMembers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("root")}
                  className={`recent-collapse-toggle-btn ${filter === "root" ? "admin-filter-pill--active" : ""}`}
                  style={{ fontSize: "0.72rem", padding: "4px 10px" }}
                >
                  Root &amp; Lead ({rootCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("editors")}
                  className={`recent-collapse-toggle-btn ${filter === "editors" ? "admin-filter-pill--active" : ""}`}
                  style={{ fontSize: "0.72rem", padding: "4px 10px" }}
                >
                  Editori ({editorCount})
                </button>
                <button
                  type="button"
                  onClick={handleGlobalCollapseToggle}
                  className={`recent-collapse-toggle-btn ${collapseDescriptions ? "admin-filter-pill--active" : ""}`}
                  style={{
                    fontSize: "0.72rem",
                    padding: "4px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    borderColor: collapseDescriptions ? "hsl(38 96% 50% / 0.4)" : undefined,
                    color: collapseDescriptions ? "#fbbf24" : undefined,
                  }}
                  title={collapseDescriptions ? "Afișează tag-urile de atribuții pentru toți membrii" : "Ascunde tag-urile de atribuții pentru toți membrii"}
                >
                  {collapseDescriptions ? (
                    <Eye size={11} className="text-amber-400" aria-hidden="true" />
                  ) : (
                    <EyeOff size={11} aria-hidden="true" />
                  )}
                  <span>{collapseDescriptions ? "Extinde Atribuții" : "Ascunde Atribuții"}</span>
                </button>
                <a
                  href="https://github.com/iannC69/wf-docscore/graphs/contributors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="recent-collapse-toggle-btn"
                  style={{
                    fontSize: "0.72rem",
                    padding: "4px 10px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "hsl(220 14% 18% / 0.7)",
                    borderColor: "hsl(220 14% 35% / 0.6)",
                  }}
                  title="Deschide GitHub Contributors Graph"
                >
                  <GithubIcon size={11} />
                  <span>GitHub Graph</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>
              </div>
            </div>
          </div>

          {/* Cards Grid (100% Faithful to Documentation Hub Theme) */}
          <div className="recent-updates-grid">
            {filteredMembers.map((member) => {
              const roleMeta = getRoleMeta(member.role, member.isRoot);
              const isCopied = copiedDiscordId === member.id;
              const steamUrl = getSteamProfileUrl(member.steamId);

              // Auto-derive Discord avatar & profile handle if numeric UserID provided
              const isDiscordUserId = Boolean(member.discord && /^\d{17,20}$/.test(member.discord.trim()));
              const discordProfile = discordProfiles[member.id];
              const discordPfp =
                discordProfile?.avatarUrl ||
                (isDiscordUserId ? `https://dcdn.dstn.to/avatars/${member.discord!.trim()}` : null) ||
                (isDiscordUserId ? getDiscordDefaultAvatar(member.discord) : null);
              const steamPfp = steamAvatars[member.id] || null;

              // Primary Profile Picture: user defined avatarUrl > steamPfp > discordPfp
              const displayAvatarUrl = member.avatarUrl || steamPfp || discordPfp || (isDiscordUserId ? getDiscordDefaultAvatar(member.discord) : null);

              const discordCopyText = discordProfile?.username
                ? discordProfile.username
                : (member.discord?.startsWith("@") ? member.discord.slice(1) : member.discord || "");

              const isCardCollapsed = cardCollapseOverrides[member.id] !== undefined ? cardCollapseOverrides[member.id] : collapseDescriptions;

              // ── FULL EXPANDED CARD VIEW ─────────────────────────────────
              return (
                <div
                  key={member.id}
                  className="recent-update-card"
                  style={{
                    cursor: "default",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignSelf: "stretch",
                    padding: "18px 20px",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div>
                    {/* Top Bar: Role Category Pill + Stats */}
                    <div className="recent-card-top">
                      <span className="recent-card-category">
                        <span className="recent-card-cat-icon">
                          {roleMeta.icon}
                        </span>
                        <span>{roleMeta.categoryName}</span>
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {repoStats[member.username.toLowerCase()]?.totalCommits ? (
                          <span className="recent-card-time" title="Commit-uri reale în repository">
                            <GitCommit size={11} className="text-cyan-400" aria-hidden="true" />
                            <span><strong>{repoStats[member.username.toLowerCase()].totalCommits}</strong> commit-uri</span>
                          </span>
                        ) : (
                          <span className="recent-card-time" title="Ghiduri modificate în repository">
                            <FileText size={11} className="text-zinc-500" aria-hidden="true" />
                            <span><strong>{repoStats[member.username.toLowerCase()]?.docsCommits ?? 0}</strong> ghiduri</span>
                          </span>
                        )}

                        <span className="recent-card-time">
                          <Clock size={11} aria-hidden="true" />
                          <span>
                            {new Date(member.createdAt).toLocaleDateString("ro-RO", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Title Row with Avatar + Name & Custom Role + Verified Badge + Collapse Toggle */}
                    <div className="recent-card-title-row" style={{ alignItems: "center", marginBottom: "12px" }}>
                      <div className="recent-card-title-wrap" style={{ gap: "10px", alignItems: "center" }}>
                        {/* Avatar Frame (Proportional 46x46) */}
                        <div
                          style={{
                            position: "relative",
                            width: "46px",
                            height: "46px",
                            borderRadius: "11px",
                            border: `1.5px solid ${roleMeta.accentColor}55`,
                            background: "hsl(0 0% 12% / 0.8)",
                            boxShadow: `0 4px 14px ${roleMeta.accentColor}25`,
                            overflow: "hidden",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {displayAvatarUrl ? (
                            <img
                              src={displayAvatarUrl}
                              alt={member.displayName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                background: `linear-gradient(135deg, ${roleMeta.accentColor}50, ${roleMeta.accentColor}15)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "1rem",
                                color: "#ffffff",
                                textTransform: "uppercase",
                              }}
                            >
                              {member.displayName.slice(0, 2)}
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                          <h3 className="recent-card-title" style={{ fontSize: "1rem", lineHeight: 1.25, fontWeight: 800 }}>
                            {member.displayName}
                          </h3>
                          {member.customTitle && (
                            <span style={{ fontSize: "0.74rem", color: roleMeta.accentColor, fontWeight: 600, marginTop: "2px" }}>
                              {member.customTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {/* Verified Icon Pill */}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: "hsl(142 70% 45% / 0.12)",
                            border: "1px solid hsl(142 70% 45% / 0.3)",
                            color: "#34d399",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                          title="Membru Verificat Oficial"
                        >
                          <UserCheck size={12} className="text-emerald-400" aria-hidden="true" />
                          <span>Verificat</span>
                        </span>

                        {/* Individual Card Collapse / Expand Tags Button */}
                        {member.responsibilities && member.responsibilities.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCardCollapse(member.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "24px",
                              height: "24px",
                              borderRadius: "6px",
                              background: isCardCollapsed ? "hsl(38 96% 50% / 0.14)" : "hsl(0 0% 100% / 0.05)",
                              border: isCardCollapsed ? "1px solid hsl(38 96% 50% / 0.4)" : "1px solid var(--glass-border)",
                              color: isCardCollapsed ? "#fbbf24" : "var(--color-text-secondary)",
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                              padding: 0,
                              flexShrink: 0,
                            }}
                            title={isCardCollapsed ? "Afișează tag-urile de atribuții" : "Ascunde tag-urile de atribuții"}
                            aria-label={isCardCollapsed ? "Afișează atribuții" : "Ascunde atribuții"}
                          >
                            <ChevronDown
                              size={13}
                              style={{
                                transform: isCardCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                                transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bio Description — ALWAYS SHOWN */}
                    <p
                      className="recent-card-desc"
                      style={{
                        WebkitLineClamp: 3,
                        marginBottom: isCardCollapsed ? "0px" : "12px",
                        fontSize: "0.82rem",
                        lineHeight: 1.55,
                        minHeight: isCardCollapsed ? "38px" : "48px",
                        transition: "margin-bottom 0.2s ease",
                      }}
                    >
                      {member.bio || "Membru activ în echipa de redactare și mentenanță a documentației WildFire."}
                    </p>

                    {/* Collapsible Responsibilities Tags Section */}
                    {member.responsibilities && member.responsibilities.length > 0 && (
                      <div
                        style={{
                          maxHeight: isCardCollapsed ? "0px" : "180px",
                          opacity: isCardCollapsed ? 0 : 1,
                          overflow: "hidden",
                          transition: "max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, margin 0.2s ease",
                          marginTop: isCardCollapsed ? "0px" : "2px",
                          marginBottom: isCardCollapsed ? "0px" : "2px",
                        }}
                      >
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", paddingTop: "2px" }}>
                          {member.responsibilities.slice(0, 5).map((resp, idx) => (
                            <span
                              key={idx}
                              className="team-card-resp-tag"
                            >
                              {getResponsibilityIcon(resp)}
                              <span>{resp}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer: Clean @handle + Steam & Discord Action Buttons */}
                  <div
                    className="team-card-bottom-bar"
                  >
                    <div className="team-handle-pill">
                      <span className="team-handle-pill-text">
                        <span className="team-handle-at" style={{ color: roleMeta.accentColor }}>@</span>
                        <span className="team-handle-username">{member.username}</span>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* View Profile Button */}
                      <Link
                        href={`/docs/team/${encodeURIComponent(member.username)}`}
                        className="team-card-profile-action-btn"
                        style={{
                          background: `${roleMeta.accentColor}14`,
                          borderColor: `${roleMeta.accentColor}40`,
                          color: roleMeta.accentColor,
                        }}
                        title={`Profil complet — ${member.displayName}`}
                      >
                        <User size={11} />
                        <span>Profil</span>
                      </Link>

                      {/* Steam Full-Bleed Button (34x34px with Branded Blue Glow) */}
                      {steamUrl && (
                        <a
                          href={steamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            position: "relative",
                            width: "34px",
                            height: "34px",
                            borderRadius: "9px",
                            border: "1.5px solid hsl(215 85% 58% / 0.5)",
                            background: "hsl(215 45% 16% / 0.8)",
                            boxShadow: "0 3px 10px hsl(215 85% 45% / 0.25)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          title={`Profil Steam — ${member.displayName}`}
                        >
                          {steamPfp ? (
                            <img
                              src={steamPfp}
                              alt="Steam"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <SteamIcon size={16} className="text-blue-400" />
                          )}
                        </a>
                      )}

                      {/* Discord Full-Bleed Button (34x34px with Branded Blurple Glow) */}
                      {member.discord && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyDiscord(e, discordCopyText, member.id)}
                          style={{
                            position: "relative",
                            width: "34px",
                            height: "34px",
                            borderRadius: "9px",
                            border: isCopied ? "1.5px solid hsl(142 75% 50% / 0.9)" : "1.5px solid hsl(235 85% 68% / 0.5)",
                            background: isCopied ? "hsl(142 70% 22% / 0.6)" : "hsl(235 45% 18% / 0.8)",
                            boxShadow: isCopied ? "0 3px 12px hsl(142 70% 40% / 0.4)" : "0 3px 10px hsl(235 80% 60% / 0.25)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          title={isCopied ? `Copiat @${discordCopyText}!` : `Copiază Discord: @${discordCopyText}`}
                          onMouseEnter={(e) => {
                            if (!isCopied) {
                              e.currentTarget.style.transform = "translateY(-2px) scale(1.06)";
                              e.currentTarget.style.borderColor = "hsl(235 100% 80% / 0.95)";
                              e.currentTarget.style.boxShadow = "0 6px 16px hsl(235 80% 60% / 0.45)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCopied) {
                              e.currentTarget.style.transform = "translateY(0) scale(1)";
                              e.currentTarget.style.borderColor = "hsl(235 85% 68% / 0.5)";
                              e.currentTarget.style.boxShadow = "0 3px 10px hsl(235 80% 60% / 0.25)";
                            }
                          }}
                        >
                          {isCopied ? (
                            <Check size={16} className="text-emerald-400" />
                          ) : discordPfp ? (
                            <img
                              src={discordPfp}
                              alt="Discord"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                if (member.discord && /^\d{17,20}$/.test(member.discord.trim())) {
                                  img.src = getDiscordDefaultAvatar(member.discord);
                                } else {
                                  img.style.display = "none";
                                }
                              }}
                            />
                          ) : (
                            <DiscordIcon size={16} className="text-indigo-300" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </section>

        {/* ── Secondary Section: Role Hierarchy & Guidelines ── */}
        <section className="docs-home-section">
          <div className="section-header">
            <h2 className="docs-home-section-title">Roluri &amp; Niveluri de Acces în Echipă</h2>
            <span className="section-sub">Ierarhia oficială și permisiunile fiecărui grad din echipa de documentație</span>
          </div>

          <div className="home-cards-grid">
            <div className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--orange">
                  <Shield size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Root Authority</span>
              </div>
              <h3 className="home-card-title">Root Super Admin</h3>
              <p className="home-card-desc">
                Gestionarea platformei de documentație, arhitectura sistemelor, securitatea și drepturile de acces.
              </p>
            </div>

            <div className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--blue">
                  <Award size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Management</span>
              </div>
              <h3 className="home-card-title">Documentation Lead</h3>
              <p className="home-card-desc">
                Supervizează structura ghidurilor, aprobă conținutul nou, gestionează fișierele media și setările platformei.
              </p>
            </div>

            <div className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--teal">
                  <BookOpen size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Redactare</span>
              </div>
              <h3 className="home-card-title">Content Editor</h3>
              <p className="home-card-desc">
                Redactează ghiduri Markdown, actualizează mecanici in-game, corectează erori și adaugă capturi media.
              </p>
            </div>

            <Link href="/docs/informatii/staff/cum-aplici" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--yellow">
                  <Flame size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Recrutare</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Vrei să Contribui?</h3>
              <p className="home-card-desc">
                Află cum poți deveni redactor de conținut sau cum poți propune ghiduri noi pentru comunitatea Wildfire.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
