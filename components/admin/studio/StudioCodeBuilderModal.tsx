"use client";

import React, { useState } from "react";
import {
  Code,
  Terminal,
  FileCode,
  Sparkles,
  Check,
  X,
  Wand2,
  Copy,
  Hash,
} from "lucide-react";

export interface StudioCodeBuilderProps {
  cursorLine: number;
  onInsert: (markdownCode: string) => void;
  onClose: () => void;
}

interface LanguageOption {
  key: string;
  name: string;
  badgeColor: string;
}

const LANGUAGES: LanguageOption[] = [
  { key: "bash", name: "Bash / Consolă", badgeColor: "#10b981" },
  { key: "typescript", name: "TypeScript", badgeColor: "#3b82f6" },
  { key: "javascript", name: "JavaScript", badgeColor: "#f59e0b" },
  { key: "json", name: "JSON Config", badgeColor: "#06b6d4" },
  { key: "csharp", name: "C# (.NET)", badgeColor: "#8b5cf6" },
  { key: "python", name: "Python", badgeColor: "#ec4899" },
  { key: "sql", name: "PostgreSQL / SQL", badgeColor: "#38bdf8" },
  { key: "yaml", name: "YAML / YML", badgeColor: "#fb923c" },
  { key: "cpp", name: "C++ / SourcePawn", badgeColor: "#f43f5e" },
  { key: "markdown", name: "Markdown / MDX", badgeColor: "#a855f7" },
  { key: "css", name: "CSS / SCSS", badgeColor: "#60a5fa" },
  { key: "plaintext", name: "Text Simplu", badgeColor: "#9ca3af" },
];

const CODE_PRESETS = [
  {
    name: "Conectare CS2 & Setări Rețea",
    lang: "bash",
    title: "autoexec.cfg",
    code: `// Conectare rapidă pe serverul WildFire CS2
connect cs2.wildfire.ro:27015

// Setări rate rețea recomandate
rate 786432
cl_interp 0.015625
cl_updaterate 128
cl_cmdrate 128`,
  },
  {
    name: "Comandă Chat & Alias Consolă",
    lang: "bash",
    title: "chat_commands.txt",
    code: `// Comenzi uzuale în joc
!vip          // Deschide meniul VIP
!shop         // Magazin credite
!ws           // Selector arme & skin-uri
!knife        // Meniu alegere cuțit
!gloves       // Meniu mănuși`,
  },
  {
    name: "Configurație Server Plugin",
    lang: "json",
    title: "config/settings.json",
    code: `{
  "serverName": "Wildfire CS2 #1 | Competitive",
  "maxPlayers": 24,
  "creditsPerRoundWin": 50,
  "creditsPerKill": 10,
  "vipMultipliers": {
    "bronze": 1.15,
    "silver": 1.30,
    "diamond": 1.50
  }
}`,
  },
  {
    name: "Exemplu Payload Discord Webhook",
    lang: "json",
    title: "discord-webhook-payload.json",
    code: `{
  "username": "Wildfire Security Guard",
  "avatar_url": "https://wildfire.ro/logo.png",
  "embeds": [
    {
      "title": "Audit Alert: Modificare Articol",
      "description": "Utilizatorul **iannC69** a actualizat ghidul de comenzi.",
      "color": 16739072
    }
  ]
}`,
  },
];

export function StudioCodeBuilderModal({ cursorLine, onInsert, onClose }: StudioCodeBuilderProps) {
  const [lang, setLang] = useState<string>("bash");
  const [fileTitle, setFileTitle] = useState<string>("");
  const [code, setCode] = useState<string>("# Introdu aici liniile de cod sau comenzile\nconnect cs2.wildfire.ro");
  const [selectedPresetName, setSelectedPresetName] = useState<string>("");

  const applyPreset = (preset: typeof CODE_PRESETS[0]) => {
    setSelectedPresetName(preset.name);
    setLang(preset.lang);
    setFileTitle(preset.title);
    setCode(preset.code);
  };

  const generateMarkdownCode = (): string => {
    const titleComment = fileTitle.trim() ? `# [${fileTitle.trim()}]\n` : "";
    return `\`\`\`${lang}\n${titleComment}${code}\n\`\`\``;
  };

  const handleInsert = () => {
    onInsert(generateMarkdownCode());
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container studio-code-modal-container">
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <div className="studio-modal-badge">
              <Code size={12} />
              <span>CONSTRUCTOR BLOCURI DE COD</span>
            </div>
            <h3 className="admin-modal-title">Configurare Limbaj &amp; Script Tehnologic</h3>
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
            <Terminal size={12} />
            <span>Limbaj: {lang}</span>
          </div>
        </div>

        <div className="admin-modal-body">
          {/* Preset Buttons */}
          <div className="studio-builder-presets-section">
            <div className="studio-builder-presets-label">
              <Wand2 size={13} className="text-amber-400" />
              <span>Fragmente Preconfigurate:</span>
            </div>
            <div className="studio-builder-presets-list">
              {CODE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`studio-builder-preset-chip ${
                    selectedPresetName === preset.name ? "studio-builder-preset-chip--active" : ""
                  }`}
                >
                  <Sparkles size={11} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection Chips */}
          <div className="studio-code-languages-grid">
            {LANGUAGES.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setLang(l.key)}
                className={`studio-code-lang-chip ${lang === l.key ? "studio-code-lang-chip--active" : ""}`}
                style={{ "--lang-accent": l.badgeColor } as any}
              >
                <span className="studio-code-lang-dot" />
                <span>{l.name}</span>
              </button>
            ))}
          </div>

          {/* Optional Title input */}
          <div className="admin-form-group mt-3">
            <label className="admin-form-label">Titlu Fișier / Antet Script (Opțional)</label>
            <input
              type="text"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="ex: cfg/server.cfg sau src/controllers/user.ts"
              className="admin-form-input admin-table-mono"
            />
          </div>

          {/* Code Textarea */}
          <div className="admin-form-group">
            <div className="studio-code-editor-header">
              <div className="studio-code-editor-tab">
                <FileCode size={13} />
                <span>{fileTitle.trim() || `snippet.${lang}`}</span>
              </div>
              <span className="studio-code-editor-lines">{code.split("\n").length} linii</span>
            </div>
            <textarea
              rows={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Scrie sau lipește codul aici..."
              className="admin-form-input studio-code-textarea admin-table-mono"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>
            Anulează
          </button>
          <button type="button" className="admin-btn admin-btn--primary studio-insert-submit-btn" onClick={handleInsert}>
            <Check size={14} />
            <span>Inserează Blocul de Cod la Linia {cursorLine}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
