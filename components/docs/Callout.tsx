import React from "react";
import { Info, Lightbulb, AlertTriangle, AlertOctagon, Bookmark } from "lucide-react";

type CalloutType = "note" | "tip" | "warning" | "danger" | "caution" | "important";

const CALLOUT_ICONS: Record<CalloutType, React.ReactNode> = {
  note:      <Info size={16} aria-hidden="true" />,
  tip:       <Lightbulb size={16} aria-hidden="true" />,
  warning:   <AlertTriangle size={16} aria-hidden="true" />,
  danger:    <AlertOctagon size={16} aria-hidden="true" />,
  caution:   <AlertOctagon size={16} aria-hidden="true" />,
  important: <Bookmark size={16} aria-hidden="true" />,
};

const CALLOUT_LABELS: Record<CalloutType, string> = {
  note:      "Note",
  tip:       "Tip",
  warning:   "Warning",
  danger:    "Danger",
  caution:   "Caution",
  important: "Important",
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const icon = CALLOUT_ICONS[type] ?? CALLOUT_ICONS.note;
  const defaultLabel = CALLOUT_LABELS[type] ?? "Note";

  return (
    <div className={`callout callout--${type}`} role="note">
      <div className="callout-icon-wrapper" aria-hidden="true">
        {icon}
      </div>
      <div className="callout-content">
        <div className="callout-title">{title ?? defaultLabel}</div>
        <div className="callout-body">{children}</div>
      </div>
    </div>
  );
}

// ─── GitHub-flavored callout parser ────────────────────────────────────────────
// Parses > [!NOTE], > [!WARNING], etc. from blockquote elements

const GH_CALLOUT_REGEX = /^\[!(NOTE|TIP|WARNING|DANGER|CAUTION|IMPORTANT)\]/i;

export function parseGithubCallout(
  children: React.ReactNode
): { type: CalloutType; content: React.ReactNode } | null {
  const childArray = React.Children.toArray(children);
  if (childArray.length === 0) return null;

  const first = childArray[0];
  if (typeof first !== "object" || !("props" in first)) return null;

  const firstText = (first as React.ReactElement<any>).props?.children;
  if (typeof firstText !== "string") return null;

  const match = firstText.match(GH_CALLOUT_REGEX);
  if (!match) return null;

  const type = match[1].toLowerCase() as CalloutType;
  const rest = childArray.slice(1);

  return { type, content: rest };
}

// ─── Blockquote wrapper that detects GitHub callouts ──────────────────────────

export function SmartBlockquote({ children }: { children: React.ReactNode }) {
  const parsed = parseGithubCallout(children);
  if (parsed) {
    return <Callout type={parsed.type}>{parsed.content}</Callout>;
  }
  return <blockquote>{children}</blockquote>;
}
