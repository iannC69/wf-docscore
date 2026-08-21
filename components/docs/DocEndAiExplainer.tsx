"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  ListOrdered,
  ShieldAlert,
  Cpu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DocAiSummaryCapsule } from "@/components/docs/DocAiSummaryCapsule";

interface DocEndAiExplainerProps {
  docTitle: string;
  docSlug: string;
  category?: string;
  rawContent?: string;
}

export function DocEndAiExplainer({
  docTitle,
  docSlug,
  category,
  rawContent = "",
}: DocEndAiExplainerProps) {
  const [customQuestion, setCustomQuestion] = useState("");
  const [showInPlaceSummary, setShowInPlaceSummary] = useState(false);

  const triggerAi = (query: string) => {
    window.dispatchEvent(
      new CustomEvent("wf:open-ai", {
        detail: {
          query,
          autoSubmit: true,
        },
      })
    );
  };

  const handleQuickPrompt = (promptType: "summary" | "key_points" | "rules") => {
    if (promptType === "summary") {
      setShowInPlaceSummary((prev) => !prev);
      return;
    }
    
    let q = "";
    if (promptType === "key_points") {
      q = `Care sunt beneficiile, pașii sau comenzile cheie explicate în ghidul «${docTitle}»?`;
    } else if (promptType === "rules") {
      q = `Care sunt cele mai importante reguli, cerințe sau sancțiuni menționate în ghidul «${docTitle}»?`;
    }
    triggerAi(q);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customQuestion.trim();
    if (!trimmed) return;

    const fullQuery = `Referitor la ghidul «${docTitle}» (/docs/${docSlug}):\n${trimmed}`;
    triggerAi(fullQuery);
    setCustomQuestion("");
  };

  return (
    <section className="doc-end-ai-card" aria-label="Asistent AI pentru această pagină">
      {/* Subtle Background Glow Accent */}
      <div className="doc-end-ai-bg-glow" aria-hidden />

      <div className="doc-end-ai-inner">
        {/* Header */}
        <div className="doc-end-ai-header">
          <div className="doc-end-ai-icon-box">
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div className="doc-end-ai-title-wrap">
            <div className="doc-end-ai-top-meta">
              <span className="doc-end-ai-pretitle">WILDFIRE AI ASSISTANT</span>
              <span className="doc-end-ai-badge">
                <Cpu size={11} className="text-amber-400" />
                <span>Grounded Docs AI</span>
              </span>
            </div>
            <h3 className="doc-end-ai-title">Ai nevoie de clarificări despre această pagină?</h3>
            <p className="doc-end-ai-desc">
              Asistentul cunoaște în detaliu ghidul <strong>«{docTitle}»</strong> și îți poate oferi explicații instant sau un rezumat la obiect.
            </p>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="doc-end-ai-chips">
          <button
            type="button"
            className={`doc-end-ai-chip ${showInPlaceSummary ? "doc-end-ai-chip--active" : ""}`}
            onClick={() => handleQuickPrompt("summary")}
            title="Generează sau ascunde rezumatul pe scurt"
          >
            <BookOpen size={12} className="text-amber-400" />
            <span>{showInPlaceSummary ? "Ascunde rezumatul" : "Rezumă acest ghid pe scurt"}</span>
            {showInPlaceSummary ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          <button
            type="button"
            className="doc-end-ai-chip"
            onClick={() => handleQuickPrompt("key_points")}
            title="Vezi punctele cheie"
          >
            <ListOrdered size={12} className="text-cyan-400" />
            <span>Explică pașii & comenzile cheie</span>
          </button>

          <button
            type="button"
            className="doc-end-ai-chip"
            onClick={() => handleQuickPrompt("rules")}
            title="Vezi regulile și cerințele"
          >
            <ShieldAlert size={12} className="text-emerald-400" />
            <span>Reguli, cerințe & sancțiuni</span>
          </button>
        </div>

        {/* In-Place Expanded AI Summary Capsule */}
        {showInPlaceSummary && (
          <div className="doc-end-ai-summary-wrapper">
            <DocAiSummaryCapsule
              docTitle={docTitle}
              docSlug={docSlug}
              rawContent={rawContent}
              initialOpen={true}
              variant="inline"
              onClose={() => setShowInPlaceSummary(false)}
            />
          </div>
        )}

        {/* Inline Quick Ask Input Bar */}
        <form onSubmit={handleSubmit} className="doc-end-ai-form">
          <div className="doc-end-ai-input-wrap">
            <input
              type="text"
              className="doc-end-ai-input"
              placeholder={`Întreabă orice despre «${docTitle}»... (ex: Cum se aplică?)`}
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="doc-end-ai-submit"
              disabled={!customQuestion.trim()}
              title="Trimite întrebarea către AI"
            >
              <Send size={13} />
              <span>Întreabă AI</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
