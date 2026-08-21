"use client";

import React, { useState, useEffect } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  MessageSquare,
  Send,
  Sparkles,
  Flame,
  HelpCircle,
  AlertTriangle,
  FilePlus,
} from "lucide-react";
import type { FeedbackStats } from "@/lib/db/types";
import { DocReportModal } from "@/components/docs/DocReportModal";

interface FeedbackWidgetProps {
  slug?: string;
  initialStats?: FeedbackStats;
}


export function FeedbackWidget({ slug, initialStats }: FeedbackWidgetProps) {
  const [voted, setVoted] = useState<"helpful" | "unhelpful" | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [commentSent, setCommentSent] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"issue" | "request">("issue");
  const [stats, setStats] = useState<FeedbackStats>(
    initialStats || { helpful: 0, unhelpful: 0, total: 0, percentage: 100 }
  );

  const cleanSlug = slug?.replace(/^\/+|\/+$/g, "") || "";

  useEffect(() => {
    if (!cleanSlug) return;
    const localVote = localStorage.getItem(`wf_voted_${cleanSlug}`) as "helpful" | "unhelpful" | null;
    const localFbId = localStorage.getItem(`wf_fbid_${cleanSlug}`);
    if (localVote) {
      setVoted(localVote);
    }
    if (localFbId) {
      setFeedbackId(localFbId);
    }

    async function loadStats() {
      try {
        const res = await fetch(`/api/docs/feedback?slug=${encodeURIComponent(cleanSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch {}
    }
    loadStats();

    const handleOpenReport = (e: any) => {
      if (e?.detail?.tab) {
        setModalTab(e.detail.tab);
      }
      setReportModalOpen(true);
    };

    window.addEventListener("open-doc-report", handleOpenReport);
    return () => window.removeEventListener("open-doc-report", handleOpenReport);
  }, [cleanSlug]);



  const handleVote = async (rating: "helpful" | "unhelpful") => {
    if (!cleanSlug || submitting) return;

    setVoted(rating);
    localStorage.setItem(`wf_voted_${cleanSlug}`, rating);
    setShowCommentBox(true);

    try {
      const res = await fetch("/api/docs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: cleanSlug, rating }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.feedback?.id) {
          setFeedbackId(data.feedback.id);
          localStorage.setItem(`wf_fbid_${cleanSlug}`, data.feedback.id);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to submit vote", err);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanSlug || !comment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/docs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: cleanSlug,
          rating: voted || "helpful",
          comment: comment.trim(),
          feedbackId: feedbackId || undefined,
        }),
      });

      if (res.ok) {
        setCommentSent(true);
        setShowCommentBox(false);
      }
    } catch (err) {
      console.error("Failed to submit comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-liquid-wrapper" aria-label="Feedback documentație">
      <div className="feedback-liquid-card">
        {/* Glow Specular Aura */}
        <div className="feedback-liquid-glow" aria-hidden="true" />

        {/* Top Header Row */}
        <div className="feedback-liquid-header">
          <div className="feedback-liquid-left">
            <div className="feedback-liquid-icon-box">
              <Flame size={16} className="feedback-flame-icon" />
            </div>

            <div className="feedback-liquid-title-group">
              <div className="feedback-liquid-title-row">
                <span className="feedback-liquid-title">A fost util acest ghid?</span>
                <span className="feedback-liquid-pill-tag">Feedback Comunitate</span>
              </div>
              <p className="feedback-liquid-subtitle">
                Părerea ta ajută echipa WildFire să mențină informațiile la zi.
              </p>
            </div>
          </div>

          {/* Real Community Rating Pill */}
          {stats.total > 0 && (
            <div className="feedback-liquid-stats-pill" title={`${stats.helpful} din ${stats.total} voturi pozitive`}>
              <span className="feedback-liquid-stats-dot" />
              <span className="feedback-liquid-stats-pct font-mono">{stats.percentage}% util</span>
              <span className="feedback-liquid-stats-count font-mono">({stats.total} {stats.total === 1 ? "vot" : "voturi"})</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!voted ? (
          <div className="feedback-liquid-actions">
            <button
              type="button"
              className="feedback-liquid-btn feedback-liquid-btn--yes"
              onClick={() => handleVote("helpful")}
              aria-label="Marchează ghidul ca util"
            >
              <span className="feedback-btn-icon-wrap feedback-btn-icon-wrap--emerald">
                <ThumbsUp size={14} />
              </span>
              <span className="feedback-btn-text">Da, foarte util</span>
            </button>

            <button
              type="button"
              className="feedback-liquid-btn feedback-liquid-btn--no"
              onClick={() => handleVote("unhelpful")}
              aria-label="Marchează ghidul ca necesitând îmbunătățiri"
            >
              <span className="feedback-btn-icon-wrap feedback-btn-icon-wrap--rose">
                <ThumbsDown size={14} />
              </span>
              <span className="feedback-btn-text">Nu, am nevoie de detalii</span>
            </button>
          </div>
        ) : (
          <div className="feedback-liquid-voted-banner">
            <div className="feedback-liquid-thanks-box">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>
                {voted === "helpful"
                  ? "Mulțumim! Votul tău pozitiv a fost salvat."
                  : "Mulțumim! Am înregistrat votul și vom actualiza acest ghid."}
              </span>
            </div>
          </div>
        )}

        {/* Optional Comment / Suggestion Box */}
        {showCommentBox && !commentSent && (
          <form onSubmit={handleSendComment} className="feedback-liquid-form">
            <div className="feedback-liquid-form-header">
              <MessageSquare size={13} className="text-cyan-400" />
              <span>Ce putem adăuga sau clarifica în acest document? (opțional)</span>
            </div>

            <div className="feedback-liquid-input-row">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex: Adăugați o comandă suplimentară sau clarificați durata..."
                rows={2}
                className="feedback-liquid-textarea"
                maxLength={400}
              />
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="feedback-liquid-submit-btn"
                title="Trimite feedback-ul"
              >
                <Send size={13} />
                <span>Trimite</span>
              </button>
            </div>
          </form>
        )}

        {commentSent && (
          <div className="feedback-liquid-success-box">
            <Sparkles size={14} className="text-amber-400" />
            <span>Sugestia ta a fost trimisă cu succes către echipa de documentație!</span>
          </div>
        )}

        {/* Bottom Report / Request Action Link Bar */}
        <div className="feedback-liquid-report-footer">
          <div className="feedback-report-pills-cluster">
            <button
              type="button"
              className="feedback-report-pill-btn feedback-report-pill-btn--issue"
              onClick={() => {
                setModalTab("issue");
                setReportModalOpen(true);
              }}
              aria-label="Raportează o problemă sau eroare în acest ghid"
            >
              <AlertTriangle size={12} className="feedback-pill-icon feedback-pill-icon--amber" />
              <span>Raportează o eroare în ghid</span>
            </button>

            <span className="feedback-report-cluster-sep" aria-hidden="true" />

            <button
              type="button"
              className="feedback-report-pill-btn feedback-report-pill-btn--request"
              onClick={() => {
                setModalTab("request");
                setReportModalOpen(true);
              }}
              aria-label="Solicită un ghid nou pentru comunitate"
            >
              <FilePlus size={12} className="feedback-pill-icon feedback-pill-icon--cyan" />
              <span>Solicită ghid nou</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Liquid Glass Report Modal */}
      <DocReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        currentSlug={cleanSlug}
        initialTab={modalTab}
      />
    </div>
  );
}


