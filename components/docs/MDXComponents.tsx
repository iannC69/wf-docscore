import React from "react";
import type { MDXComponents } from "mdx/types";
import { Callout, SmartBlockquote } from "./Callout";
import { Steps, Step } from "./Steps";
import { Tabs, Tab } from "./Tabs";
import { Card, Cards } from "./Card";
import { CopyablePre } from "./CopyablePre";
import { DocVideo } from "./DocVideo";
import { DocImage } from "./DocImage";
import Link from "next/link";

export const mdxComponents: MDXComponents = {
  // Prevent invalid <p> nesting when markdown places images, videos, or blocks on separate lines
  p: (props: any) => {
    const childrenArray = React.Children.toArray(props.children);
    const containsBlockElement = childrenArray.some((child: any) => {
      if (!React.isValidElement(child)) return false;
      const type = child.type;
      if (
        type === DocImage ||
        type === DocVideo ||
        type === "img" ||
        type === "figure" ||
        type === "div" ||
        type === "video" ||
        type === Callout ||
        type === Card ||
        type === Cards ||
        type === Steps ||
        type === Step ||
        type === Tabs ||
        type === Tab
      ) {
        return true;
      }
      const childProps = (child as any).props;
      if (
        childProps &&
        (childProps.src ||
          childProps.className?.includes("doc-image") ||
          childProps.className?.includes("doc-video"))
      ) {
        return true;
      }
      return false;
    });

    if (containsBlockElement) {
      return <div className="doc-paragraph-wrapper">{props.children}</div>;
    }

    return <p {...props} />;
  },

  // Intercept blockquotes to check for GitHub-style callouts (> [!NOTE])
  blockquote: SmartBlockquote,

  // Figure pass-through (rehype-pretty-code wraps pre in figure)
  figure: ({ children, className, ...props }: any) => {
    if (className?.includes("doc-image-figure")) {
      return (
        <figure className={className} {...props}>
          {children}
        </figure>
      );
    }
    return <>{children}</>;
  },

  // Media components with HD Lightbox
  video: (props: any) => <DocVideo {...props} />,
  DocVideo,
  img: (props: any) => <DocImage {...props} />,
  DocImage,

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
};
