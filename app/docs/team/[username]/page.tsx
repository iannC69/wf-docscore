"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  BookOpen,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  ExternalLink,
  ArrowLeft,
  MessageSquare,
  Star,
  GitCommit,
  FileText,
  ChevronRight,
  Check,
  Copy,
  Folder,
  Sliders,
  Key,
  Trash2,
  Search,
  ScrollText,
  ShieldAlert,
  Users,
  Activity,
  Layers,
  Sparkles,
  Award,
  Zap,
  Flame,
  Crown,
  Terminal,
  GitBranch,
  GitPullRequest,
  FileEdit,
  History,
  Lock,
  Unlock,
  Filter,
} from "lucide-react";
import { MemberAchievementsSummary, AchievementBadge, BadgeTier } from "@/lib/badgesEngine";

// ── Custom SVG Social Icons ───────────────────────────────────────────────────

function GithubIcon({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function DiscordIcon({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function SteamIcon({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-10 9.87l5.65 2.33a3.54 3.54 0 0 1 1.95-.58l2.9-4.2a3.7 3.7 0 0 1 7.23-1.22 3.7 3.7 0 0 1-5.18 5.18l-4.2 2.9a3.54 3.54 0 0 1-.58 1.95L4.44 20.9A10 10 0 1 0 12 2zm3.73 6.27a2.22 2.22 0 1 0 2.22 2.22 2.22 2.22 0 0 0-2.22-2.22zm-7.6 9.47a2.08 2.08 0 1 0 2.08 2.08 2.08 2.08 0 0 0-2.08-2.08z" />
    </svg>
  );
}

// ── Role Metadata & Vibrant Accent Definitions ────────────────────────────────

const ROLE_META: Record<string, { label: string; accentColor: string; glowColor: string; bgTint: string }> = {
  root_admin:     { label: "Root Super Admin", accentColor: "hsl(26 100% 52%)", glowColor: "hsl(26 100% 52% / 0.35)", bgTint: "hsl(26 100% 52% / 0.12)" },
  doc_lead:       { label: "Co-Lead & Systems", accentColor: "hsl(38 96% 50%)", glowColor: "hsl(38 96% 50% / 0.35)", bgTint: "hsl(38 96% 50% / 0.12)" },
  content_editor: { label: "Content Editor",   accentColor: "hsl(142 71% 45%)", glowColor: "hsl(142 71% 45% / 0.35)", bgTint: "hsl(142 71% 45% / 0.12)" },
  custom:         { label: "Content Editor & Reviewer", accentColor: "hsl(142 71% 45%)", glowColor: "hsl(142 71% 45% / 0.35)", bgTint: "hsl(142 71% 45% / 0.12)" },
  moderator:      { label: "Moderator",        accentColor: "hsl(217 91% 60%)", glowColor: "hsl(217 91% 60% / 0.35)", bgTint: "hsl(217 91% 60% / 0.12)" },
  viewer:         { label: "Contributor",      accentColor: "hsl(220 14% 65%)", glowColor: "hsl(220 14% 65% / 0.25)", bgTint: "hsl(220 14% 65% / 0.08)" },
};

const PERM_METAS: { key: string; label: string; icon: React.ElementType; color: string }[] = [
  { key: "canEditDocs",       label: "Content Studio",     icon: FileText,    color: "#10b981" },
  { key: "canDeleteDocs",     label: "Ștergere Docs",      icon: Trash2,      color: "#f43f5e" },
  { key: "canManageMedia",    label: "Media Vault",        icon: Folder,      color: "#06b6d4" },
  { key: "canViewAnalytics",  label: "Search Telemetry",   icon: Search,      color: "#a855f7" },
  { key: "canViewAudit",      label: "Audit Ledger",       icon: ScrollText,  color: "#f59e0b" },
  { key: "canManageSettings", label: "Setări & Backup",    icon: Sliders,     color: "#ff6b00" },
  { key: "canManageSecurity", label: "Securitate 2FA",     icon: ShieldCheck, color: "#3b82f6" },
  { key: "canManageApiKeys",  label: "API Tokens",         icon: Key,         color: "#6366f1" },
  { key: "canTriggerPanic",   label: "Panic Lockdown",     icon: ShieldAlert, color: "#ef4444" },
  { key: "canManageTeam",     label: "Gestiune Echipă",    icon: Users,       color: "#f59e0b" },
];

const BADGE_ICONS: Record<string, React.ElementType> = {
  Crown,
  Zap,
  GitCommit,
  Sparkles,
  BookOpen,
  GitBranch,
  Flame,
  ShieldCheck,
  GitPullRequest,
  FileText,
  Users,
  Terminal,
  Award,
  FileEdit,
  Star,
};

const TIER_LABELS: Record<BadgeTier, { name: string; color: string; bg: string; border: string }> = {
  mythic:   { name: "Mythic",   color: "hsl(280 100% 65%)", bg: "hsl(280 100% 65% / 0.12)", border: "hsl(280 100% 65% / 0.4)" },
  platinum: { name: "Platinum", color: "hsl(186 100% 50%)", bg: "hsl(186 100% 50% / 0.12)", border: "hsl(186 100% 50% / 0.4)" },
  gold:     { name: "Gold",     color: "hsl(43 96% 52%)",  bg: "hsl(43 96% 52% / 0.12)",  border: "hsl(43 96% 52% / 0.4)" },
  silver:   { name: "Silver",   color: "hsl(215 25% 75%)", bg: "hsl(215 25% 75% / 0.12)", bgTint: "hsl(215 25% 75% / 0.1)", border: "hsl(215 25% 75% / 0.3)" } as any,
  bronze:   { name: "Bronze",   color: "hsl(25 85% 55%)",  bg: "hsl(25 85% 55% / 0.12)",  border: "hsl(25 85% 55% / 0.35)" },
};

// ── SVG Activity Chart with Smooth Bars & Tooltip Indicator ───────────────────

function ActivityChart({ data, accentColor }: { data: { month: string; count: number }[]; accentColor: string }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const monthNames = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

  const getShortMonth = (m: string) => {
    const parts = m.split("-");
    const idx = parseInt(parts[1]) - 1;
    return monthNames[idx] ?? m;
  };

  return (
    <div className="profile-chart-container">
      <div className="profile-chart-header-row">
        <div className="profile-chart-legend">
          <span className="profile-chart-legend-dot" style={{ background: accentColor }} />
          <span>Frecvență Commit-uri / Lună</span>
        </div>
        <span className="profile-chart-total-tag">
          <GitCommit size={11} />
          {data.reduce((acc, curr) => acc + curr.count, 0)} acțiuni înregistrate
        </span>
      </div>

      <div className="profile-chart-bars-wrap">
        {data.map((d) => {
          const heightPercent = Math.max(8, Math.round((d.count / maxCount) * 100));
          const hasActivity = d.count > 0;

          return (
            <div key={d.month} className="profile-chart-col">
              <div className="profile-chart-bar-slot">
                <div
                  className={`profile-chart-bar-fill ${hasActivity ? "profile-chart-bar-fill--active" : ""}`}
                  style={{
                    height: `${heightPercent}%`,
                    background: hasActivity
                      ? `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}40 100%)`
                      : "hsl(0 0% 100% / 0.04)",
                    borderColor: hasActivity ? `${accentColor}80` : "hsl(0 0% 100% / 0.08)",
                  }}
                >
                  {hasActivity && (
                    <span className="profile-chart-tooltip" style={{ color: accentColor }}>
                      {d.count}
                    </span>
                  )}
                </div>
              </div>
              <span className="profile-chart-month-label">{getShortMonth(d.month)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Connected Live Social Card ────────────────────────────────────────────────

function ConnectedAccountCard({
  platform,
  title,
  username,
  avatarUrl,
  subtitle,
  href,
  badgeText,
  loading,
}: {
  platform: "github" | "discord" | "steam";
  title: string;
  username?: string;
  avatarUrl?: string;
  subtitle?: string;
  href?: string;
  badgeText?: string;
  loading?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const meta = {
    github:  { brand: "GitHub",  icon: GithubIcon,  color: "#e2e8f0", border: "hsl(220 14% 30% / 0.8)", glow: "hsl(220 14% 20% / 0.4)", bg: "hsl(220 14% 12% / 0.7)" },
    discord: { brand: "Discord", icon: DiscordIcon, color: "#818cf8", border: "hsl(235 85% 65% / 0.6)", glow: "hsl(235 85% 65% / 0.3)", bg: "hsl(235 50% 14% / 0.7)" },
    steam:   { brand: "Steam",   icon: SteamIcon,   color: "#60a5fa", border: "hsl(215 85% 55% / 0.6)", glow: "hsl(215 85% 55% / 0.3)", bg: "hsl(215 45% 12% / 0.7)" },
  }[platform];

  const Icon = meta.icon;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (username) {
      navigator.clipboard.writeText(username).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return (
      <div className="profile-social-tile profile-social-tile--loading">
        <div className="profile-social-skeleton-pfp" />
        <div className="profile-social-skeleton-info" />
      </div>
    );
  }

  if (!username && !avatarUrl) return null;

  return (
    <div
      className="profile-social-tile"
      style={{
        background: meta.bg,
        borderColor: meta.border,
        boxShadow: `0 4px 20px ${meta.glow}`,
      }}
    >
      <div className="profile-social-avatar-box">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={title}
            className="profile-social-avatar-img"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="profile-social-avatar-fallback">
            <Icon size={18} style={{ color: meta.color }} />
          </div>
        )}
        <div className="profile-social-brand-badge" style={{ borderColor: meta.border }}>
          <Icon size={10} style={{ color: meta.color }} />
        </div>
      </div>

      <div className="profile-social-content">
        <div className="profile-social-top-row">
          <span className="profile-social-brand-name" style={{ color: meta.color }}>
            {meta.brand}
          </span>
          {badgeText && <span className="profile-social-chip">{badgeText}</span>}
        </div>

        <h4 className="profile-social-user-title">{title || username}</h4>
        {subtitle && <p className="profile-social-sub">{subtitle}</p>}
      </div>

      <div className="profile-social-actions">
        <button
          type="button"
          onClick={handleCopy}
          className="profile-social-btn"
          title={copied ? "Copiat!" : "Copiază handle"}
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-social-btn"
            title={`Deschide ${meta.brand}`}
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = typeof params.username === "string" ? params.username : "";

  const [member, setMember] = useState<any>(null);
  const [gitStats, setGitStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<MemberAchievementsSummary | null>(null);
  const [githubData, setGithubData] = useState<any>(null);
  const [discordData, setDiscordData] = useState<any>(null);
  const [steamData, setSteamData] = useState<any>(null);
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [socialsLoaded, setSocialsLoaded] = useState(false);

  // Tab & Filter States
  const [profileTab, setProfileTab] = useState<"overview" | "timeline" | "achievements">("overview");
  const [timelineSearch, setTimelineSearch] = useState<string>("");
  const [timelineFilter, setTimelineFilter] = useState<"all" | "docs" | "commits" | "code">("all");
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<"all" | "git" | "docs" | "security" | "community">("all");

  const fetchProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/team/profile?username=${encodeURIComponent(username)}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMember(data.member);
      setGitStats(data.gitStats);
      if (data.achievements) {
        setAchievements(data.achievements);
      }
      setLoading(false);

      // Fetch live social metadata in parallel
      const promises: Promise<void>[] = [];

      if (data.member.githubUsername) {
        promises.push(
          fetch(`/api/team/github?username=${encodeURIComponent(data.member.githubUsername)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((gh) => { if (gh && !gh.error) setGithubData(gh); })
            .catch(() => {})
        );
      }

      if (data.member.discord && /^\d{17,20}$/.test(data.member.discord.trim())) {
        promises.push(
          fetch(`/api/discord/avatar?id=${encodeURIComponent(data.member.discord.trim())}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (d) setDiscordData(d); })
            .catch(() => {})
        );
      }

      if (data.member.steamId) {
        promises.push(
          fetch(`/api/steam/avatar?id=${encodeURIComponent(data.member.steamId.trim())}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((s) => { if (s && !s.error) setSteamData(s); })
            .catch(() => {})
        );
      }

      await Promise.allSettled(promises);
      setSocialsLoaded(true);
    } catch {
      setNotFound(true);
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const copyProfileHandle = (handle: string) => {
    navigator.clipboard.writeText(`@${handle}`).then(() => {
      setCopiedHandle(true);
      setTimeout(() => setCopiedHandle(false), 2000);
    });
  };

  // ── Timeline Unified Items Builder ──
  const timelineItems = useMemo(() => {
    if (!gitStats) return [];
    const items: Array<{
      id: string;
      date: string;
      type: "commit" | "doc" | "code";
      title: string;
      subtitle?: string;
      hash?: string;
      shortHash?: string;
      path?: string;
      isDoc?: boolean;
      url?: string;
    }> = [];

    // 1. Commits
    if (gitStats.recentCommits) {
      gitStats.recentCommits.forEach((c: any, i: number) => {
        items.push({
          id: `commit_${c.hash || i}`,
          date: c.date || "Recent",
          type: "commit",
          title: c.message || "Commit update",
          hash: c.hash,
          shortHash: c.shortHash || (c.hash ? c.hash.slice(0, 7) : ""),
          url: c.url || `https://github.com/iannC69/wf-docscore/commit/${c.hash}`,
        });
      });
    }

    // 2. Modified Files
    if (gitStats.recentFiles) {
      gitStats.recentFiles.forEach((f: any, i: number) => {
        const isDoc = f.file.startsWith("content/docs/");
        const cleanPath = isDoc ? f.file.replace(/^content\/docs\//, "").replace(/\.md$/, "") : f.file;
        items.push({
          id: `file_${f.commitHash || i}_${f.file}`,
          date: f.date || "Recent",
          type: isDoc ? "doc" : "code",
          title: f.message || `Actualizare ${f.file}`,
          path: cleanPath,
          isDoc,
          hash: f.commitHash,
          shortHash: f.commitHash ? f.commitHash.slice(0, 7) : "",
          url: isDoc ? `/docs/${cleanPath}` : undefined,
        });
      });
    }

    return items;
  }, [gitStats]);

  const filteredTimeline = useMemo(() => {
    return timelineItems.filter((item) => {
      if (timelineFilter === "docs" && item.type !== "doc") return false;
      if (timelineFilter === "commits" && item.type !== "commit") return false;
      if (timelineFilter === "code" && item.type !== "code") return false;

      if (timelineSearch.trim()) {
        const q = timelineSearch.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchPath = item.path?.toLowerCase().includes(q);
        const matchHash = item.shortHash?.toLowerCase().includes(q);
        return matchTitle || matchPath || matchHash;
      }
      return true;
    });
  }, [timelineItems, timelineFilter, timelineSearch]);

  // ── Filtered Badges ──
  const filteredBadges = useMemo(() => {
    if (!achievements?.badges) return [];
    return achievements.badges.filter((b) => {
      if (badgeCategoryFilter !== "all" && b.category !== badgeCategoryFilter) return false;
      return true;
    });
  }, [achievements, badgeCategoryFilter]);

  if (loading) {
    return (
      <div className="profile-loading-wrap">
        <div className="profile-loading-orb" />
        <span>Se încarcă profilul contribuitorului...</span>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="profile-error-box">
        <User size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
        <h2>Contribuitor Neregăsit</h2>
        <p>Utilizatorul <strong>@{username}</strong> nu face parte din echipa WildFire Docs.</p>
        <button type="button" className="profile-back-action-btn" onClick={() => router.push("/docs/team")}>
          <ArrowLeft size={14} />
          Înapoi la Echipa Oficială
        </button>
      </div>
    );
  }

  const roleMeta = ROLE_META[member.role] || ROLE_META.content_editor;
  const activePermsCount = Object.values(member.permissions || {}).filter(Boolean).length;

  const joinedDate = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })
    : "Data nespecificată";

  const lastLogin = member.lastLoginAt
    ? new Date(member.lastLoginAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Recent";

  const avatarSrc =
    member.avatarUrl ||
    (member.githubUsername ? `https://github.com/${member.githubUsername}.png` : null) ||
    "https://cdn.discordapp.com/embed/avatars/0.png";

  const steamUrl = member.steamId
    ? (member.steamId.startsWith("http") ? member.steamId : `https://steamcommunity.com/id/${member.steamId}`)
    : null;

  const discordUrl = member.discord ? `https://discord.com/users/${member.discord}` : null;
  const githubUrl = member.githubUsername ? `https://github.com/${member.githubUsername}` : null;

  return (
    <div className="profile-page-wrapper">
      {/* ── Top Navigation Bar ── */}
      <div className="profile-top-nav">
        <button type="button" className="profile-back-link" onClick={() => router.push("/docs/team")}>
          <ArrowLeft size={13} />
          <span>Echipa Oficială &amp; Contribuitori</span>
        </button>
        <ChevronRight size={12} className="text-zinc-600" />
        <span className="profile-current-crumb">@{member.username}</span>
      </div>

      {/* ── Liquid Glass Hero Showcase ── */}
      <div
        className="profile-hero-card"
        style={{
          "--role-accent": roleMeta.accentColor,
          "--role-glow": roleMeta.glowColor,
          "--role-tint": roleMeta.bgTint,
        } as React.CSSProperties}
      >
        <div
          className="profile-hero-aurora"
          style={{
            background: `radial-gradient(ellipse 65% 55% at 15% 45%, ${roleMeta.glowColor}, transparent 70%)`,
          }}
        />

        <div className="profile-hero-inner">
          {/* Avatar Container */}
          <div className="profile-avatar-frame">
            <div
              className="profile-avatar-border-ring"
              style={{
                borderColor: roleMeta.accentColor,
                boxShadow: `0 0 0 4px ${roleMeta.glowColor}, 0 8px 32px ${roleMeta.glowColor}`,
              }}
            >
              <img
                src={avatarSrc}
                alt={member.displayName}
                className="profile-avatar-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png";
                }}
              />
            </div>
            {member.status === "active" && (
              <div className="profile-avatar-beacon" title="Membru Activ în Sistem" />
            )}
          </div>

          {/* User Identity Details */}
          <div className="profile-identity-block">
            <div className="profile-badges-strip">
              <span
                className="profile-role-badge"
                style={{
                  background: roleMeta.bgTint,
                  color: roleMeta.accentColor,
                  borderColor: `${roleMeta.accentColor}60`,
                }}
              >
                <span className="profile-role-dot" style={{ background: roleMeta.accentColor }} />
                {roleMeta.label}
              </span>

              {member.isRoot && (
                <span className="profile-root-pill">
                  <Shield size={11} className="text-amber-400" />
                  <span>Root Super Admin</span>
                </span>
              )}

              <span className="profile-verified-pill">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>Verificat Oficial</span>
              </span>

              {gitStats?.isMatchedWithGithub && (
                <a
                  href="https://github.com/iannC69/wf-docscore/graphs/contributors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-verified-pill"
                  style={{
                    background: "hsl(220 14% 18% / 0.7)",
                    borderColor: "hsl(220 14% 35% / 0.6)",
                    color: "#e2e8f0",
                    textDecoration: "none",
                  }}
                  title="Contribuitor verificat pe GitHub Graphs/Contributors"
                >
                  <GithubIcon size={11} className="text-zinc-300" />
                  <span>GitHub Graph Contributor</span>
                  <ExternalLink size={10} className="opacity-60 ml-0.5" />
                </a>
              )}
            </div>

            <div className="profile-name-row">
              <h1 className="profile-display-name">{member.displayName}</h1>
            </div>

            {member.customTitle && (
              <p className="profile-custom-title" style={{ color: roleMeta.accentColor }}>
                {member.customTitle}
              </p>
            )}

            <div className="profile-handle-row">
              <button
                type="button"
                className="profile-handle-chip"
                onClick={() => copyProfileHandle(member.username)}
                title="Apasă pentru a copia handle-ul"
              >
                <span className="profile-handle-at" style={{ color: roleMeta.accentColor }}>@</span>
                <span className="profile-handle-text">{member.username}</span>
                {copiedHandle ? <Check size={12} className="text-emerald-400 ml-1" /> : <Copy size={11} className="ml-1 opacity-50" />}
              </button>

              {achievements && achievements.totalUnlocked > 0 && (
                <div className="profile-honor-badges">
                  <span className="profile-honor-pill" style={{ background: "hsl(280 100% 65% / 0.15)", borderColor: "hsl(280 100% 65% / 0.35)", color: "hsl(280 100% 75%)" }}>
                    <Zap size={11} className="text-purple-400" />
                    <span>{achievements.reputationPoints} PTS</span>
                  </span>
                  <span className="profile-honor-pill" style={{ background: "hsl(43 96% 52% / 0.15)", borderColor: "hsl(43 96% 52% / 0.35)", color: "hsl(43 96% 65%)" }}>
                    <Award size={11} className="text-amber-400" />
                    <span>{achievements.totalUnlocked} Realizări</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Metric Grid in Hero */}
          <div className="profile-hero-metrics-grid">
            <div className="profile-hero-metric-tile">
              <div className="profile-hero-metric-icon profile-hero-metric-icon--orange">
                <BookOpen size={16} />
              </div>
              <div className="profile-hero-metric-data">
                <span className="profile-hero-metric-num" style={{ color: roleMeta.accentColor }}>
                  {gitStats?.docsCommits ?? 0}
                </span>
                <span className="profile-hero-metric-lbl">Ghiduri</span>
              </div>
            </div>

            <div className="profile-hero-metric-tile">
              <div className="profile-hero-metric-icon profile-hero-metric-icon--cyan">
                <GitCommit size={16} />
              </div>
              <div className="profile-hero-metric-data">
                <span className="profile-hero-metric-num text-cyan-400">
                  {gitStats?.totalCommits || 0}
                </span>
                <span className="profile-hero-metric-lbl">Commit-uri Repo</span>
              </div>
            </div>

            <div className="profile-hero-metric-tile">
              <div className="profile-hero-metric-icon profile-hero-metric-icon--emerald">
                <ShieldCheck size={16} />
              </div>
              <div className="profile-hero-metric-data">
                <span className="profile-hero-metric-num text-emerald-400">
                  {activePermsCount}
                </span>
                <span className="profile-hero-metric-lbl">Permisiuni</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Liquid Glass Tabs ── */}
      <div className="profile-tabs-bar">
        <button
          type="button"
          className={`profile-tab-action ${profileTab === "overview" ? "profile-tab-action--active" : ""}`}
          onClick={() => setProfileTab("overview")}
        >
          <User size={14} />
          <span>Prezentare Generală</span>
        </button>

        <button
          type="button"
          className={`profile-tab-action ${profileTab === "timeline" ? "profile-tab-action--active" : ""}`}
          onClick={() => setProfileTab("timeline")}
        >
          <History size={14} />
          <span>Timeline Activitate</span>
          <span className="profile-tab-badge-count">{timelineItems.length}</span>
        </button>

        <button
          type="button"
          className={`profile-tab-action ${profileTab === "achievements" ? "profile-tab-action--active" : ""}`}
          onClick={() => setProfileTab("achievements")}
        >
          <Award size={14} />
          <span>Insigne &amp; Realizări</span>
          {achievements && (
            <span className="profile-tab-badge-count">
              {achievements.totalUnlocked}/{achievements.totalAvailable}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW DASHBOARD ── */}
      {profileTab === "overview" && (
        <div className="profile-dashboard-layout">
          {/* LEFT / MAIN CONTENT AREA (68%) */}
          <div className="profile-main-col">
            {/* Card 1: Despre & Responsabilități */}
            <div className="profile-glass-panel">
              <div className="profile-panel-header">
                <div className="profile-panel-icon-wrap">
                  <User size={15} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="profile-panel-title">Despre &amp; Rol Tehnic</h3>
                  <span className="profile-panel-subtitle">Prezentarea contribuitorului și responsabilitățile de bază</span>
                </div>
              </div>

              <div className="profile-bio-box">
                <p className="profile-bio-text">
                  {member.bio || "Membru activ în echipa de redactare, structurare și mentenanță a documentației oficiale WildFire."}
                </p>
              </div>

              {member.responsibilities && member.responsibilities.length > 0 && (
                <div className="profile-resp-container">
                  <span className="profile-subheading-tag">
                    <Layers size={11} className="text-cyan-400" />
                    Arii de Responsabilitate &amp; Expertiză
                  </span>
                  <div className="profile-resp-tags-grid">
                    {member.responsibilities.map((resp: string, idx: number) => (
                      <div key={idx} className="profile-resp-chip">
                        <ChevronRight size={11} style={{ color: roleMeta.accentColor }} />
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Activitate Git & Contribuții Reale */}
            <div className="profile-glass-panel">
              <div className="profile-panel-header">
                <div className="profile-panel-icon-wrap">
                  <Activity size={15} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="profile-panel-title">Activitate &amp; Contribuții Reale în Repository</h3>
                  <span className="profile-panel-subtitle">Evoluția reală a commit-urilor în repository pe ultimele 6 luni</span>
                </div>
              </div>

              {gitStats?.monthlyActivity && gitStats.monthlyActivity.length > 0 ? (
                <ActivityChart data={gitStats.monthlyActivity} accentColor={roleMeta.accentColor} />
              ) : (
                <div className="profile-empty-state">
                  <Clock size={20} className="text-zinc-600 mb-2" />
                  <p>Nicio activitate de commit înregistrată în intervalul recent.</p>
                </div>
              )}
            </div>

            {/* Card 3: Jurnal Commit-uri Recente în Repository */}
            {gitStats?.recentCommits && gitStats.recentCommits.length > 0 && (
              <div className="profile-glass-panel">
                <div className="profile-panel-header">
                  <div className="profile-panel-icon-wrap">
                    <GitCommit size={15} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="profile-panel-title">Jurnal Commit-uri Recente în Repository</h3>
                    <span className="profile-panel-subtitle">Ultimele acțiuni și modificări comise în ramura principală</span>
                  </div>
                </div>

                <div className="profile-commits-list">
                  {gitStats.recentCommits.map((c: any, i: number) => (
                    <a
                      key={i}
                      href={c.url || `https://github.com/iannC69/wf-docscore/commit/${c.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-commit-row"
                      title={`Vezi commit pe GitHub: ${c.hash}`}
                    >
                      <span className="profile-commit-hash-badge">
                        #{c.shortHash}
                      </span>
                      <span className="profile-commit-msg-text">
                        {c.message}
                      </span>
                      <div className="profile-doc-right">
                        <span className="profile-doc-date">{c.date}</span>
                        <ExternalLink size={12} className="profile-doc-arrow opacity-60" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Card 4: Fișiere & Documente Modificate */}
            <div className="profile-glass-panel">
              <div className="profile-panel-header">
                <div className="profile-panel-icon-wrap">
                  <FileText size={15} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="profile-panel-title">Documente &amp; Fișiere Modificate</h3>
                  <span className="profile-panel-subtitle">Fișierele actualizate în repository de către acest autor</span>
                </div>
              </div>

              {gitStats?.recentFiles && gitStats.recentFiles.length > 0 ? (
                <div className="profile-recent-docs-list">
                  {gitStats.recentFiles.map((fileItem: any, i: number) => {
                    const isDoc = fileItem.file.startsWith("content/docs/");
                    const cleanPath = isDoc
                      ? fileItem.file.replace(/^content\/docs\//, "").replace(/\.md$/, "")
                      : fileItem.file;
                    const parts = cleanPath.split("/");
                    const category = isDoc ? (parts.length > 1 ? parts[0] : "general") : "repo/code";
                    const docSlug = isDoc ? `/docs/${cleanPath}` : null;

                    if (docSlug) {
                      return (
                        <Link
                          key={i}
                          href={docSlug}
                          className="profile-doc-row"
                        >
                          <div className="profile-doc-icon-badge">
                            <FileText size={13} className="text-amber-400" />
                          </div>
                          <div className="profile-doc-meta">
                            <div className="profile-doc-title-row">
                              <span className="profile-doc-category-pill">{category}</span>
                              <span className="profile-doc-path">{cleanPath}</span>
                            </div>
                            <p className="profile-doc-commit-msg">{fileItem.message}</p>
                          </div>
                          <div className="profile-doc-right">
                            <span className="profile-doc-date">{fileItem.date}</span>
                            <ChevronRight size={13} className="profile-doc-arrow" />
                          </div>
                        </Link>
                      );
                    }

                    return (
                      <div key={i} className="profile-doc-row">
                        <div className="profile-doc-icon-badge" style={{ background: "hsl(215 90% 60% / 0.12)", borderColor: "hsl(215 90% 60% / 0.25)" }}>
                          <FileText size={13} className="text-blue-400" />
                        </div>
                        <div className="profile-doc-meta">
                          <div className="profile-doc-title-row">
                            <span className="profile-doc-category-pill" style={{ background: "hsl(215 90% 60% / 0.14)", borderColor: "hsl(215 90% 60% / 0.3)", color: "hsl(215 90% 70%)" }}>
                              {category}
                            </span>
                            <span className="profile-doc-path">{cleanPath}</span>
                          </div>
                          <p className="profile-doc-commit-msg">{fileItem.message}</p>
                        </div>
                        <div className="profile-doc-right">
                          <span className="profile-doc-date">{fileItem.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <FileText size={20} className="text-zinc-600 mb-2" />
                  <p>Nu există fișiere modificate recent de acest autor în repository.</p>
                </div>
              )}
            </div>

            {/* Card 5: GitHub Live Feed */}
            {githubData && (
              <div className="profile-glass-panel">
                <div className="profile-panel-header">
                  <div className="profile-panel-icon-wrap">
                    <GithubIcon size={15} className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="profile-panel-title">Activitate GitHub Live</h3>
                    <span className="profile-panel-subtitle">Sincronizare în timp real cu profilul @{member.githubUsername}</span>
                  </div>
                </div>

                {githubData.bio && (
                  <p className="profile-bio-text mb-3" style={{ fontStyle: "italic" }}>
                    &ldquo;{githubData.bio}&rdquo;
                  </p>
                )}

                <div className="profile-github-metrics-row">
                  <div className="profile-gh-metric-chip">
                    <Star size={12} className="text-amber-400" />
                    <span><strong>{githubData.public_repos}</strong> Repository-uri Publice</span>
                  </div>
                  <div className="profile-gh-metric-chip">
                    <User size={12} className="text-blue-400" />
                    <span><strong>{githubData.followers}</strong> Urmăritori</span>
                  </div>
                  {gitStats?.githubGraph && (
                    <div className="profile-gh-metric-chip" style={{ background: "hsl(142 71% 45% / 0.12)", borderColor: "hsl(142 71% 45% / 0.3)", color: "hsl(142 71% 70%)" }}>
                      <Sparkles size={12} className="text-emerald-400" />
                      <span><strong>+{gitStats.githubGraph.totalAdditions.toLocaleString()}</strong> / <strong>-{gitStats.githubGraph.totalDeletions.toLocaleString()}</strong> linii modificate</span>
                    </div>
                  )}
                  {githubData.location && (
                    <div className="profile-gh-metric-chip">
                      <MessageSquare size={12} className="text-cyan-400" />
                      <span>{githubData.location}</span>
                    </div>
                  )}
                </div>

                {githubData.recentEvents && githubData.recentEvents.length > 0 && (
                  <div className="profile-gh-events-list">
                    <span className="profile-subheading-tag">
                      <Sparkles size={11} className="text-purple-400" />
                      Evenimente &amp; Push-uri Recente pe GitHub
                    </span>
                    {githubData.recentEvents.slice(0, 4).map((evt: any, idx: number) => (
                      <div key={idx} className="profile-gh-event-item">
                        <GitCommit size={12} className="text-purple-400 flex-shrink-0" />
                        <div className="profile-gh-event-body">
                          <span className="profile-gh-event-repo">{evt.repo?.name}</span>
                          <span className="profile-gh-event-type">
                            {evt.type === "PushEvent" ? "Commit Push" : evt.type}
                          </span>
                        </div>
                        <span className="profile-gh-event-time">
                          {new Date(evt.created_at).toLocaleDateString("ro-RO", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT / SIDEBAR AREA (32%) */}
          <div className="profile-sidebar-col">
            {/* Section 1: Conturi & Identități Conectate */}
            <div className="profile-glass-panel">
              <div className="profile-panel-header">
                <div className="profile-panel-icon-wrap">
                  <Sparkles size={15} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="profile-panel-title">Identități Conectate</h3>
                  <span className="profile-panel-subtitle">Hub integrat Discord, Steam &amp; GitHub</span>
                </div>
              </div>

              <div className="profile-social-stack">
                {/* GitHub */}
                {member.githubUsername && (
                  <ConnectedAccountCard
                    platform="github"
                    title={githubData?.name || member.githubUsername}
                    username={member.githubUsername}
                    avatarUrl={githubData?.avatar_url}
                    subtitle={githubData ? `${githubData.followers} followers · ${githubData.public_repos} repos` : `@${member.githubUsername}`}
                    href={githubUrl || undefined}
                    badgeText="GitHub"
                    loading={!socialsLoaded && !githubData}
                  />
                )}

                {/* Discord */}
                {member.discord && (
                  <ConnectedAccountCard
                    platform="discord"
                    title={discordData?.globalName || discordData?.username || "Discord User"}
                    username={discordData?.username || member.discord}
                    avatarUrl={discordData?.avatarUrl}
                    subtitle={discordData?.username ? `@${discordData.username}` : `ID: ${member.discord}`}
                    href={discordUrl || undefined}
                    badgeText="Discord"
                    loading={!socialsLoaded && !discordData}
                  />
                )}

                {/* Steam */}
                {member.steamId && (
                  <ConnectedAccountCard
                    platform="steam"
                    title={member.displayName || member.username}
                    username={member.steamId.replace(/https?:\/\/steamcommunity\.com\/(id|profiles)\//, "").replace(/\/$/, "")}
                    avatarUrl={steamData?.avatarUrl}
                    subtitle="Comunitatea Steam WildFire"
                    href={steamUrl || undefined}
                    badgeText="Steam"
                    loading={!socialsLoaded && !steamData}
                  />
                )}
              </div>
            </div>

            {/* Section 2: Matrice Permisiuni RBAC */}
            <div className="profile-glass-panel">
              <div className="profile-panel-header">
                <div className="profile-panel-icon-wrap">
                  <Shield size={15} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="profile-panel-title">Matrice Permisiuni RBAC</h3>
                  <span className="profile-panel-subtitle">Nivelurile de acces autorizate în sistem</span>
                </div>
              </div>

              <div className="profile-rbac-grid">
                {PERM_METAS.map((pm) => {
                  const isGranted = Boolean(member.permissions?.[pm.key]);
                  const Icon = pm.icon;

                  return (
                    <div
                      key={pm.key}
                      className={`profile-rbac-item ${isGranted ? "profile-rbac-item--granted" : "profile-rbac-item--denied"}`}
                      style={
                        isGranted
                          ? ({
                              "--perm-color": pm.color,
                            } as React.CSSProperties)
                          : undefined
                      }
                    >
                      <div className="profile-rbac-icon-box">
                        <Icon size={12} />
                      </div>
                      <span className="profile-rbac-label">{pm.label}</span>
                      <span className="profile-rbac-status-dot" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Metadate & Securitate Cont */}
            <div className="profile-glass-panel">
              <div className="profile-panel-header">
                <div className="profile-panel-icon-wrap">
                  <Clock size={15} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="profile-panel-title">Informații &amp; Audit Cont</h3>
                  <span className="profile-panel-subtitle">Istoric conexiuni și stare securitate</span>
                </div>
              </div>

              <div className="profile-meta-list">
                <div className="profile-meta-row">
                  <div className="profile-meta-left">
                    <Calendar size={13} className="text-amber-400" />
                    <span>Data Înregistrării</span>
                  </div>
                  <span className="profile-meta-val">{joinedDate}</span>
                </div>

                <div className="profile-meta-row">
                  <div className="profile-meta-left">
                    <Clock size={13} className="text-emerald-400" />
                    <span>Ultima Sesiune</span>
                  </div>
                  <span className="profile-meta-val">{lastLogin}</span>
                </div>

                <div className="profile-meta-row">
                  <div className="profile-meta-left">
                    <ShieldCheck size={13} className="text-cyan-400" />
                    <span>Statut Securitate</span>
                  </div>
                  <span className="profile-meta-val profile-meta-val--active">
                    {member.isRoot ? "Root Immune" : "Activ & Protejat"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INTERACTIVE TIMELINE FEED ── */}
      {profileTab === "timeline" && (
        <div className="profile-timeline-container">
          <div className="profile-glass-panel">
            <div className="profile-panel-header">
              <div className="profile-panel-icon-wrap">
                <History size={15} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="profile-panel-title">Jurnal Cronologic &amp; Istoric Contribuții</h3>
                <span className="profile-panel-subtitle">Feed interactiv cu toate commit-urile și documentele atinse</span>
              </div>
            </div>

            {/* Timeline Toolbar & Search */}
            <div className="profile-timeline-toolbar">
              <div className="profile-timeline-filters">
                <button
                  type="button"
                  className={`profile-timeline-pill ${timelineFilter === "all" ? "profile-timeline-pill--active" : ""}`}
                  onClick={() => setTimelineFilter("all")}
                >
                  Toate ({timelineItems.length})
                </button>
                <button
                  type="button"
                  className={`profile-timeline-pill ${timelineFilter === "docs" ? "profile-timeline-pill--active" : ""}`}
                  onClick={() => setTimelineFilter("docs")}
                >
                  Ghiduri Docs
                </button>
                <button
                  type="button"
                  className={`profile-timeline-pill ${timelineFilter === "commits" ? "profile-timeline-pill--active" : ""}`}
                  onClick={() => setTimelineFilter("commits")}
                >
                  Commit-uri Git
                </button>
                <button
                  type="button"
                  className={`profile-timeline-pill ${timelineFilter === "code" ? "profile-timeline-pill--active" : ""}`}
                  onClick={() => setTimelineFilter("code")}
                >
                  Fișiere Sursă
                </button>
              </div>

              <div className="profile-timeline-search">
                <Search size={13} className="text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filtrează în istoric..."
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  className="profile-timeline-search-input"
                />
              </div>
            </div>

            {/* Timeline Tree Feed */}
            {filteredTimeline.length === 0 ? (
              <div className="profile-empty-state">
                <History size={24} className="text-zinc-600 mb-2" />
                <p>Nicio activitate găsită pentru filtrele curente.</p>
              </div>
            ) : (
              <div className="profile-timeline-tree">
                {filteredTimeline.map((item, idx) => {
                  return (
                    <div key={item.id || idx} className="profile-timeline-node">
                      <div className="profile-timeline-rail">
                        <div
                          className="profile-timeline-dot"
                          style={{
                            borderColor:
                              item.type === "doc"
                                ? "#10b981"
                                : item.type === "commit"
                                ? "#06b6d4"
                                : "#a855f7",
                          }}
                        />
                        {idx < filteredTimeline.length - 1 && <div className="profile-timeline-line" />}
                      </div>

                      <div className="profile-timeline-card">
                        <div className="profile-timeline-card-header">
                          <div className="profile-timeline-type-row">
                            <span
                              className={`profile-timeline-type-pill profile-timeline-type-pill--${item.type}`}
                            >
                              {item.type === "doc" && <FileText size={10} />}
                              {item.type === "commit" && <GitCommit size={10} />}
                              {item.type === "code" && <Terminal size={10} />}
                              {item.type === "doc" ? "GHID DOCS" : item.type === "commit" ? "GIT COMMIT" : "FIȘIER COD"}
                            </span>

                            {item.shortHash && (
                              <a
                                href={item.url || `https://github.com/iannC69/wf-docscore/commit/${item.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="profile-timeline-hash-chip"
                                title="Vezi pe GitHub"
                              >
                                #{item.shortHash}
                                <ExternalLink size={9} className="opacity-60" />
                              </a>
                            )}
                          </div>

                          <span className="profile-timeline-date">{item.date}</span>
                        </div>

                        <h4 className="profile-timeline-msg">{item.title}</h4>

                        {item.path && (
                          <div className="profile-timeline-target">
                            {item.isDoc ? (
                              <Link href={`/docs/${item.path}`} className="profile-timeline-doc-link">
                                <BookOpen size={11} className="text-emerald-400" />
                                <span>/docs/{item.path}</span>
                                <ChevronRight size={11} className="opacity-60" />
                              </Link>
                            ) : (
                              <span className="profile-timeline-code-path">
                                <Terminal size={11} className="text-purple-400" />
                                {item.path}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ACHIEVEMENTS & BADGES VAULT ── */}
      {profileTab === "achievements" && achievements && (
        <div className="profile-achievements-container">
          {/* Achievements Summary Banner */}
          <div className="profile-achievements-kpi-grid">
            <div className="profile-achieve-kpi-card">
              <div className="profile-achieve-kpi-icon-wrap profile-achieve-kpi-icon-wrap--purple">
                <Zap size={18} />
              </div>
              <div className="profile-achieve-kpi-data">
                <span className="profile-achieve-kpi-num text-purple-400">
                  {achievements.reputationPoints} PTS
                </span>
                <span className="profile-achieve-kpi-label">Scor Reputație</span>
              </div>
            </div>

            <div className="profile-achieve-kpi-card">
              <div className="profile-achieve-kpi-icon-wrap profile-achieve-kpi-icon-wrap--gold">
                <Award size={18} />
              </div>
              <div className="profile-achieve-kpi-data">
                <span className="profile-achieve-kpi-num text-amber-400">
                  {achievements.totalUnlocked} / {achievements.totalAvailable}
                </span>
                <span className="profile-achieve-kpi-label">Insigne Deblocate ({achievements.completionPercentage}%)</span>
              </div>
            </div>

            <div className="profile-achieve-kpi-card">
              <div className="profile-achieve-kpi-data" style={{ width: "100%" }}>
                <span className="profile-achieve-kpi-label mb-2">Repartizare pe Ranguri:</span>
                <div className="profile-achieve-tiers-row">
                  <span className="profile-achieve-tier-tag" style={{ color: TIER_LABELS.mythic.color, borderColor: TIER_LABELS.mythic.border }}>
                    Mythic: {achievements.tierCounts.mythic}
                  </span>
                  <span className="profile-achieve-tier-tag" style={{ color: TIER_LABELS.platinum.color, borderColor: TIER_LABELS.platinum.border }}>
                    Platinum: {achievements.tierCounts.platinum}
                  </span>
                  <span className="profile-achieve-tier-tag" style={{ color: TIER_LABELS.gold.color, borderColor: TIER_LABELS.gold.border }}>
                    Gold: {achievements.tierCounts.gold}
                  </span>
                  <span className="profile-achieve-tier-tag" style={{ color: TIER_LABELS.silver.color, borderColor: TIER_LABELS.silver.border }}>
                    Silver: {achievements.tierCounts.silver}
                  </span>
                  <span className="profile-achieve-tier-tag" style={{ color: TIER_LABELS.bronze.color, borderColor: TIER_LABELS.bronze.border }}>
                    Bronze: {achievements.tierCounts.bronze}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="profile-achieve-category-bar">
            <button
              type="button"
              className={`profile-timeline-pill ${badgeCategoryFilter === "all" ? "profile-timeline-pill--active" : ""}`}
              onClick={() => setBadgeCategoryFilter("all")}
            >
              Toate ({achievements.badges.length})
            </button>
            <button
              type="button"
              className={`profile-timeline-pill ${badgeCategoryFilter === "git" ? "profile-timeline-pill--active" : ""}`}
              onClick={() => setBadgeCategoryFilter("git")}
            >
              Git &amp; Repository
            </button>
            <button
              type="button"
              className={`profile-timeline-pill ${badgeCategoryFilter === "docs" ? "profile-timeline-pill--active" : ""}`}
              onClick={() => setBadgeCategoryFilter("docs")}
            >
              Documentație
            </button>
            <button
              type="button"
              className={`profile-timeline-pill ${badgeCategoryFilter === "security" ? "profile-timeline-pill--active" : ""}`}
              onClick={() => setBadgeCategoryFilter("security")}
            >
              Securitate &amp; Sistem
            </button>
            <button
              type="button"
              className={`profile-timeline-pill ${badgeCategoryFilter === "community" ? "profile-timeline-pill--active" : ""}`}
              onClick={() => setBadgeCategoryFilter("community")}
            >
              Comunitate
            </button>
          </div>

          {/* Badges Grid */}
          <div className="profile-badges-grid">
            {filteredBadges.map((badge) => {
              const Icon = BADGE_ICONS[badge.iconName] || Award;
              const tierMeta = TIER_LABELS[badge.tier];

              return (
                <div
                  key={badge.id}
                  className={`profile-badge-card ${badge.unlocked ? "profile-badge-card--unlocked" : "profile-badge-card--locked"}`}
                  style={
                    badge.unlocked
                      ? ({
                          "--badge-color": tierMeta.color,
                          "--badge-border": tierMeta.border,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <div className="profile-badge-top-row">
                    <div
                      className="profile-badge-icon-box"
                      style={
                        badge.unlocked
                          ? { color: tierMeta.color, background: tierMeta.bg, borderColor: tierMeta.border }
                          : { color: "#64748b", background: "hsl(0 0% 100% / 0.03)", borderColor: "hsl(0 0% 100% / 0.08)" }
                      }
                    >
                      <Icon size={18} />
                    </div>

                    <div className="profile-badge-status-wrap">
                      <span
                        className="profile-badge-tier-pill"
                        style={{ color: tierMeta.color, borderColor: tierMeta.border, background: tierMeta.bg }}
                      >
                        {tierMeta.name}
                      </span>
                      {badge.unlocked ? (
                        <span className="profile-badge-unlocked-tag">
                          <Check size={10} className="text-emerald-400" />
                          Deblocat
                        </span>
                      ) : (
                        <span className="profile-badge-locked-tag">
                          <Lock size={10} />
                          În Progres
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="profile-badge-title">{badge.title}</h4>
                  <p className="profile-badge-desc">{badge.description}</p>

                  {/* Progress Meter */}
                  <div className="profile-badge-progress-box">
                    <div className="profile-badge-progress-header">
                      <span className="profile-badge-progress-label">{badge.progress.label}</span>
                      <span className="profile-badge-progress-pct">{badge.progress.percentage}%</span>
                    </div>
                    <div className="profile-badge-progress-track">
                      <div
                        className="profile-badge-progress-fill"
                        style={{
                          width: `${badge.progress.percentage}%`,
                          background: badge.unlocked
                            ? `linear-gradient(90deg, ${tierMeta.color}80, ${tierMeta.color})`
                            : "hsl(215 90% 50% / 0.6)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
