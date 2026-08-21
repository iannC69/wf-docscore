"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  FilePlus,
  X,
  Send,
  CheckCircle2,
  HelpCircle,
  Link2,
  FileText,
  Clock,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ShieldAlert,
} from "lucide-react";

interface DocReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlug?: string;
  initialTab?: "issue" | "request";
}

const ISSUE_TYPES = [
  { id: "unclear_command", label: "Comandă Neclară / Greșită", icon: AlertTriangle, color: "#f59e0b" },
  { id: "broken_link", label: "Link Rupt / 404", icon: Link2, color: "#f43f5e" },
  { id: "outdated_info", label: "Informații Învechite", icon: Clock, color: "#ff6b00" },
  { id: "typo", label: "Greșeală Text / Formatare", icon: FileText, color: "#06b6d4" },
  { id: "missing_media", label: "Lipsă Imagine / Schemă", icon: ImageIcon, color: "#8b5cf6" },
  { id: "other", label: "Altă Problemă", icon: HelpCircle, color: "#10b981" },
];

const GUIDE_CATEGORIES = [
  { id: "systems", label: "Sisteme Jucători", color: "#06b6d4" },
  { id: "factions", label: "Facțiuni & Organizații", color: "#10b981" },
  { id: "rules", label: "Regulamente & Conduită", color: "#f59e0b" },
  { id: "staff", label: "Proceduri Staff", color: "#8b5cf6" },
  { id: "economy", label: "Economie & Joburi", color: "#eab308" },
  { id: "other", label: "Alte Sisteme", color: "#64748b" },
];

