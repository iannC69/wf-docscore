import React from "react";

type CalloutType = "note" | "tip" | "warning" | "danger" | "caution" | "important";

const CALLOUT_CONFIG: Record<CalloutType, { icon: string; label: string }> = {
  note:      { icon: "ℹ️", label: "Note" },
  tip:       { icon: "💡", label: "Tip" },
  warning:   { icon: "⚠️", label: "Warning" },
  danger:    { icon: "🚨", label: "Danger" },
  caution:   { icon: "🚨", label: "Caution" },
  important: { icon: "📌", label: "Important" },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const config = CALLOUT_CONFIG[type] ?? CALLOUT_CONFIG.note;

  return (
    <div className={`callout callout--${type}`} role="note">
      <span className="callout-icon" aria-hidden="true">{config.icon}</span>
      <div className="callout-content">
        <div className="callout-title">{title ?? config.label}</div>
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
