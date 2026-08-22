"use client";

import React, { useState } from "react";
import {
  Info,
  Sparkles,
  TriangleAlert,
  ShieldAlert,
  Zap,
  Check,
  X,
  Wand2,
  FileText,
  Copy,
  ChevronRight,
  MessageSquareQuote,
} from "lucide-react";

export type CalloutType = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

export interface StudioCalloutBuilderProps {
  cursorLine: number;
  onInsert: (markdownCallout: string) => void;
  onClose: () => void;
  initialType?: CalloutType;
}

interface CalloutPreset {
  id: string;
  type: CalloutType;
  name: string;
  title: string;
  text: string;
}

const CALLOUT_TYPES: {
  type: CalloutType;
  label: string;
  desc: string;
  icon: any;
  badgeClass: string;
}[] = [
  {
    type: "NOTE",
    label: "Note (Informativ)",
    desc: "Informații de context, mențiuni generale și detalii utile",
    icon: Info,
    badgeClass: "callout-badge--note",
  },
  {
    type: "TIP",
    label: "Tip (Sfat Practic)",
    desc: "Recomandări, scurtături și optimizări pentru jucători",
    icon: Sparkles,
    badgeClass: "callout-badge--tip",
  },
  {
    type: "IMPORTANT",
    label: "Important (Esențial)",
    desc: "Cerințe obligatorii, pași de reținut și permisiuni de bază",
    icon: TriangleAlert,
    badgeClass: "callout-badge--important",
  },
  {
    type: "WARNING",
    label: "Warning (Avertisment)",
    desc: "Măsuri de precauție, restricții și riscuri de sancționare",
    icon: ShieldAlert,
    badgeClass: "callout-badge--warning",
  },
  {
    type: "CAUTION",
    label: "Caution (Critic / Risc)",
    desc: "Consecințe ireversibile, pierderi de credite sau comenzi riscante",
    icon: Zap,
    badgeClass: "callout-badge--caution",
  },
];

const CALLOUT_PRESETS: CalloutPreset[] = [
  {
    id: "cs2-connect",
    type: "NOTE",
    name: "Conectare Server CS2",
    title: "Conectare Server Oficial",
    text: "Asigură-te că ești conectat pe serverul oficial de CS2 (`connect cs2.wildfire.ro`) înainte de a rula comenzile specificate.",
  },
  {
    id: "vip-activation",
    type: "TIP",
    name: "Activare Instantă VIP",
    title: "Activare Automată în Joc",
    text: "Pachetele VIP achiziționate din magazin se activează automat în mai puțin de 5 secunde, fără a fi nevoie de reconectare pe server.",
  },
  {
    id: "admin-rights",
    type: "IMPORTANT",
    name: "Permisiuni de Staff",
    title: "Acces Restricționat Staff",
    text: "Rularea comenzilor avansate de moderare necesită atribuirea gradului corespunzător în sistemul de permisiuni.",
  },
  {
    id: "chat-rules",
    type: "WARNING",
    name: "Avertisment Chat & Comportament",
    title: "Regulament de Comunicare",
    text: "Spam-ul abuziv sau limbajul neadecvat în chat atrage sancțiuni automate de mute/gag conform regulamentului oficial.",
  },
  {
    id: "loss-risk",
    type: "CAUTION",
    name: "Avertizare Tranzacții / Trade",
    title: "Atenție la Schimburi & Credite",
    text: "Transferurile de credite între jucători sunt finale și ireversibile. Asigură-te că introduci SteamID-ul corect al destinatarului.",
  },
];

