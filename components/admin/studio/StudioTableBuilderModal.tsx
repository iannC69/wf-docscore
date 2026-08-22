"use client";

import React, { useState } from "react";
import {
  Table,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Check,
  X,
  Columns3,
  Rows3,
  Wand2,
  FileText,
  RotateCcw,
  Copy,
  ChevronRight,
  Layers,
} from "lucide-react";

export interface StudioTableBuilderProps {
  cursorLine: number;
  onInsert: (markdownTable: string) => void;
  onClose: () => void;
}

type ColumnAlignment = "left" | "center" | "right";

interface TablePreset {
  id: string;
  name: string;
  desc: string;
  headers: string[];
  alignments: ColumnAlignment[];
  rows: string[][];
}

const TABLE_PRESETS: TablePreset[] = [
  {
    id: "commands",
    name: "Comenzi Chat & Consolă",
    desc: "Tabel standard pentru documentarea comenzilor de joc și argumentelor",
    headers: ["Comandă Chat", "Comandă Consolă", "Acces / Permisiune", "Descriere Funcționalitate"],
    alignments: ["left", "left", "center", "left"],
    rows: [
      ["`!vip`", "`css_vip`", "VIP General", "Deschide meniul principal de facilități VIP"],
      ["`!shop`", "`css_shop`", "Toți Jucătorii", "Accesează magazinul de credite și skin-uri"],
      ["`!admin`", "`css_admin`", "Admin Staff", "Deschide panoul administrativ de moderare"],
    ],
  },
  {
    id: "vip-tiers",
    name: "Pachete VIP & Prețuri",
    desc: "Comparație grade VIP, beneficii exclusive și costuri lunare",
    headers: ["Grad VIP", "Preț Lunar", "Bonus Credite", "Slot Rezervat", "Meniu Skin-uri"],
    alignments: ["left", "center", "center", "center", "center"],
    rows: [
      ["**VIP Bronze**", "5.00 EUR", "+15%", "Da", "Cuțite de bază"],
      ["**VIP Silver**", "10.00 EUR", "+30%", "Da (Prioritate)", "Toate Cuțitele"],
      ["**VIP Diamond**", "20.00 EUR", "+50%", "Garantat (99/99)", "Toate Cuțitele + Mănuși"],
    ],
  },
  {
    id: "cvar-config",
    name: "Parametri & Configurație CVAR",
    desc: "Specificații tehnice de configurare server / plugin",
    headers: ["Parametru (CVAR)", "Tip Dată", "Valoare Implicită", "Descriere Setare"],
    alignments: ["left", "center", "center", "left"],
    rows: [
      ["`wf_credits_kill`", "Integer", "`10`", "Numărul de credite acordate per kill"],
      ["`wf_vip_tag_enabled`", "Boolean", "`true`", "Activează afișarea tag-ului VIP în chat"],
      ["`wf_shop_cooldown`", "Float", "`5.0`", "Timpul de cooldown între deschideri meniu"],
    ],
  },
  {
    id: "drop-rates",
    name: "Șanse & Drop Rate Crate-uri",
    desc: "Distribuție procente raritate pentru cutii și drop-uri",
    headers: ["Raritate Item", "Culoare Tiers", "Șansă Drop (%)", "Multiplicator Valoare"],
    alignments: ["left", "center", "center", "center"],
    rows: [
      ["Mil-Spec (Albastru)", "Tier 1", "70.0%", "1.0x"],
      ["Restricted (Mov)", "Tier 2", "20.0%", "2.5x"],
      ["Classified (Roz)", "Tier 3", "7.5%", "6.0x"],
      ["Covert (Roșu)", "Tier 4", "2.0%", "15.0x"],
      ["Special Rarisim (Auriu)", "Tier Special", "0.5%", "50.0x"],
    ],
  },
];

