"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Zap,
  Terminal,
  ShieldCheck,
  Copy,
  Check,
  MessageSquare,
  X,
  RefreshCw,
  Cpu,
  BookOpen,
} from "lucide-react";

interface SummaryData {
  overview: string;
  keyTakeaways: string[];
  commands: string[];
  rulesOrRequirements: string[];
}

interface DocAiSummaryCapsuleProps {
  docTitle: string;
  docSlug: string;
  rawContent: string;
  initialOpen?: boolean;
  variant?: "top" | "inline";
  onClose?: () => void;
}

export function DocAiSummaryCapsule({
  docTitle,
  docSlug,
  rawContent,
  initialOpen = false,
  variant = "top",
  onClose,
}: DocAiSummaryCapsuleProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SummaryData | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (data || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-helper/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docTitle,
          docSlug,
          rawContent,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.summary) {
          setData(json.summary);
        }
      }
    } catch (err) {
      console.error("[AI Summary] Error loading summary:", err);
    } finally {
      setLoading(false);
    }
  }, [data, docSlug, docTitle, loading, rawContent]);

  // Listen to global toggle event (from top quick action button)
  useEffect(() => {
    const handleToggle = (e: CustomEvent<{ slug?: string; open?: boolean }>) => {
      if (!e.detail?.slug || e.detail.slug === docSlug) {
        setIsOpen((prev) => {
          const next = e.detail?.open !== undefined ? e.detail.open : !prev;
          if (next && !data) {
            setTimeout(fetchSummary, 50);
          }
          return next;
        });
      }
    };

    window.addEventListener("wf:toggle-ai-summary" as any, handleToggle);
    return () => window.removeEventListener("wf:toggle-ai-summary" as any, handleToggle);
  }, [docSlug, data, fetchSummary]);

  // Load summary immediately if initially open
  useEffect(() => {
    if (isOpen && !data) {
      fetchSummary();
    }
  }, [isOpen, data, fetchSummary]);

  const handleCopySummary = () => {
    if (!data) return;
    let text = `**[Rezumat AI 30s] ${docTitle}**\n\n`;
    text += `${data.overview}\n\n`;
    if (data.keyTakeaways?.length > 0) {
      text += `**Puncte Cheie:**\n${data.keyTakeaways.map((p) => `• ${p}`).join("\n")}\n\n`;
    }
    if (data.commands?.length > 0) {
      text += `**Comenzi:** ${data.commands.join(", ")}\n\n`;
    }
    if (data.rulesOrRequirements?.length > 0) {
      text += `**Reguli & Cerințe:**\n${data.rulesOrRequirements.map((r) => `• ${r}`).join("\n")}\n\n`;
    }
    text += `*Sursă: https://wildfire.ro/docs/${docSlug}*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  const handleOpenAiChat = () => {
    window.dispatchEvent(
      new CustomEvent("wf:open-ai", {
        detail: {
          query: `Vreau mai multe detalii și clarificări despre ghidul «${docTitle}» (/docs/${docSlug}).`,
          autoSubmit: true,
        },
      })
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`doc-ai-summary-capsule doc-ai-summary-capsule--${variant}`}
      role="region"
      aria-label={`Rezumat AI 30 secunde pentru ${docTitle}`}
    >
      {/* Background Ambient Glow */}
      <div className="doc-ai-summary-ambient-glow" aria-hidden />

      {/* Header */}
      <div className="doc-ai-summary-header">
        <div className="doc-ai-summary-header-left">
          <div className="doc-ai-summary-icon-box">
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div className="doc-ai-summary-title-wrap">
            <div className="doc-ai-summary-tags-row">
              <span className="doc-ai-summary-tag">REZUMAT INTELIGENT (30s)</span>
              <span className="doc-ai-summary-chip">
                <Cpu size={10} />
                <span>Grounded Docs AI</span>
              </span>
            </div>
            <h4 className="doc-ai-summary-title">Sinteza Esențială: {docTitle}</h4>
          </div>
        </div>

        <div className="doc-ai-summary-header-actions">
          <button
            type="button"
            className="doc-ai-summary-action-btn"
            onClick={fetchSummary}
            disabled={loading}
            title="Reîncarcă rezumatul"
            aria-label="Reîncarcă"
          >
            <RefreshCw size={12} className={loading ? "doc-ai-spin" : ""} />
          </button>
          <button
            type="button"
            className="doc-ai-summary-action-btn doc-ai-summary-action-btn--close"
            onClick={handleClose}
            title="Închide rezumatul"
            aria-label="Închide"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="doc-ai-summary-body">
        {loading ? (
          <div className="doc-ai-summary-loading">
            <div className="doc-ai-skeleton-line doc-ai-skeleton-line--lg" />
            <div className="doc-ai-skeleton-line doc-ai-skeleton-line--md" />
            <div className="doc-ai-skeleton-line doc-ai-skeleton-line--sm" />
          </div>
        ) : data ? (
          <div className="doc-ai-summary-grid">
            {/* Overview Box */}
            <div className="doc-ai-summary-box doc-ai-summary-box--overview">
              <div className="doc-ai-box-title">
                <Zap size={13} className="text-amber-400" />
                <span>Esențialul pe Scurt</span>
              </div>
              <p className="doc-ai-box-text">{data.overview}</p>
            </div>

            {/* Key Takeaways */}
            {data.keyTakeaways?.length > 0 && (
              <div className="doc-ai-summary-box doc-ai-summary-box--takeaways">
                <div className="doc-ai-box-title">
                  <BookOpen size={13} className="text-cyan-400" />
                  <span>Puncte Cheie & Pași</span>
                </div>
                <ul className="doc-ai-bullets-list">
                  {data.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="doc-ai-bullet-item">
                      <span className="doc-ai-bullet-dot" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Commands Section (if applicable) */}
            {data.commands?.length > 0 && (
              <div className="doc-ai-summary-box doc-ai-summary-box--commands">
                <div className="doc-ai-box-title">
                  <Terminal size={13} className="text-cyan-400" />
                  <span>Comenzi CS2 Extrase ({data.commands.length})</span>
                </div>
                <div className="doc-ai-commands-row">
                  {data.commands.map((cmd, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`doc-ai-cmd-pill ${copiedCmd === cmd ? "doc-ai-cmd-pill--copied" : ""}`}
                      onClick={() => handleCopyCommand(cmd)}
                      title={`Copiază comanda ${cmd}`}
                    >
                      <code>{cmd}</code>
                      {copiedCmd === cmd ? (
                        <Check size={11} className="text-emerald-400" />
                      ) : (
                        <Copy size={10} className="doc-ai-cmd-icon" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rules / Requirements Section (if applicable) */}
            {data.rulesOrRequirements?.length > 0 && (
              <div className="doc-ai-summary-box doc-ai-summary-box--rules">
                <div className="doc-ai-box-title">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Cerințe & Reguli de Bază</span>
                </div>
                <ul className="doc-ai-bullets-list doc-ai-bullets-list--rules">
                  {data.rulesOrRequirements.map((rule, idx) => (
                    <li key={idx} className="doc-ai-bullet-item">
                      <span className="doc-ai-bullet-dot doc-ai-bullet-dot--emerald" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="doc-ai-empty-text">Nu s-au putut extrage informațiile pentru acest ghid.</p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="doc-ai-summary-footer">
        <div className="doc-ai-footer-left">
          <button
            type="button"
            className="doc-ai-footer-btn"
            onClick={handleCopySummary}
            disabled={!data}
            title="Copiază întregul rezumat"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Rezumat Copiat!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copiază Rezumat</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="doc-ai-footer-btn doc-ai-footer-btn--primary"
            onClick={handleOpenAiChat}
            title="Deschide asistentul AI complet pentru întrebări suplimentare"
          >
            <MessageSquare size={12} />
            <span>Discută în Ask AI</span>
          </button>
        </div>

        <span className="doc-ai-footer-hint">
          Generat instant din cele {rawContent.length.toLocaleString()} caractere ale ghidului
        </span>
      </div>
    </div>
  );
}
