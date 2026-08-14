import type { MDXComponents } from "mdx/types";
import { Callout, SmartBlockquote } from "./Callout";
import { Steps, Step } from "./Steps";
import { Tabs, Tab } from "./Tabs";
import { Card, Cards } from "./Card";
import { CopyablePre } from "./CopyablePre";
import Link from "next/link";

export const mdxComponents: MDXComponents = {
  // ── Overrides ────────────────────────────────────────────────────────────────
  // Intercept blockquotes to check for GitHub-style callouts (> [!NOTE])
  blockquote: SmartBlockquote,

  // Code blocks — rehype-pretty-code wraps in <figure data-rehype-pretty-code-figure>
  // We wrap <pre> with our client-side copy button
  figure: ({ children, ...props }: any) => {
    const hasPrettyCode = "data-rehype-pretty-code-figure" in props;
    if (hasPrettyCode) {
      return (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span className="code-block-lang">
              {props["data-language"] ?? "code"}
            </span>
          </div>
          {children}
        </div>
      );
    }
    return <figure {...props}>{children}</figure>;
  },

  pre: ({ children, ...props }: any) => (
    <CopyablePre {...props}>{children}</CopyablePre>
  ),

  // Links — Next.js Link for internal, <a> for external
  a: ({ href, children, ...props }: any) => {
    if (href?.startsWith("/") || href?.startsWith("#")) {
      return <Link href={href} {...props}>{children}</Link>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  // ── Custom Components ────────────────────────────────────────────────────────
  Callout,
  Steps,
  Step,
  Tabs,
  Tab,
  Card,
  Cards,
};
