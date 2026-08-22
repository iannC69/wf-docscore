"use client";

import React, { useState } from "react";
import {
  Plus,
  Table,
  Sparkles,
  Code,
  ImageIcon,
  Play,
  Layers,
  Heading2,
  List,
  CheckSquare,
  Minus,
  MessageSquareQuote,
  X,
  Zap,
} from "lucide-react";

export interface StudioFloatingLineToolbarProps {
  cursorLine: number;
  onOpenTableBuilder: () => void;
  onOpenCalloutBuilder: () => void;
  onOpenCodeBuilder: () => void;
  onOpenMediaModal: (tab: "upload" | "vault" | "embed") => void;
  onOpenGalleryBuilder: () => void;
  onInsertQuickSnippet: (snippet: string) => void;
}

export function StudioFloatingLineToolbar({
  cursorLine,
  onOpenTableBuilder,
  onOpenCalloutBuilder,
  onOpenCodeBuilder,
  onOpenMediaModal,
  onOpenGalleryBuilder,
  onInsertQuickSnippet,
}: StudioFloatingLineToolbarProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="studio-floating-line-bar">
      <div className="studio-floating-line-anchor">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className={`studio-floating-line-trigger-btn ${expanded ? "active" : ""}`}
          title={`Instrumente Rapide la Linia ${cursorLine}`}
        >
          {expanded ? <X size={12} /> : <Plus size={12} />}
          <span className="studio-floating-line-pill-text">Linia {cursorLine}</span>
        </button>

        {expanded && (
          <div className="studio-floating-popover">
            <div className="studio-floating-popover-header">
              <span>Instrumente Inserare la Linia {cursorLine}</span>
              <button
                type="button"
                className="studio-floating-popover-close"
                onClick={() => setExpanded(false)}
              >
                <X size={11} />
              </button>
            </div>

            <div className="studio-floating-grid">
              <button
                type="button"
                className="studio-floating-item studio-floating-item--accent"
                onClick={() => {
                  setExpanded(false);
                  onOpenTableBuilder();
                }}
              >
                <Table size={14} />
                <div className="studio-floating-item-text">
                  <strong>Tabel Vizual</strong>
                  <span>Generator linii &amp; coloane</span>
                </div>
              </button>

              <button
                type="button"
                className="studio-floating-item"
                onClick={() => {
                  setExpanded(false);
                  onOpenCalloutBuilder();
                }}
              >
                <MessageSquareQuote size={14} />
                <div className="studio-floating-item-text">
                  <strong>Notă / Alertă</strong>
                  <span>Note, Tip, Important, Warning</span>
                </div>
              </button>

              <button
                type="button"
                className="studio-floating-item"
                onClick={() => {
                  setExpanded(false);
                  onOpenCodeBuilder();
                }}
              >
                <Code size={14} />
                <div className="studio-floating-item-text">
                  <strong>Bloc de Cod</strong>
                  <span>Bash, TS, JSON, CS2 cfg</span>
                </div>
              </button>

              <button
                type="button"
                className="studio-floating-item"
                onClick={() => {
                  setExpanded(false);
                  onOpenMediaModal("vault");
                }}
              >
                <ImageIcon size={14} />
                <div className="studio-floating-item-text">
                  <strong>Imagine / Asset</strong>
                  <span>Upload &amp; Media Vault</span>
                </div>
              </button>

              <button
                type="button"
                className="studio-floating-item"
                onClick={() => {
                  setExpanded(false);
                  onOpenMediaModal("embed");
                }}
              >
                <Play size={14} />
                <div className="studio-floating-item-text">
                  <strong>Video Embed</strong>
                  <span>Player YouTube / MP4</span>
                </div>
              </button>

              <button
                type="button"
                className="studio-floating-item"
                onClick={() => {
                  setExpanded(false);
                  onOpenGalleryBuilder();
                }}
              >
                <Layers size={14} />
                <div className="studio-floating-item-text">
                  <strong>Galerie Slide-uri</strong>
                  <span>Carousel multi-cadru</span>
                </div>
              </button>
            </div>

            <div className="studio-floating-divider" />

            <div className="studio-floating-quick-row">
              <button
                type="button"
                className="studio-floating-micro-btn"
                onClick={() => {
                  setExpanded(false);
                  onInsertQuickSnippet(`## Secțiune Nouă L${cursorLine}\n`);
                }}
                title="Inserează Titlu H2"
              >
                <Heading2 size={12} />
                <span>H2</span>
              </button>
              <button
                type="button"
                className="studio-floating-micro-btn"
                onClick={() => {
                  setExpanded(false);
                  onInsertQuickSnippet("- Element listă 1\n- Element listă 2\n- Element listă 3\n");
                }}
                title="Inserează Listă"
              >
                <List size={12} />
                <span>Listă</span>
              </button>
              <button
                type="button"
                className="studio-floating-micro-btn"
                onClick={() => {
                  setExpanded(false);
                  onInsertQuickSnippet("- [x] Pas completat\n- [ ] Pas în așteptare\n");
                }}
                title="Inserează Listă cu Bife (Checklist)"
              >
                <CheckSquare size={12} />
                <span>Bife</span>
              </button>
              <button
                type="button"
                className="studio-floating-micro-btn"
                onClick={() => {
                  setExpanded(false);
                  onInsertQuickSnippet("\n---\n");
                }}
                title="Inserează Separator Orizontal"
              >
                <Minus size={12} />
                <span>Linie Divider</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
