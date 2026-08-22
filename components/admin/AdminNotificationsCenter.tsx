"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  RefreshCw,
  X,
  AlertTriangle,
  FileText,
  MessageSquare,
  ShieldAlert,
  Server,
  Sparkles,
  UserCheck,
  Globe,
  Filter,
  EyeOff,
  ListTodo,
  Clock,
  ArrowRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { AdminNotification, NotificationCategory, NotificationSeverity } from "@/types/notifications";

interface AdminNotificationsCenterProps {
  currentUsername: string;
}

let sharedAudioCtx: AudioContext | null = null;
let pendingChimeOnGesture = false;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Melodic executive crystal chime using native Web Audio API
 */
function playNotificationChime() {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      pendingChimeOnGesture = true;
      ctx.resume().then(() => {
        if (pendingChimeOnGesture) {
          pendingChimeOnGesture = false;
          executeChimeNotes(ctx);
        }
      }).catch(() => {});
      return;
    }

    executeChimeNotes(ctx);
  } catch {}
}

function executeChimeNotes(ctx: AudioContext) {
  try {
    const now = ctx.currentTime;

    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: A5 (880.00 Hz Sparkle)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, now + 0.09);
    gain2.gain.setValueAtTime(0, now + 0.09);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.58);

    // Tone 3: C#6 (1108.73 Hz High Crystal Glaze)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(1108.73, now + 0.18);
    gain3.gain.setValueAtTime(0, now + 0.18);
    gain3.gain.linearRampToValueAtTime(0.4, now + 0.22);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.18);
    osc3.stop(now + 0.88);
  } catch {}
}


function stripEmojis(text?: string): string {
  if (!text) return "";
  return text
    .replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{200D}]|[\u{FE0F}]/gu,
      ""
    )
    .trim();
}

function timeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Chiar acum";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Acum ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Acum ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Acum ${days}z`;
    return date.toLocaleDateString("ro-RO", { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
}

export function AdminNotificationsCenter({ currentUsername }: AdminNotificationsCenterProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [personalCount, setPersonalCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(0);
  const [scopeFilter, setScopeFilter] = useState<"all" | "personal" | "global" | "unread">("all");
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | "all">("all");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeToast, setActiveToast] = useState<AdminNotification | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevUnreadCountRef = useRef<number>(0);

  const normalizedUser = (currentUsername || "").toLowerCase().trim();

  useEffect(() => {
    setMounted(true);
    const savedSound = localStorage.getItem("wf_admin_sound_enabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }

    const unlockOnGesture = () => {
      const ctx = getOrCreateAudioContext();
      if (ctx) {
        if (ctx.state === "suspended") {
          ctx.resume().then(() => {
            if (pendingChimeOnGesture) {
              pendingChimeOnGesture = false;
              executeChimeNotes(ctx);
            }
          }).catch(() => {});
        } else if (pendingChimeOnGesture) {
          pendingChimeOnGesture = false;
          executeChimeNotes(ctx);
        }
      }
    };

    window.addEventListener("pointerdown", unlockOnGesture, { passive: true });
    window.addEventListener("click", unlockOnGesture, { passive: true });
    window.addEventListener("keydown", unlockOnGesture, { passive: true });
    window.addEventListener("touchstart", unlockOnGesture, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockOnGesture);
      window.removeEventListener("click", unlockOnGesture);
      window.removeEventListener("keydown", unlockOnGesture);
      window.removeEventListener("touchstart", unlockOnGesture);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("wf_admin_sound_enabled", String(next));
    if (next) playNotificationChime();
  };

  const showToastNotification = (notif: AdminNotification) => {
    setActiveToast(notif);
    if (soundEnabled) {
      playNotificationChime();
    }
  };

  // Load notifications from API
  const fetchNotifications = async (isInitial = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        const list: AdminNotification[] = data.notifications || [];
        const unread: number = data.unreadCount || 0;
        
        setNotifications(list);
        setUnreadCount(unread);
        setPersonalCount(data.personalCount || 0);
        setGlobalCount(data.globalCount || 0);

        // Announce on initial entry if unread notifications exist
        if (isInitial && unread > 0 && list.length > 0) {
          const firstUnread = list.find((n) => {
            return !n.readBy?.includes(currentUsername) && !n.readBy?.includes(normalizedUser);
          }) || list[0];
          
          showToastNotification(firstUnread);
        } else if (!isInitial && unread > prevUnreadCountRef.current && list.length > 0) {
          const latest = list[0];
          showToastNotification(latest);
        }

        prevUnreadCountRef.current = unread;
      }
    } catch (err) {
      console.error("[NotificationsCenter] Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll on mount and every 20 seconds
  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 20000);
    return () => clearInterval(interval);
  }, []);

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", id }),
      });

      setNotifications((prev) => {
        const nextList = prev.map((n) => {
          if (n.id === id) {
            const readBy = n.readBy || [];
            if (!readBy.includes(currentUsername)) {
              return { ...n, readBy: [...readBy, currentUsername] };
            }
          }
          return n;
        });

        if (activeToast?.id === id) {
          const nextUnread = nextList.find(
            (n) => n.id !== id && !n.readBy?.includes(currentUsername) && !n.readBy?.includes(normalizedUser)
          );
          setActiveToast(nextUnread || null);
        }

        return nextList;
      });

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_all" }),
      });

      setNotifications((prev) =>
        prev.map((n) => {
          const readBy = n.readBy || [];
          if (!readBy.includes(currentUsername)) {
            return { ...n, readBy: [...readBy, currentUsername] };
          }
          return n;
        })
      );
      setUnreadCount(0);
      setActiveToast(null);
    } catch {}
  };

  // Delete notification
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (activeToast?.id === id) setActiveToast(null);
      fetchNotifications();
    } catch {}
  };

  // Filter list in memory
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isRead = n.readBy?.includes(currentUsername) || n.readBy?.includes(normalizedUser);
      const isPersonal = n.targetUser && n.targetUser.toLowerCase().trim() === normalizedUser;
      const isGlobal = n.isGlobal || !n.targetUser;

      // Scope
      if (scopeFilter === "personal" && !isPersonal) return false;
      if (scopeFilter === "global" && !isGlobal) return false;
      if (scopeFilter === "unread" && isRead) return false;

      // Category
      if (categoryFilter !== "all" && n.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = n.title?.toLowerCase().includes(query);
        const matchesMsg = n.message?.toLowerCase().includes(query);
        const matchesUser = n.targetUser?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMsg && !matchesUser) return false;
      }

      return true;
    });
  }, [notifications, scopeFilter, categoryFilter, searchQuery, currentUsername, normalizedUser]);

  const renderCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "task":
        return (
          <div className="admin-notify-cat-icon-wrap admin-notify-cat-icon-wrap--task" title="Sarcini & TODO">
            <ListTodo size={14} />
          </div>
        );
      case "report":
        return (
          <div className="admin-notify-cat-icon-wrap admin-notify-cat-icon-wrap--report" title="Raport Jucător">
            <AlertTriangle size={14} />
          </div>
        );
      case "feedback":
        return (
          <div className="admin-notify-cat-icon-wrap admin-notify-cat-icon-wrap--feedback" title="Feedback Document">
            <MessageSquare size={14} />
          </div>
        );
      case "security":
        return (
          <div className="admin-notify-cat-icon-wrap admin-notify-cat-icon-wrap--security" title="Securitate & 2FA">
            <ShieldAlert size={14} />
          </div>
        );
      case "system":
        return (
          <div className="admin-notify-cat-icon-wrap admin-notify-cat-icon-wrap--system" title="Sistem & Mentenanță">
            <Server size={14} />
          </div>
        );
      case "ai":
        return (
          <div className="admin-notify-cat-icon-wrap admin-notify-cat-icon-wrap--ai" title="AI Analytics">
            <Sparkles size={14} />
          </div>
        );
      default:
        return (
          <div className="admin-notify-cat-icon-wrap" title="Notificare">
            <Bell size={14} />
          </div>
        );
    }
  };

  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case "urgent":
        return <span className="notif-severity-badge notif-severity-badge--urgent">URGENT</span>;
      case "warning":
        return <span className="notif-severity-badge notif-severity-badge--warning">ATENȚIE</span>;
      case "success":
        return <span className="notif-severity-badge notif-severity-badge--success">SUCCES</span>;
      default:
        return <span className="notif-severity-badge notif-severity-badge--info">INFO</span>;
    }
  };

  return (
    <div className="admin-notifications-center" ref={containerRef}>
      {/* ── Notification Bell Trigger Button ── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) fetchNotifications();
        }}
        className={`admin-notify-bell-btn ${isOpen ? "admin-notify-bell-btn--active" : ""}`}
        title={`Centru de Notificări & Alerte (${unreadCount} necitite)`}
        aria-label="Deschide Centrul de Notificări"
      >
        <Bell size={16} className="admin-notify-bell-icon" />
        {unreadCount > 0 && (
          <span className="admin-notify-counter-badge" aria-label={`${unreadCount} notificări necitite`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Mobile Modal Backdrop Overlay ── */}
      {isOpen && (
        <div
          className="admin-notify-mobile-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Notification Flyout Panel ── */}
      {isOpen && (
        <div className="admin-notify-flyout" role="dialog" aria-modal="true">
          {/* Pinned Top Navigation & Filtering Controls */}
          <div className="admin-notify-top-pinned">
            {/* Header */}
            <div className="admin-notify-flyout-header">
              <div className="admin-notify-title-group">
                <div className="admin-notify-header-icon-box">
                  <Bell size={16} className="text-amber-400" />
                </div>
                <div>
                  <h4 className="admin-notify-flyout-title">Centru de Notificări &amp; Alerte</h4>
                  <p className="admin-notify-flyout-sub">
                    {unreadCount > 0
                      ? `${unreadCount} ${unreadCount === 1 ? "notificare necitită" : "notificări necitite"}`
                      : "Toate notificările sunt la zi"}
                  </p>
                </div>
              </div>

              <div className="admin-notify-header-actions">
                {/* Sound Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`admin-notify-head-btn ${soundEnabled ? "admin-notify-head-btn--active" : ""}`}
                  title={soundEnabled ? "Sunet activat (click pentru silențios)" : "Sunet oprit (click pentru activare)"}
                >
                  {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => fetchNotifications(false)}
                  disabled={loading}
                  className="admin-notify-head-btn"
                  title="Reîmprospătează notificările"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="admin-notify-head-btn admin-notify-head-btn--primary"
                    title="Marchează toate ca citite"
                  >
                    <CheckCheck size={14} />
                    <span>Citește Tot</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="admin-notify-head-btn admin-notify-head-btn--close"
                  title="Închide"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Quick Search Box inside flyout */}
            <div className="admin-notify-search-bar">
              <Filter size={13} className="text-zinc-500" />
              <input
                type="text"
                placeholder="Caută în notificări & alerte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-notify-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="admin-notify-search-clear"
                  title="Șterge căutarea"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Scope Filters (Toate / Personale / Globale / Necitite) */}
            <div className="admin-notify-scope-tabs">
              <button
                type="button"
                onClick={() => setScopeFilter("all")}
                className={`admin-notify-scope-btn ${scopeFilter === "all" ? "active" : ""}`}
              >
                <span>Toate</span>
                <span className="admin-notify-tab-count">{notifications.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setScopeFilter("personal")}
                className={`admin-notify-scope-btn ${scopeFilter === "personal" ? "active" : ""}`}
              >
                <UserCheck size={13} className="text-amber-400" />
                <span>Personale</span>
                {personalCount > 0 && (
                  <span className="admin-notify-tab-count admin-notify-tab-count--personal">
                    {personalCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setScopeFilter("global")}
                className={`admin-notify-scope-btn ${scopeFilter === "global" ? "active" : ""}`}
              >
                <Globe size={13} className="text-emerald-400" />
                <span>Globale</span>
                <span className="admin-notify-tab-count">{globalCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setScopeFilter("unread")}
                className={`admin-notify-scope-btn ${scopeFilter === "unread" ? "active" : ""}`}
              >
                <EyeOff size={13} className="text-rose-400" />
                <span>Necitite</span>
                {unreadCount > 0 && (
                  <span className="admin-notify-tab-count admin-notify-tab-count--unread">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="admin-notify-category-bar">
              {[
                { id: "all", label: "Toate Tipurile" },
                { id: "task", label: "Sarcini TODO" },
                { id: "report", label: "Rapoarte Jucători" },
                { id: "feedback", label: "Feedback" },
                { id: "security", label: "Securitate" },
                { id: "system", label: "Sistem" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`admin-notify-cat-chip ${categoryFilter === cat.id ? "active" : ""}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Scrollable List */}
          <div className="admin-notify-list">
            {filteredNotifications.length === 0 ? (
              <div className="admin-notify-empty-state">
                <div className="admin-notify-empty-icon">
                  <Sparkles size={28} className="text-amber-400" />
                </div>
                <h5>Nicio notificare găsită</h5>
                <p>Nu există evenimente active pentru filtrul sau căutarea selectată.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead =
                  notif.readBy?.includes(currentUsername) ||
                  notif.readBy?.includes(normalizedUser);
                const isPersonal =
                  notif.targetUser &&
                  notif.targetUser.toLowerCase().trim() === normalizedUser;

                return (
                  <div
                    key={notif.id}
                    className={`admin-notify-card ${!isRead ? "admin-notify-card--unread" : ""} ${
                      isPersonal ? "admin-notify-card--personal" : ""
                    }`}
                    onClick={() => {
                      if (!isRead) handleMarkAsRead(notif.id);
                    }}
                  >
                    <div className="admin-notify-card-top">
                      <div className="admin-notify-card-badge-box">
                        {renderCategoryIcon(notif.category)}

                        {/* Scope Pill */}
                        {isPersonal ? (
                          <span className="notif-scope-pill notif-scope-pill--personal">
                            <UserCheck size={11} />
                            <span>Personal @{notif.targetUser}</span>
                          </span>
                        ) : (
                          <span className="notif-scope-pill notif-scope-pill--global">
                            <Globe size={11} />
                            <span>Echipă &amp; Sistem</span>
                          </span>
                        )}

                        {getSeverityBadge(notif.severity)}
                      </div>

                      <div className="admin-notify-card-actions">
                        <span className="admin-notify-time" title={new Date(notif.createdAt).toLocaleString()}>
                          <Clock size={11} />
                          <span>{timeAgo(notif.createdAt)}</span>
                        </span>

                        {!isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="notif-card-mini-btn"
                            title="Marchează ca citit"
                          >
                            <Check size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDelete(notif.id, e)}
                          className="notif-card-mini-btn notif-card-mini-btn--delete"
                          title="Șterge notificarea"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h5 className="admin-notify-card-title">{stripEmojis(notif.title)}</h5>
                    <p className="admin-notify-card-msg">{stripEmojis(notif.message)}</p>

                    {notif.link && (
                      <div className="admin-notify-card-footer">
                        <a
                          href={notif.link}
                          onClick={() => {
                            if (!isRead) handleMarkAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="admin-notify-action-link"
                        >
                          <span>Deschide Modulul Relevant</span>
                          <ArrowRight size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Floating Liquid Glass Toast Notification (Right Side Entrance) ── */}
      {mounted && activeToast && createPortal(
        <div className="admin-notify-toast-wrap" role="alert" aria-live="assertive">
          <div className="admin-notify-toast">
            <div className="admin-notify-toast-glow" aria-hidden="true" />
            <div className="admin-notify-toast-header">
              <div className="admin-notify-toast-badge-box">
                {renderCategoryIcon(activeToast.category)}
                <span className="admin-notify-toast-tag">
                  {activeToast.targetUser ? `@${activeToast.targetUser}` : "Alerte Live Admin"}
                </span>
                {unreadCount > 1 && (
                  <span className="admin-notify-toast-queue-badge">
                    +{unreadCount - 1} alerte
                  </span>
                )}
                {getSeverityBadge(activeToast.severity)}
              </div>

              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="admin-notify-toast-close"
                aria-label="Închide alerta"
              >
                <X size={14} />
              </button>
            </div>

            <div className="admin-notify-toast-body">
              <h6 className="admin-notify-toast-title">{stripEmojis(activeToast.title)}</h6>
              <p className="admin-notify-toast-msg">{stripEmojis(activeToast.message)}</p>
            </div>

            <div className="admin-notify-toast-footer">
              <span className="admin-notify-toast-time">
                <Clock size={11} />
                <span>{timeAgo(activeToast.createdAt)}</span>
              </span>

              <div className="admin-notify-toast-btns">
                {activeToast.link && (
                  <a
                    href={activeToast.link}
                    onClick={() => {
                      handleMarkAsRead(activeToast.id);
                      setActiveToast(null);
                    }}
                    className="admin-notify-toast-action-btn"
                  >
                    <span>Deschide</span>
                    <ArrowRight size={11} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleMarkAsRead(activeToast.id);
                    setActiveToast(null);
                  }}
                  className="admin-notify-toast-read-btn"
                >
                  <Check size={12} />
                  <span>Am văzut</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
