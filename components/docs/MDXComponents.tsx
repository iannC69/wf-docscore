import type { MDXComponents } from "mdx/types";
import { Callout, SmartBlockquote } from "./Callout";
import { Steps, Step } from "./Steps";
import { Tabs, Tab } from "./Tabs";
import { Card, Cards } from "./Card";
import { CopyablePre } from "./CopyablePre";
import Link from "next/link";

export const mdxComponents: MDXComponents = {
  // Intercept blockquotes to check for GitHub-style callouts (> [!NOTE])
  blockquote: SmartBlockquote,

  // Figure pass-through (rehype-pretty-code wraps pre in figure)
  figure: ({ children }: any) => <>{children}</>,

  // Wrap all pre blocks with our unified Aurora header and copy button
  pre: (props: any) => <CopyablePre {...props} />,

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

  // Custom Components
  Callout,
  Steps,
  Step,
  Tabs,
  Tab,
  Card,
  Cards,
  CardGrid: Cards,
};