export function DocReportModal({ isOpen, onClose, currentSlug, initialTab = "issue" }: DocReportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"issue" | "request">(initialTab);
  const [issueType, setIssueType] = useState<string>("unclear_command");
  const [category, setCategory] = useState<string>("systems");
  const [severity, setSeverity] = useState<"normal" | "medium" | "high">("normal");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [contactDiscord, setContactDiscord] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setError(null);
    }
  }, [isOpen, initialTab]);


  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleResetAndClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/docs/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab === "request" ? "new_guide_request" : "issue",
          slug: currentSlug || "general",
          issueType: activeTab === "issue" ? issueType : undefined,
          category: activeTab === "request" ? category : undefined,
          severity: activeTab === "issue" ? severity : undefined,
          title: activeTab === "request" ? title : undefined,
          description: description.trim(),
          contactDiscord: contactDiscord.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "A apărut o eroare la trimitere.");
      }
    } catch {
      setError("Conexiunea cu serverul a eșuat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setDescription("");
    setTitle("");
    setContactDiscord("");
    setError(null);
    onClose();
  };

  const modalContent = (
    <div className="doc-report-overlay" onClick={handleResetAndClose}>
      <div
        className="doc-report-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="doc-report-glow" aria-hidden="true" />

        {/* Modal Header */}
        <div className="doc-report-header">
          <div className="doc-report-header-title-box">
            <div className="doc-report-header-icon-wrap">
              {activeTab === "issue" ? (
                <AlertTriangle size={18} className="text-amber-400" />
              ) : (
                <FilePlus size={18} className="text-cyan-400" />
              )}
            </div>
            <div>
              <h3 className="doc-report-title">
                {activeTab === "issue" ? "Raportează o Problemă în Ghid" : "Solicită un Ghid Nou"}
              </h3>
              <p className="doc-report-sub">
                {activeTab === "issue"
                  ? `Document: ${currentSlug ? `/docs/${currentSlug}` : "Ghid Curent"}`
                  : "Sugerează un subiect sau o mecanică lipsă din documentație"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="doc-report-close-btn"
            onClick={handleResetAndClose}
            aria-label="Închide fereastra"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs: Issue vs Request */}
        <div className="doc-report-tabs">
          <button
            type="button"
            className={`doc-report-tab-btn ${activeTab === "issue" ? "doc-report-tab-btn--active" : ""}`}
            onClick={() => { setActiveTab("issue"); setError(null); }}
          >
            <AlertTriangle size={14} className="text-amber-400" />
            <span>Raportează Eroare</span>
          </button>
          <button
            type="button"
            className={`doc-report-tab-btn ${activeTab === "request" ? "doc-report-tab-btn--active" : ""}`}
            onClick={() => { setActiveTab("request"); setError(null); }}
          >
            <FilePlus size={14} className="text-cyan-400" />
            <span>Solicită Ghid Nou</span>
          </button>
        </div>

        {submitted ? (
          <div className="doc-report-success-view">
            <div className="doc-report-success-icon-wrap">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h4 className="doc-report-success-title">
              {activeTab === "issue" ? "Raport Înregistrat cu Succes!" : "Cerere Trimisă cu Succes!"}
            </h4>
            <p className="doc-report-success-desc">
              Îți mulțumim pentru contribuție! Echipa de documentație a fost notificată și va analiza solicitarea în cel mai scurt timp.
            </p>
            <button
              type="button"
              className="doc-report-submit-action"
              onClick={handleResetAndClose}
              style={{ marginTop: "12px" }}
            >
              Închide
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="doc-report-form">
            {error && (
              <div className="admin-status-message admin-status-message--error" style={{ marginBottom: "8px" }}>
                <ShieldAlert size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: Issue Report Fields */}
            {activeTab === "issue" && (
              <>
                {/* Issue Type Pills Grid */}
                <div className="doc-report-section">
                  <label className="doc-report-label">Tipul Problemei *</label>
                  <div className="doc-report-pills-grid">
                    {ISSUE_TYPES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = issueType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`doc-report-pill-choice ${isSelected ? "doc-report-pill-choice--active" : ""}`}
                          onClick={() => setIssueType(t.id)}
                          style={
                            isSelected
                              ? { borderColor: t.color, color: t.color, background: `${t.color}15` }
                              : undefined
                          }
                        >
                          <Icon size={13} style={{ color: t.color }} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Severity Choice */}
                <div className="doc-report-severity-row">
                  <label className="doc-report-label">Nivel Severitate:</label>
                  <div className="doc-report-severity-btns">
                    <button
                      type="button"
                      onClick={() => setSeverity("normal")}
                      className={`doc-report-sev-btn doc-report-sev-btn--normal ${severity === "normal" ? "active" : ""}`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeverity("medium")}
                      className={`doc-report-sev-btn doc-report-sev-btn--medium ${severity === "medium" ? "active" : ""}`}
                    >
                      Moderat
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeverity("high")}
                      className={`doc-report-sev-btn doc-report-sev-btn--high ${severity === "high" ? "active" : ""}`}
                    >
                      Critic
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Guide Request Fields */}
            {activeTab === "request" && (
              <>
                {/* Category Pills */}
                <div className="doc-report-section">
                  <label className="doc-report-label">Categorie Ghid Solicitat *</label>
                  <div className="doc-report-pills-grid">
                    {GUIDE_CATEGORIES.map((cat) => {
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`doc-report-pill-choice ${isSelected ? "doc-report-pill-choice--active" : ""}`}
                          onClick={() => setCategory(cat.id)}
                          style={
                            isSelected
                              ? { borderColor: cat.color, color: cat.color, background: `${cat.color}15` }
                              : undefined
                          }
                        >
                          <Layers size={13} style={{ color: cat.color }} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Proposed Title */}
                <div className="doc-report-field">
                  <label className="doc-report-label">Titlul Propus pentru Ghid</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Cum funcționează sistemul de transferuri bancare"
                    className="doc-report-input"
                    maxLength={100}
                  />
                </div>
              </>
            )}

            {/* Description Field */}
            <div className="doc-report-field">
              <label className="doc-report-label">
                {activeTab === "issue" ? "Descrierea Erorii sau a Inexactității *" : "Ce ar trebui să cuprindă acest ghid? *"}
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  activeTab === "issue"
                    ? "Specifică exact comanda, secțiunea sau textul care conține erori..."
                    : "Descrie pe scurt detaliile și mecanicile pe care dorești să le explicăm..."
                }
                className="doc-report-textarea"
                maxLength={800}
              />
            </div>

            {/* Contact Discord (Optional) */}
            <div className="doc-report-field">
              <label className="doc-report-label">
                Tag / Username Discord (Opțional — pentru clarificări dacă este nevoie)
              </label>
              <input
                type="text"
                value={contactDiscord}
                onChange={(e) => setContactDiscord(e.target.value)}
                placeholder="Ex: player#0001 sau username"
                className="doc-report-input"
                maxLength={50}
              />
            </div>

            {/* Modal Actions */}
            <div className="doc-report-actions">
              <button
                type="button"
                className="doc-report-cancel-btn"
                onClick={handleResetAndClose}
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="doc-report-submit-action"
              >
                <Send size={13} />
                <span>{submitting ? "Se trimite..." : "Trimite Către Echipă"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