export function StudioTableBuilderModal({ cursorLine, onInsert, onClose }: StudioTableBuilderProps) {
  const [headers, setHeaders] = useState<string[]>(["Coloană 1", "Coloană 2", "Coloană 3"]);
  const [alignments, setAlignments] = useState<ColumnAlignment[]>(["left", "left", "left"]);
  const [rows, setRows] = useState<string[][]>([
    ["Valoare A1", "Valoare B1", "Valoare C1"],
    ["Valoare A2", "Valoare B2", "Valoare C2"],
  ]);
  const [previewTab, setPreviewTab] = useState<"visual" | "markdown">("visual");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // ── Column Operations ──
  const addColumn = () => {
    const nextColNum = headers.length + 1;
    setHeaders([...headers, `Coloană ${nextColNum}`]);
    setAlignments([...alignments, "left"]);
    setRows(rows.map((row) => [...row, `Valoare ${String.fromCharCode(64 + nextColNum)}`]));
  };

  const removeColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, idx) => idx !== colIdx));
    setAlignments(alignments.filter((_, idx) => idx !== colIdx));
    setRows(rows.map((row) => row.filter((_, idx) => idx !== colIdx)));
  };

  const setColAlign = (colIdx: number, align: ColumnAlignment) => {
    const next = [...alignments];
    next[colIdx] = align;
    setAlignments(next);
  };

  // ── Row Operations ──
  const addRow = () => {
    const nextRowNum = rows.length + 1;
    const newRow = headers.map((_, colIdx) => `Valoare ${String.fromCharCode(65 + colIdx)}${nextRowNum}`);
    setRows([...rows, newRow]);
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, idx) => idx !== rowIdx));
  };

  // ── Cell Changes ──
  const handleHeaderChange = (colIdx: number, value: string) => {
    const next = [...headers];
    next[colIdx] = value;
    setHeaders(next);
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const nextRows = rows.map((r, rIdx) => {
      if (rIdx !== rowIdx) return r;
      const nextR = [...r];
      nextR[colIdx] = value;
      return nextR;
    });
    setRows(nextRows);
  };

  // ── Preset Loader ──
  const applyPreset = (preset: TablePreset) => {
    setSelectedPresetId(preset.id);
    setHeaders([...preset.headers]);
    setAlignments([...preset.alignments]);
    setRows(preset.rows.map((row) => [...row]));
  };

  // ── Reset ──
  const resetTable = () => {
    setSelectedPresetId("");
    setHeaders(["Coloană 1", "Coloană 2", "Coloană 3"]);
    setAlignments(["left", "left", "left"]);
    setRows([
      ["Valoare A1", "Valoare B1", "Valoare C1"],
      ["Valoare A2", "Valoare B2", "Valoare C2"],
    ]);
  };

  // ── Generate Markdown Table ──
  const generateMarkdownTable = (): string => {
    const cleanHeaders = headers.map((h) => (h.trim() === "" ? " " : h.trim()));
    const headerRow = `| ${cleanHeaders.join(" | ")} |`;

    const separatorRow = `| ${alignments
      .map((align) => {
        if (align === "center") return ":---:";
        if (align === "right") return "---:";
        return ":---";
      })
      .join(" | ")} |`;

    const dataRows = rows.map((row) => {
      const cells = row.map((cell) => (cell.trim() === "" ? "-" : cell.trim()));
      return `| ${cells.join(" | ")} |`;
    });

    return [headerRow, separatorRow, ...dataRows].join("\n");
  };

  const markdownResult = generateMarkdownTable();

  const handleInsert = () => {
    onInsert(markdownResult);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownResult);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container studio-table-modal-container">
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <div className="studio-modal-badge">
              <Table size={12} />
              <span>CREATOR INTERACTIV DE TABEL</span>
            </div>
            <h3 className="admin-modal-title">Configurare Structură &amp; Conținut Tabel</h3>
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
            <Columns3 size={12} />
            <span>{headers.length} Coloane</span>
            <span className="studio-builder-badge-dot">×</span>
            <Rows3 size={12} />
            <span>{rows.length} Rânduri</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="admin-modal-body studio-table-modal-body">
          {/* Quick Presets Carousel / Badges */}
          <div className="studio-builder-presets-section">
            <div className="studio-builder-presets-label">
              <Wand2 size={13} className="text-amber-400" />
              <span>Șabloane Rapide Preconfigurate:</span>
            </div>
            <div className="studio-builder-presets-list">
              {TABLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`studio-builder-preset-chip ${
                    selectedPresetId === preset.id ? "studio-builder-preset-chip--active" : ""
                  }`}
                  title={preset.desc}
                >
                  <Sparkles size={11} />
                  <span>{preset.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={resetTable}
                className="studio-builder-preset-chip studio-builder-preset-chip--reset"
                title="Resetează la tabel curat 3x2"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* View Mode Toggle: Interactive Grid vs Raw Markdown */}
          <div className="studio-builder-view-switcher">
            <button
              type="button"
              className={`studio-builder-view-btn ${previewTab === "visual" ? "studio-builder-view-btn--active" : ""}`}
              onClick={() => setPreviewTab("visual")}
            >
              <Table size={13} />
              <span>Editor Vizual Interactiv</span>
            </button>
            <button
              type="button"
              className={`studio-builder-view-btn ${previewTab === "markdown" ? "studio-builder-view-btn--active" : ""}`}
              onClick={() => setPreviewTab("markdown")}
            >
              <FileText size={13} />
              <span>Previzualizare Cod Markdown</span>
            </button>
          </div>

          {previewTab === "visual" ? (
            <div className="studio-table-grid-wrapper">
              {/* Controls bar (Add Row / Add Col) */}
              <div className="studio-table-quick-toolbar">
                <div className="studio-table-quick-toolbar-left">
                  <button type="button" onClick={addColumn} className="studio-table-action-pill studio-table-action-pill--add">
                    <Plus size={12} />
                    <span>Adaugă Coloană (+Col)</span>
                  </button>
                  <button type="button" onClick={addRow} className="studio-table-action-pill studio-table-action-pill--add">
                    <Plus size={12} />
                    <span>Adaugă Rând (+Rând)</span>
                  </button>
                </div>
                <div className="studio-table-quick-toolbar-right">
                  <span className="studio-table-helper-text">
                    Apasă pe butoanele de aliniere pentru a schimba direcția fiecărei coloane.
                  </span>
                </div>
              </div>

              {/* Interactive Matrix Grid */}
              <div className="studio-table-scroll-matrix">
                <table className="studio-interactive-table">
                  <thead>
                    <tr>
                      <th className="studio-th-corner">#</th>
                      {headers.map((header, colIdx) => (
                        <th key={colIdx} className="studio-th-col">
                          <div className="studio-th-col-header">
                            <input
                              type="text"
                              value={header}
                              onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                              placeholder={`Antet Col ${colIdx + 1}`}
                              className="studio-th-input"
                            />
                            <div className="studio-th-align-group">
                              <button
                                type="button"
                                className={`studio-th-align-btn ${alignments[colIdx] === "left" ? "active" : ""}`}
                                onClick={() => setColAlign(colIdx, "left")}
                                title="Aliniere la Stânga"
                              >
                                <AlignLeft size={10} />
                              </button>
                              <button
                                type="button"
                                className={`studio-th-align-btn ${alignments[colIdx] === "center" ? "active" : ""}`}
                                onClick={() => setColAlign(colIdx, "center")}
                                title="Aliniere la Centru"
                              >
                                <AlignCenter size={10} />
                              </button>
                              <button
                                type="button"
                                className={`studio-th-align-btn ${alignments[colIdx] === "right" ? "active" : ""}`}
                                onClick={() => setColAlign(colIdx, "right")}
                                title="Aliniere la Dreapta"
                              >
                                <AlignRight size={10} />
                              </button>
                              {headers.length > 1 && (
                                <button
                                  type="button"
                                  className="studio-th-delete-col-btn"
                                  onClick={() => removeColumn(colIdx)}
                                  title="Șterge această coloană"
                                >
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="studio-td-row-handle">
                          <div className="studio-row-label-box">
                            <span>R{rowIdx + 1}</span>
                            {rows.length > 1 && (
                              <button
                                type="button"
                                className="studio-row-delete-btn"
                                onClick={() => removeRow(rowIdx)}
                                title={`Șterge Rândul ${rowIdx + 1}`}
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        </td>
                        {row.map((cell, colIdx) => (
                          <td key={colIdx} className="studio-td-cell">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                              placeholder={`Valoare L${rowIdx + 1} C${colIdx + 1}`}
                              className={`studio-td-input studio-td-input--${alignments[colIdx]}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="studio-table-markdown-preview">
              <div className="studio-markdown-preview-header">
                <span>Cod Generat Markdown (Ghid Standard GitHub Flavored Markdown)</span>
                <button type="button" onClick={handleCopyMarkdown} className="studio-copy-code-btn">
                  {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode ? "Copiat!" : "Copiază Codul"}</span>
                </button>
              </div>
              <pre className="studio-table-code-block">
                <code>{markdownResult}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>
            Anulează
          </button>
          <button type="button" className="admin-btn admin-btn--primary studio-insert-submit-btn" onClick={handleInsert}>
            <Check size={14} />
            <span>Inserează Tabelul la Linia {cursorLine}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