export function StudioCalloutBuilderModal({
  cursorLine,
  onInsert,
  onClose,
  initialType = "NOTE",
}: StudioCalloutBuilderProps) {
  const [calloutType, setCalloutType] = useState<CalloutType>(initialType);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [content, setContent] = useState<string>(
    "Introdu aici mesajul detaliat care va fi evidențiat vizual în cadrul ghidului."
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");

  const applyPreset = (preset: CalloutPreset) => {
    setSelectedPresetId(preset.id);
    setCalloutType(preset.type);
    setCustomTitle(preset.title);
    setContent(preset.text);
  };

  const generateMarkdownCallout = (): string => {
    const lines = content.split("\n");
    let result = `> [!${calloutType}]`;
    if (customTitle.trim()) {
      result += `\n> **${customTitle.trim()}**`;
    }
    lines.forEach((line) => {
      result += `\n> ${line}`;
    });
    return result;
  };

  const markdownResult = generateMarkdownCallout();

  const handleInsert = () => {
    onInsert(markdownResult);
  };

  const currentMeta = CALLOUT_TYPES.find((c) => c.type === calloutType) || CALLOUT_TYPES[0];
  const IconComponent = currentMeta.icon;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container studio-callout-modal-container">
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <div className="studio-modal-badge">
              <MessageSquareQuote size={12} />
              <span>CONSTRUCTOR ALERTE &amp; CALLOUT-URI</span>
            </div>
            <h3 className="admin-modal-title">Personalizare Notă &amp; Avertisment Vizual</h3>
          </div>
          <button type="button" className="admin-modal-close-btn" onClick={onClose} title="Închide">
            <X size={16} />
          </button>
        </div>

        {/* Location line indicator pill */}
        <div className="studio-builder-line-indicator">
          <div className="studio-builder-line-pill">
            <span className="studio-builder-pulse-dot" />
            <span>Punct de inserare activ: <strong>Linia {cursorLine}</strong> din document</span>
          </div>
          <div className="studio-builder-dimensions-badge">
            <IconComponent size={12} />
            <span>Tip: {calloutType}</span>
          </div>
        </div>

        <div className="admin-modal-body">
          {/* Preset Buttons */}
          <div className="studio-builder-presets-section">
            <div className="studio-builder-presets-label">
              <Wand2 size={13} className="text-amber-400" />
              <span>Șabloane Rapide Populare:</span>
            </div>
            <div className="studio-builder-presets-list">
              {CALLOUT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`studio-builder-preset-chip ${
                    selectedPresetId === preset.id ? "studio-builder-preset-chip--active" : ""
                  }`}
                >
                  <Sparkles size={11} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Callout Type Selection Grid */}
          <div className="studio-callout-types-grid">
            {CALLOUT_TYPES.map((typeMeta) => {
              const TypeIcon = typeMeta.icon;
              const isSelected = calloutType === typeMeta.type;
              return (
                <button
                  key={typeMeta.type}
                  type="button"
                  onClick={() => setCalloutType(typeMeta.type)}
                  className={`studio-callout-type-card ${typeMeta.badgeClass} ${
                    isSelected ? "studio-callout-type-card--active" : ""
                  }`}
                >
                  <div className="studio-callout-type-header">
                    <TypeIcon size={16} />
                    <strong>{typeMeta.label}</strong>
                  </div>
                  <p>{typeMeta.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Form Fields */}
          <div className="admin-form-group mt-3">
            <label className="admin-form-label">Titlu Opțional Alertă (Bold Header)</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="ex: Cerință Obligatorie pentru Conectare"
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Conținut Text Alertă (Markdown Suportat)</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Introdu instrucțiunile sau mesajul de atenționare..."
              className="admin-form-input studio-callout-textarea"
            />
          </div>

          {/* Live Callout Preview Box */}
          <div className="studio-callout-live-preview">
            <div className="studio-callout-preview-label">Previzualizare Live în Document:</div>
            <div className={`studio-callout-box studio-callout-box--${calloutType.toLowerCase()}`}>
              <div className="studio-callout-box-header">
                <IconComponent size={15} />
                <span>{calloutType}</span>
              </div>
              <div className="studio-callout-box-body">
                {customTitle && <strong>{customTitle}</strong>}
                <p>{content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>
            Anulează
          </button>
          <button type="button" className="admin-btn admin-btn--primary studio-insert-submit-btn" onClick={handleInsert}>
            <Check size={14} />
            <span>Inserează Alerta la Linia {cursorLine}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
