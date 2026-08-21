"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  X,
  Send,
  RotateCcw,
  BookOpen,
  Loader2,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Square,
  Flame,
  Sparkles,
  Maximize2,
  Minimize2,
  Sidebar,
  SlidersHorizontal,
  User,
  History,
  Plus,
  Trash2,
  Clock,
  Download,
  Share2,
  FileText,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ─── Source Badges Helper ──────────────────────────────────────────────────────
function extractDocSources(content: string): { title: string; url: string }[] {
  const sources: { title: string; url: string }[] = [];
  const linkRegex = /\[([^\]]+)\]\((\/docs\/[^)]+)\)/g;
  let match;
  const seen = new Set<string>();

  while ((match = linkRegex.exec(content)) !== null) {
    const title = match[1].trim();
    const url = match[2].trim();
    if (!seen.has(url)) {
      seen.add(url);
      sources.push({ title, url });
    }
  }
  return sources;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  interactionId?: string;
  feedback?: "helpful" | "unhelpful" | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

type ChatStatus = "idle" | "loading" | "done" | "error";

// ─── Markdown Inline Parser ────────────────────────────────────────────────────
function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    const codeMatch = remaining.match(/^`([^`]+)`/);
    const italicMatch = remaining.match(/^\*([^*]+)\*/);

    if (linkMatch) {
      const [full, linkText, linkUrl] = linkMatch;
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");
      if (isInternal) {
        nodes.push(
          <Link key={key++} href={linkUrl} className="aimd-link">
            {linkText}
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={key++}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="aimd-link"
          >
            {linkText}
            <ExternalLink size={10} className="aimd-link-icon" />
          </a>
        );
      }
      remaining = remaining.slice(full.length);
      continue;
    }

    if (boldMatch) {
      const [full, boldText] = boldMatch;
      nodes.push(<strong key={key++} className="aimd-bold">{parseInline(boldText)}</strong>);
      remaining = remaining.slice(full.length);
      continue;
    }

    if (codeMatch) {
      const [full, codeText] = codeMatch;
      nodes.push(<code key={key++} className="aimd-code">{codeText}</code>);
      remaining = remaining.slice(full.length);
      continue;
    }

    if (italicMatch) {
      const [full, italicText] = italicMatch;
      nodes.push(<em key={key++} className="aimd-italic">{parseInline(italicText)}</em>);
      remaining = remaining.slice(full.length);
      continue;
    }

    const nextSpecial = remaining.search(/(\[|\*\*|`|\*)/);
    if (nextSpecial === -1) {
      nodes.push(<span key={key++}>{remaining}</span>);
      break;
    } else if (nextSpecial === 0) {
      nodes.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    } else {
      nodes.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
      remaining = remaining.slice(nextSpecial);
    }
  }

  return nodes;
}

