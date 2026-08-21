import React from "react";
import { Info, AlertTriangle, ShieldAlert, Flame, CheckCircle2 } from "lucide-react";

type CalloutType = "note" | "tip" | "warning" | "danger" | "caution" | "important";

const CALLOUT_ICONS: Record<CalloutType, React.ReactNode> = {
  note:      <Info size={16} aria-hidden="true" />,
  tip:       <CheckCircle2 size={16} aria-hidden="true" />,
  warning:   <AlertTriangle size={16} aria-hidden="true" />,
  danger:    <ShieldAlert size={16} aria-hidden="true" />,
  caution:   <ShieldAlert size={16} aria-hidden="true" />,
  important: <Flame size={16} aria-hidden="true" />,
};

const CALLOUT_LABELS: Record<CalloutType, string> = {
  note:      "Notă",
  tip:       "Sfat",
  warning:   "Atenție",
  danger:    "Pericol",
  caution:   "Precauție",
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
// Parses > [!NOTE], > [!WARNING], etc. from blockquote elements.
// Handles all MDX/remark AST structures robustly.

const GH_CALLOUT_REGEX = /^\s*\[!(NOTE|TIP|WARNING|DANGER|CAUTION|IMPORTANT)\]\s*/i;

/**
 * Recursively extract all text content from React nodes
 */
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!React.isValidElement(node)) return "";
  const props = (node as React.ReactElement<any>).props;
  if (!props?.children) return "";
  return React.Children.toArray(props.children)
    .map(extractText)
    .join("");
}

/**
 * Flatten blockquote children to find [!TYPE] marker anywhere in the first paragraph.
 * Returns the callout type and cleaned children, or null if no match.
 */
export function parseGithubCallout(
  children: React.ReactNode
): { type: CalloutType; content: React.ReactNode } | null {
  const childArray = React.Children.toArray(children);
  if (childArray.length === 0) return null;

  // Look through all immediate children for a paragraph containing [!TYPE]
  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];
    if (!React.isValidElement(child)) continue;

    const fullText = extractText(child);
    const match = fullText.match(GH_CALLOUT_REGEX);
    if (!match) continue;

    const type = match[1].toLowerCase() as CalloutType;

    // Build remaining content: this child with marker stripped + rest of children
    // Strip the [!TYPE] from the beginning of the text content by rebuilding child text
    const strippedText = fullText.replace(GH_CALLOUT_REGEX, "").trim();
    const remainingChildren = childArray.slice(i + 1);

    const content = (
      <>
        {strippedText && <p>{strippedText}</p>}
        {remainingChildren}
      </>
    );

    return { type, content };
  }

  return null;
}

// ─── Blockquote wrapper that detects GitHub callouts ──────────────────────────

export function SmartBlockquote({ children }: { children: React.ReactNode }) {
  // Primary: try recursive React tree scan
  const parsed = parseGithubCallout(children);
  if (parsed) {
    return <Callout type={parsed.type}>{parsed.content}</Callout>;
  }

  // Fallback: serialize entire children tree to text and check
  const fullText = React.Children.toArray(children).map(extractText).join(" ");
  const match = fullText.match(GH_CALLOUT_REGEX);
  if (match) {
    const type = match[1].toLowerCase() as CalloutType;
    const strippedText = fullText.replace(GH_CALLOUT_REGEX, "").trim();
    return (
      <Callout type={type}>
        {strippedText && <p>{strippedText}</p>}
      </Callout>
    );
  }

  return <blockquote>{children}</blockquote>;
}