// ─── Markdown Block Parser ─────────────────────────────────────────────────────
function renderMarkdownBlocks(content: string): ReactNode[] {
  const lines = content.split(/\r?\n/);
  const elements: ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      elements.push(
        <pre key={key++} className="aimd-pre">
          <code className="aimd-codeblock">{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(<h4 key={key++} className="aimd-h3">{parseInline(trimmed.slice(4))}</h4>);
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(<h3 key={key++} className="aimd-h2">{parseInline(trimmed.slice(3))}</h3>);
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(<h2 key={key++} className="aimd-h1">{parseInline(trimmed.slice(2))}</h2>);
      i++;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      elements.push(<hr key={key++} className="aimd-hr" />);
      i++;
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());

        const headers = parseRow(tableLines[0]);
        const rows = tableLines.slice(2).map(parseRow);

        elements.push(
          <div key={key++} className="aimd-table-wrap">
            <table className="aimd-table">
              <thead>
                <tr>
                  {headers.map((h, hi) => (
                    <th key={hi}>{parseInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{parseInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    if (/^(\*|-)\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^(\*|-)\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^(\*|-)\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={key++} className="aimd-ul">
          {items.map((it, idx) => (
            <li key={idx} className="aimd-li">
              <span className="aimd-bullet" aria-hidden>▸</span>
              <span className="aimd-li-text">{parseInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: { num: string; text: string }[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const m = lines[i].trim().match(/^(\d+)\.\s+(.+)$/);
        if (m) {
          items.push({ num: m[1], text: m[2] });
        }
        i++;
      }
      elements.push(
        <ol key={key++} className="aimd-ol">
          {items.map((it, idx) => (
            <li key={idx} className="aimd-oli">
              <span className="aimd-num">{it.num}.</span>
              <span className="aimd-li-text">{parseInline(it.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Handle Github/MDX Callouts (e.g. > [!IMPORTANT] or [!IMPORTANT])
    const calloutMatch = trimmed.match(/^(?:>\s*)?\[!(NOTE|TIP|IMPORTANT|WARNING|DANGER)\]\s*(.*)$/i);
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const firstLine = calloutMatch[2];
      const calloutLines: string[] = firstLine ? [firstLine] : [];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith("#") &&
        !lines[i].trim().startsWith("```")
      ) {
        const cLine = lines[i].trim().replace(/^>\s*/, "");
        if (/^\[!(NOTE|TIP|IMPORTANT|WARNING|DANGER)\]/i.test(cLine)) break;
        calloutLines.push(cLine);
        i++;
      }

      elements.push(
        <div key={key++} className={`aimd-callout aimd-callout--${type}`}>
          <div className="aimd-callout-header">
            <span className="aimd-callout-badge">{type.toUpperCase()}</span>
          </div>
          <div className="aimd-callout-body">
            {parseInline(calloutLines.join(" "))}
          </div>
        </div>
      );
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++} className="aimd-quote">
          {parseInline(quoteLines.join(" "))}
        </blockquote>
      );
      continue;
    }

    elements.push(
      <p key={key++} className="aimd-p">
        {parseInline(trimmed)}
      </p>
    );
    i++;
  }

  return elements;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type LayoutMode = "side" | "modal" | "fullscreen";

// ─── Main Component ────────────────────────────────────────────────────────────
export function AiHelper() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("side");
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

  // Global event listener to open AI helper from any button
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ai-helper", handleOpen);
    return () => window.removeEventListener("open-ai-helper", handleOpen);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Cooldown countdown timer effect
  useEffect(() => {
    if (cooldownSeconds === null || cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          showToast("Cooldown expirat! Bugetul de tokeni a fost restabilit.");
          setTimeout(() => inputRef.current?.focus(), 120);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds, showToast]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Export conversation as Markdown (.md)
  const handleExportMarkdown = useCallback(() => {
    if (messages.length === 0) return;
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const title = currentSession?.title || "Conversatie";
    const dateStr = new Date().toLocaleString("ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let md = `# Conversație WildFire AI Assistant — ${title}\n\n`;
    md += `*Data:* ${dateStr}\n`;
    md += `*Platformă:* WF-DOCSCORE v1.7.0 (https://wildfire.ro)\n\n`;
    md += `---\n\n`;

    messages.forEach((m) => {
      if (m.role === "user") {
        md += `### 👤 Întrebare Utilizator:\n${m.content}\n\n`;
      } else {
        md += `### 🤖 Răspuns WildFire AI Assistant:\n${m.content}\n\n---\n\n`;
      }
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const cleanSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "conversatie";
    a.download = `wildfire-ai-${cleanSlug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Conversația a fost exportată (.md)!");
  }, [activeSessionId, messages, sessions, showToast]);

  // Copy conversation formatted for Discord
  const handleCopyDiscord = useCallback(() => {
    if (messages.length === 0) return;
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const title = currentSession?.title || "Conversație";

    let text = `**[WildFire AI Support] ${title}**\n\n`;
    messages.forEach((m) => {
      if (m.role === "user") {
        text += `> **Utilizator:** ${m.content}\n\n`;
      } else {
        text += `**WildFire Assistant:**\n${m.content}\n\n`;
      }
    });

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      showToast("Formatul Discord a fost copiat în clipboard!");
    }
  }, [activeSessionId, messages, sessions, showToast]);

  // 1. Load saved layout mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wf_ai_layout_mode") as LayoutMode | null;
      if (saved && (saved === "side" || saved === "modal" || saved === "fullscreen")) {
        setLayoutMode(saved);
      }
    } catch {}
  }, []);

  // 2. Load conversation sessions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wf_ai_chat_sessions_v3");
      const storedActiveId = localStorage.getItem("wf_ai_active_session_id");

      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const active = parsed.find((s) => s.id === storedActiveId) || parsed[0];
          setActiveSessionId(active.id);
          setMessages(
            active.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
          if (active.messages.length > 0) {
            setStatus("done");
          }
          return;
        }
      }
    } catch {}

    // Fallback: create fresh new session
    const freshId = crypto.randomUUID();
    const freshSession: ChatSession = {
      id: freshId,
      title: "Conversație Nouă",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([freshSession]);
    setActiveSessionId(freshId);
  }, []);

  const changeLayoutMode = (mode: LayoutMode) => {
    setLayoutMode(mode);
    setShowSettings(false);
    try {
      localStorage.setItem("wf_ai_layout_mode", mode);
    } catch {}
  };

  const cycleLayoutMode = () => {
    if (layoutMode === "side") changeLayoutMode("modal");
    else if (layoutMode === "modal") changeLayoutMode("fullscreen");
    else changeLayoutMode("side");
  };

  // Helper to persist updated sessions
  const syncSessionsToStorage = useCallback(
    (updatedMessages: Message[], targetSessionId = activeSessionId) => {
      if (!targetSessionId) return;

      setSessions((prev) => {
        const firstUserQuestion =
          updatedMessages.find((m) => m.role === "user")?.content.slice(0, 48).trim() ||
          "Conversație Nouă";

        const exists = prev.some((s) => s.id === targetSessionId);
        let nextSessions: ChatSession[];

        if (exists) {
          nextSessions = prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                title: s.title === "Conversație Nouă" || !s.messages.length ? firstUserQuestion : s.title,
                messages: updatedMessages,
                updatedAt: Date.now(),
              };
            }
            return s;
          });
        } else {
          nextSessions = [
            {
              id: targetSessionId,
              title: firstUserQuestion,
              messages: updatedMessages,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...prev,
          ];
        }

        try {
          localStorage.setItem("wf_ai_chat_sessions_v3", JSON.stringify(nextSessions));
          localStorage.setItem("wf_ai_active_session_id", targetSessionId);
        } catch {}

        return nextSessions;
      });
    },
    [activeSessionId]
  );

  // New Chat Action
  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: "Conversație Nouă",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessions((prev) => {
      // Keep non-empty sessions + the new one
      const updated = [newSession, ...prev.filter((s) => s.messages.length > 0)];
      try {
        localStorage.setItem("wf_ai_chat_sessions_v3", JSON.stringify(updated));
        localStorage.setItem("wf_ai_active_session_id", newId);
      } catch {}
      return updated;
    });

    setActiveSessionId(newId);
    setMessages([]);
    setStatus("idle");
    setInput("");
    setShowHistory(false);
    setShowSettings(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // Switch to an existing session
  const selectSession = useCallback(
    (id: string) => {
      abortRef.current?.abort();
      const target = sessions.find((s) => s.id === id);
      if (target) {
        setActiveSessionId(target.id);
        setMessages(target.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        setStatus(target.messages.length > 0 ? "done" : "idle");
        setShowHistory(false);
        try {
          localStorage.setItem("wf_ai_active_session_id", target.id);
        } catch {}
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [sessions]
  );

  // Delete a single session
  const deleteSession = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        let nextActive = activeSessionId;

        if (activeSessionId === id) {
          if (filtered.length > 0) {
            nextActive = filtered[0].id;
            setMessages(filtered[0].messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
            setStatus(filtered[0].messages.length > 0 ? "done" : "idle");
          } else {
            const freshId = crypto.randomUUID();
            const fresh: ChatSession = {
              id: freshId,
              title: "Conversație Nouă",
              messages: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            filtered.push(fresh);
            nextActive = freshId;
            setMessages([]);
            setStatus("idle");
          }
          setActiveSessionId(nextActive);
        }

        try {
          localStorage.setItem("wf_ai_chat_sessions_v3", JSON.stringify(filtered));
          localStorage.setItem("wf_ai_active_session_id", nextActive);
        } catch {}

        return filtered;
      });
    },
    [activeSessionId]
  );

  // Clear all history
  const clearAllHistory = useCallback(() => {
    abortRef.current?.abort();
    const freshId = crypto.randomUUID();
    const freshSession: ChatSession = {
      id: freshId,
      title: "Conversație Nouă",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([freshSession]);
    setActiveSessionId(freshId);
    setMessages([]);
    setStatus("idle");
    setShowHistory(false);
    try {
      localStorage.removeItem("wf_ai_chat_sessions_v3");
      localStorage.setItem("wf_ai_active_session_id", freshId);
    } catch {}
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Do not render public AI floating helper on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isLoading = status === "loading";
  const isCooldownActive = cooldownSeconds !== null && cooldownSeconds > 0;
  const canSubmit = !isLoading && !isCooldownActive && input.trim().length > 0;

  const thinkingSteps = useMemo(
    () => [
      "Consult indexul de 62 documente...",
      "Analizez regulamentele & comenzile...",
      "Structurez datele relevante...",
      "Formulez răspunsul oficial...",
    ],
    []
  );

  useEffect(() => {
    if (!isLoading) {
      setThinkingIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % thinkingSteps.length);
    }, 1300);
    return () => clearInterval(interval);
  }, [isLoading, thinkingSteps.length]);

  const handleCopy = (id: string, text: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("ai-drawer-open");
    } else {
      document.body.classList.remove("ai-drawer-open");
    }
    return () => {
      document.body.classList.remove("ai-drawer-open");
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (showHistory) {
          setShowHistory(false);
          return;
        }
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showHistory, showSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const executeQuery = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      const assistantId = crypto.randomUUID();
      const currentSessionId = activeSessionId || crypto.randomUUID();
      if (!activeSessionId) setActiveSessionId(currentSessionId);

      const initialMsgs = [...messages, userMsg, { id: assistantId, role: "assistant" as const, content: "", timestamp: new Date() }];
      setMessages(initialMsgs);
      syncSessionsToStorage(initialMsgs, currentSessionId);

      setInput("");
      setStatus("loading");
      if (inputRef.current) inputRef.current.style.height = "auto";

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const history = [
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            content: m.content,
          })),
          { role: "user", content: trimmed },
        ];

        const res = await fetch("/api/ai-helper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: ctrl.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const code = data.errorCode || "ERROR_WF-REQ_FAILED";
          if (res.status === 429 || code === "ERROR_WF-COOLDOWN_ACTIVE") {
            const retrySec = data.retryAfterSeconds || 45;
            setCooldownSeconds(retrySec);
            const customMsg =
              data.error ||
              `Ai atins limita temporară de tokeni. Cooldown activ: ${retrySec} secunde.\n\n\`Cod Eroare: ${code}\``;
            throw new Error(customMsg);
          }
          const customMsg = `A apărut o problemă temporară la procesarea cererii tale. Te rugăm să reîncerci peste câteva momente.\n\n\`Cod Eroare: ${code}\``;
          throw new Error(customMsg);
        }

        const interactionId = res.headers.get("x-wf-interaction-id") || undefined;
        const text = await res.text();
        const finalMsgs = initialMsgs.map((m) =>
          m.id === assistantId ? { ...m, content: text, interactionId } : m
        );
        setMessages(finalMsgs);
        syncSessionsToStorage(finalMsgs, currentSessionId);

        setStatus("done");
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg =
          err instanceof Error && err.message.startsWith("A apărut o problemă")
            ? err.message
            : "A apărut o problemă temporară de conexiune cu serverul. Te rugăm să reîncerci.\n\n`Cod Eroare: ERROR_WF-NETWORK`";
        
        const errMsgs = initialMsgs.map((m) =>
          m.id === assistantId ? { ...m, content: msg } : m
        );
        setMessages(errMsgs);
        syncSessionsToStorage(errMsgs, currentSessionId);
        setStatus("error");
      } finally {
        abortRef.current = null;
      }
    },
    [activeSessionId, isLoading, messages, syncSessionsToStorage]
  );

  // Handle helpful / unhelpful rating
  const handleFeedback = useCallback(
    async (msgId: string, type: "helpful" | "unhelpful", userQuerySnippet?: string) => {
      let interactionIdToSubmit: string | undefined;
      let nextFeedback: "helpful" | "unhelpful" | null = null;

      setMessages((prev) => {
        const updated = prev.map((m) => {
          if (m.id === msgId) {
            interactionIdToSubmit = m.interactionId;
            nextFeedback = m.feedback === type ? null : type;
            return { ...m, feedback: nextFeedback };
          }
          return m;
        });
        syncSessionsToStorage(updated, activeSessionId);
        return updated;
      });

      setTimeout(() => {
        if (nextFeedback) {
          showToast(
            nextFeedback === "helpful"
              ? "Mulțumim pentru feedback! (Răspuns util)"
              : "Mulțumim! Lucrăm la îmbunătățirea răspunsurilor."
          );

          fetch("/api/ai-helper/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              interactionId: interactionIdToSubmit,
              querySnippet: userQuerySnippet || "",
              feedback: nextFeedback,
            }),
          }).catch((err) => console.warn("[AI Feedback] Failed to sync:", err));
        }
      }, 20);
    },
    [activeSessionId, showToast, syncSessionsToStorage]
  );

  const handleSubmit = useCallback(async () => {
    executeQuery(input);
  }, [executeQuery, input]);

  // Global event listener to open AI Helper from search or any button on site
  useEffect(() => {
    const handleOpenAiEvent = (e: CustomEvent<{ query?: string; autoSubmit?: boolean }>) => {
      setIsOpen(true);
      setShowSettings(false);
      setShowHistory(false);
      const targetQuery = e.detail?.query?.trim();
      if (targetQuery) {
        if (e.detail?.autoSubmit) {
          setTimeout(() => {
            executeQuery(targetQuery);
          }, 60);
        } else {
          setInput(targetQuery);
          setTimeout(() => inputRef.current?.focus(), 120);
        }
      } else {
        setTimeout(() => inputRef.current?.focus(), 120);
      }
    };

    window.addEventListener("wf:open-ai" as any, handleOpenAiEvent);
    return () => window.removeEventListener("wf:open-ai" as any, handleOpenAiEvent);
  }, [executeQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    syncSessionsToStorage([]);
    setStatus("idle");
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Sleek 'Ask AI' Glass Pill Trigger Button */}
      <button
        id="ai-helper-toggle"
        className={`ai-pill-btn ${isOpen ? "ai-pill-btn--hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Deschide Ask AI"
        title="Deschide Asistentul AI"
      >
        <span className="ai-pill-icon-box">
          <MessageSquare size={17} />
        </span>
        <span className="ai-pill-label">Ask AI</span>
      </button>

      {/* Backdrop overlay */}
      <div
        className={`ai-backdrop ${isOpen ? "ai-backdrop--visible" : ""}`}
        onClick={() => {
          setShowSettings(false);
          setIsOpen(false);
        }}
        aria-hidden
      />

      {/* AI Panel — Responsive Layout Modes (Side Drawer / Centered Window / Fullscreen) */}
      <aside
        id="ai-helper-panel"
        className={`ai-panel ai-panel--mode-${layoutMode} ${isOpen ? "ai-panel--open" : ""}`}
        role="dialog"
        aria-label="AI Assistant"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        {/* Exact Docs Liquid Fire Background Ambient Aura */}
        <div className="ai-panel-ambient" aria-hidden>
          <div className="ai-panel-ambient-blob-1" />
          <div className="ai-panel-ambient-blob-2" />
          <div className="ai-panel-ambient-blob-3" />
        </div>

        {/* Ambient Embossed WildFire Watermark in Chat Background */}
        <div className="ai-chat-ambient-watermark" aria-hidden="true">
          <div className="ai-chat-watermark-glow" />
          <Image
            src="/logo.png"
            alt=""
            width={320}
            height={320}
            className="ai-chat-watermark-logo"
            priority
          />
        </div>

        {/* Header */}
        <div className="ai-panel-header">
          <div className="ai-panel-header-left">
            <div className="ai-panel-avatar">
              <Image
                src="/logo.png"
                alt="WildFire"
                width={20}
                height={20}
                className="ai-avatar-logo"
              />
            </div>
            <div className="ai-panel-header-titles">
              <span className="ai-panel-title">AI Assistant</span>
              <span className="ai-panel-subtitle">
                <BookOpen size={10} />
                <span>WildFire Docs</span>
              </span>
            </div>
          </div>

          <div className="ai-panel-header-actions">
            {/* New Chat Button */}
            <button
              type="button"
              className="ai-icon-btn"
              onClick={handleNewChat}
              title="Conversație Nouă"
              aria-label="Conversație Nouă"
            >
              <Plus size={14} />
            </button>

            {/* Conversation History Button */}
            <button
              type="button"
              className={`ai-icon-btn ${showHistory ? "ai-icon-btn--active" : ""}`}
              onClick={() => {
                setShowHistory(!showHistory);
                setShowSettings(false);
                setShowMoreMenu(false);
              }}
              title="Istoric Conversații"
              aria-label="Istoric Conversații"
            >
              <History size={14} />
            </button>

            {/* Quick Layout Mode Switch */}
            <button
              type="button"
              className="ai-icon-btn"
              onClick={cycleLayoutMode}
              title={
                layoutMode === "side"
                  ? "Comută pe Fereastră Centrală (Modal)"
                  : layoutMode === "modal"
                  ? "Comută pe Ecran Complet"
                  : "Comută pe Panou Lateral"
              }
              aria-label="Comută modul de afișare"
            >
              {layoutMode === "side" && <Maximize2 size={14} />}
              {layoutMode === "modal" && <Maximize2 size={14} />}
              {layoutMode === "fullscreen" && <Minimize2 size={14} />}
            </button>

            {/* Layout Settings Dropdown */}
            <div className="ai-settings-dropdown-wrap">
              <button
                type="button"
                className={`ai-icon-btn ${showSettings ? "ai-icon-btn--active" : ""}`}
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowHistory(false);
                  setShowMoreMenu(false);
                }}
                title="Preferințe layout"
                aria-label="Preferințe layout"
              >
                <SlidersHorizontal size={14} />
              </button>

              {showSettings && (
                <div className="ai-settings-popover">
                  <div className="ai-settings-popover-title">POZIȚIE & MOD AFIȘARE</div>
                  <button
                    type="button"
                    className={`ai-settings-option ${layoutMode === "side" ? "ai-settings-option--active" : ""}`}
                    onClick={() => changeLayoutMode("side")}
                  >
                    <Sidebar size={13} />
                    <div className="ai-settings-opt-text">
                      <span className="ai-settings-opt-name">Panou Lateral</span>
                      <span className="ai-settings-opt-desc">Andocat în dreapta (460px)</span>
                    </div>
                    {layoutMode === "side" && <Check size={12} className="ai-settings-check" />}
                  </button>

                  <button
                    type="button"
                    className={`ai-settings-option ${layoutMode === "modal" ? "ai-settings-option--active" : ""}`}
                    onClick={() => changeLayoutMode("modal")}
                  >
                    <Maximize2 size={13} />
                    <div className="ai-settings-opt-text">
                      <span className="ai-settings-opt-name">Fereastră Centrală</span>
                      <span className="ai-settings-opt-desc">Modal centrat (820px)</span>
                    </div>
                    {layoutMode === "modal" && <Check size={12} className="ai-settings-check" />}
                  </button>

                  <button
                    type="button"
                    className={`ai-settings-option ${layoutMode === "fullscreen" ? "ai-settings-option--active" : ""}`}
                    onClick={() => changeLayoutMode("fullscreen")}
                  >
                    <Maximize2 size={13} />
                    <div className="ai-settings-opt-text">
                      <span className="ai-settings-opt-name">Ecran Complet</span>
                      <span className="ai-settings-opt-desc">Spațiu expansiv complet</span>
                    </div>
                    {layoutMode === "fullscreen" && <Check size={12} className="ai-settings-check" />}
                  </button>
                </div>
              )}
            </div>

            {/* Conversation Actions Dropdown (Export, Copy, Clear) */}
            {messages.length > 0 && (
              <div className="ai-settings-dropdown-wrap">
                <button
                  type="button"
                  className={`ai-icon-btn ${showMoreMenu ? "ai-icon-btn--active" : ""}`}
                  onClick={() => {
                    setShowMoreMenu(!showMoreMenu);
                    setShowSettings(false);
                    setShowHistory(false);
                  }}
                  title="Opțiuni conversație"
                  aria-label="Opțiuni conversație"
                >
                  <MoreVertical size={14} />
                </button>

                {showMoreMenu && (
                  <div className="ai-settings-popover">
                    <div className="ai-settings-popover-title">OPȚIUNI CONVERSAȚIE</div>
                    <button
                      type="button"
                      className="ai-settings-option"
                      onClick={() => {
                        setShowMoreMenu(false);
                        handleExportMarkdown();
                      }}
                    >
                      <Download size={13} className="text-amber-400" />
                      <div className="ai-settings-opt-text">
                        <span className="ai-settings-opt-name">Exportă în Markdown (.md)</span>
                        <span className="ai-settings-opt-desc">Descarcă sesiunea pe disc</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="ai-settings-option"
                      onClick={() => {
                        setShowMoreMenu(false);
                        handleCopyDiscord();
                      }}
                    >
                      <Share2 size={13} className="text-cyan-400" />
                      <div className="ai-settings-opt-text">
                        <span className="ai-settings-opt-name">Copiază pentru Discord</span>
                        <span className="ai-settings-opt-desc">Formatat cu blockquote</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="ai-settings-option"
                      onClick={() => {
                        setShowMoreMenu(false);
                        handleClear();
                      }}
                    >
                      <RotateCcw size={13} className="text-rose-400" />
                      <div className="ai-settings-opt-text">
                        <span className="ai-settings-opt-name text-rose-400">Șterge Conversația</span>
                        <span className="ai-settings-opt-desc">Resetează mesajele curente</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              id="ai-helper-close"
              className="ai-icon-btn"
              onClick={() => {
                setShowSettings(false);
                setShowHistory(false);
                setShowMoreMenu(false);
                setIsOpen(false);
              }}
              title="Închide (Esc)"
              aria-label="Închide"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Floating Feedback Toast Notification */}
        {toastMessage && (
          <div className="ai-toast-pill" role="status">
            <Check size={12} className="ai-toast-icon" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Conversation History Overlay Drawer */}
        {showHistory && (
          <div className="ai-history-overlay">
            <div className="ai-history-header">
              <div className="ai-history-header-title">
                <History size={13} className="text-amber-400" />
                <span>Istoric Conversații ({sessions.length})</span>
              </div>
              <div className="ai-history-header-actions">
                <button
                  type="button"
                  className="ai-history-new-btn"
                  onClick={handleNewChat}
                  title="Începe o conversație nouă"
                >
                  <Plus size={12} />
                  <span>Conversație Nouă</span>
                </button>
                <button
                  type="button"
                  className="ai-icon-btn ai-icon-btn--sm"
                  onClick={() => setShowHistory(false)}
                  title="Închide istoricul"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="ai-history-list">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                const msgCount = sess.messages.length;
                const dateObj = new Date(sess.updatedAt || sess.createdAt);
                const dateStr = dateObj.toLocaleDateString("ro-RO", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={sess.id}
                    className={`ai-history-card ${isActive ? "ai-history-card--active" : ""}`}
                    onClick={() => selectSession(sess.id)}
                  >
                    <div className="ai-history-card-icon">
                      <MessageSquare size={13} />
                    </div>
                    <div className="ai-history-card-info">
                      <div className="ai-history-card-top">
                        <span className="ai-history-card-title">{sess.title}</span>
                        {isActive && <span className="ai-history-active-tag">ACTIVĂ</span>}
                      </div>
                      <div className="ai-history-card-meta">
                        <Clock size={10} />
                        <span>{dateStr}</span>
                        <span className="ai-history-meta-sep">·</span>
                        <span>{msgCount} {msgCount === 1 ? "mesaj" : "mesaje"}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ai-history-card-del"
                      onClick={(e) => deleteSession(sess.id, e)}
                      title="Șterge conversația"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            {sessions.length > 1 && (
              <div className="ai-history-footer">
                <button
                  type="button"
                  className="ai-history-clear-all"
                  onClick={clearAllHistory}
                >
                  <Trash2 size={11} />
                  <span>Șterge tot istoricul</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Messages Container */}
        <div className="ai-panel-messages" id="ai-helper-messages">
          {messages.length === 0 ? (
            <div className="ai-panel-empty">
              <div className="ai-empty-logo-box">
                <Image
                  src="/logo.png"
                  alt="WildFire"
                  width={36}
                  height={36}
                  className="ai-empty-logo"
                />
              </div>

              <h3 className="ai-panel-empty-title">Cum te pot ajuta?</h3>
              <p className="ai-panel-empty-desc">
                Scrie întrebarea sau problema ta legată de server sau documentație în căsuța de mai jos.
              </p>
            </div>
          ) : (
            messages.map((msg, msgIdx) => {
              const prevUserQuery =
                msg.role === "assistant"
                  ? messages
                      .slice(0, msgIdx)
                      .reverse()
                      .find((m) => m.role === "user")?.content
                  : undefined;

              return (
              <div
                key={msg.id}
                className={`ai-msg ${msg.role === "user" ? "ai-msg--user" : "ai-msg--ai"}`}
              >
                {msg.role === "assistant" ? (
                  <div className="ai-msg-avatar ai-msg-avatar--ai" aria-hidden>
                    <Image
                      src="/logo.png"
                      alt="WF"
                      width={16}
                      height={16}
                      className="ai-msg-logo"
                    />
                  </div>
                ) : (
                  <div className="ai-msg-avatar ai-msg-avatar--user" aria-hidden>
                    <User size={13} />
                  </div>
                )}
                <div className="ai-msg-bubble">
                  {msg.role === "assistant" ? (
                    <div className="ai-msg-markdown">
                      <div className="ai-msg-meta-bar">
                        <span className="ai-meta-badge">
                          <Sparkles size={10} /> WildFire Docs Intelligence
                        </span>
                        {msg.content && (
                          <div className="ai-msg-actions-cluster">
                            <div className="ai-feedback-actions" role="group" aria-label="Evaluează răspunsul">
                              <button
                                type="button"
                                className={`ai-feedback-btn ${msg.feedback === "helpful" ? "ai-feedback-btn--helpful" : ""}`}
                                onClick={() => handleFeedback(msg.id, "helpful", prevUserQuery)}
                                title={msg.feedback === "helpful" ? "Ai marcat ca util" : "Răspuns util"}
                                aria-label="Răspuns util"
                              >
                                <ThumbsUp size={11} />
                              </button>
                              <button
                                type="button"
                                className={`ai-feedback-btn ${msg.feedback === "unhelpful" ? "ai-feedback-btn--unhelpful" : ""}`}
                                onClick={() => handleFeedback(msg.id, "unhelpful", prevUserQuery)}
                                title={msg.feedback === "unhelpful" ? "Ai marcat ca nesatisfăcător" : "Răspuns nesatisfăcător"}
                                aria-label="Răspuns nesatisfăcător"
                              >
                                <ThumbsDown size={11} />
                              </button>
                            </div>

                            <button
                              type="button"
                              className="ai-msg-copy-btn"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              title="Copiază răspunsul"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check size={11} className="ai-copy-success" />
                                  <span>Copiat</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span>Copiază</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      {msg.content ? (
                        <>
                          {renderMarkdownBlocks(msg.content)}
                          {(() => {
                            const sources = extractDocSources(msg.content);
                            if (sources.length === 0) return null;
                            return (
                              <div className="ai-msg-sources-row">
                                <div className="ai-msg-sources-label">
                                  <BookOpen size={11} className="text-amber-400" />
                                  <span>Ghiduri Oficiale Conexe:</span>
                                </div>
                                <div className="ai-msg-sources-chips">
                                  {sources.map((src, sIdx) => (
                                    <Link
                                      key={sIdx}
                                      href={src.url}
                                      className="ai-source-chip"
                                      onClick={() => {
                                        if (layoutMode === "side") setIsOpen(false);
                                      }}
                                    >
                                      <BookOpen size={10} />
                                      <span>{src.title}</span>
                                      <ExternalLink size={9} />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="ai-thinking-skeleton">
                          <div className="ai-skeleton-line ai-skeleton-line--lg" />
                          <div className="ai-skeleton-line ai-skeleton-line--md" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="ai-user-bubble">
                      <p className="ai-msg-text">{msg.content}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Claude in IDE Floating Thinking Pill (Centru Jos) */}
        {isLoading && (
          <div className="ai-thinking-dock">
            <div className="ai-thinking-pill">
              <div className="ai-thinking-glow-dot">
                <Flame size={12} className="ai-thinking-flame" />
              </div>
              <span className="ai-thinking-text">{thinkingSteps[thinkingIndex]}</span>
              <div className="ai-thinking-dots">
                <span className="ai-dot" />
                <span className="ai-dot" />
                <span className="ai-dot" />
              </div>
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="ai-thinking-cancel-btn"
                title="Oprește generarea"
              >
                <Square size={9} fill="currentColor" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        )}

        {/* Cooldown Status Pill Banner */}
        {isCooldownActive && (
          <div className="ai-cooldown-dock" role="status" aria-live="polite">
            <div className="ai-cooldown-pill">
              <Clock size={12} className="text-amber-400 ai-cooldown-clock" />
              <span className="ai-cooldown-text">
                Cooldown Activ:{" "}
                <strong>
                  {Math.floor((cooldownSeconds || 0) / 60)}:
                  {(cooldownSeconds || 0) % 60 < 10
                    ? "0" + ((cooldownSeconds || 0) % 60)
                    : (cooldownSeconds || 0) % 60}
                </strong>
              </span>
              <span className="ai-cooldown-sub">Se regenerează bugetul de tokeni...</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="ai-panel-input-wrap">
          <textarea
            id="ai-helper-input"
            ref={inputRef}
            className="ai-panel-textarea"
            placeholder={
              isCooldownActive
                ? `Cooldown activ (${cooldownSeconds}s) — se regenerează bugetul...`
                : isLoading
                ? "Se generează răspunsul..."
                : "Întreabă despre server... (Enter = trimite)"
            }
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading || isCooldownActive}
            aria-label="Întrebare"
          />
          <button
            id="ai-helper-send"
            className={`ai-send-btn ${canSubmit ? "ai-send-btn--active" : ""}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Trimite"
          >
            {isLoading ? <Loader2 size={15} className="ai-spin" /> : <Send size={15} />}
          </button>
        </div>

        <div className="ai-panel-footer">
          Răspunsuri din documentația oficială &nbsp;·&nbsp; Shift+Enter = linie nouă
        </div>
      </aside>
    </>
  );
}
