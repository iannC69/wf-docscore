import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type ChangeType = "feature" | "improvement" | "breaking" | "fix";

export interface ChangeItem {
  type: ChangeType;
  title: string;
  description?: string;
  badge?: string;
}

export interface ReleaseEntry {
  version: string;
  isLatest?: boolean;
  date: string;
  title: string;
  summary: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  git: {
    commitHash: string;
    commitUrl: string;
    tagUrl: string;
  };
  changes: ChangeItem[];
  highlights?: string[];
  slug: string;
}

export const RELEASES_DATA: ReleaseEntry[] = [
  {
    version: "v1.3.0",
    isLatest: true,
    date: "August 16, 2026",
    title: "Ultra-Smooth Table of Contents Engine, Frosted Glass Aesthetic & Layout Architecture",
    summary:
      "Version 1.3.0 introduces a state-of-the-art 120 FPS hardware-accelerated Table of Contents engine with magnetic frosted glass gliding pill, uninterrupted GPU transitions, refined layout mode controls (Standard, Full, Focus), and official WILDFIRE DOCS primary branding.",
    author: {
      name: "iannC69",
      username: "iannC69",
      avatar: "https://github.com/iannC69.png",
    },
    git: {
      commitHash: "892fa56",
      commitUrl: "https://github.com/iannC69/wf-docscore/commit/892fa56",
      tagUrl: "https://github.com/iannC69/wf-docscore/releases/tag/v1.3.0",
    },
    changes: [
      {
        type: "feature",
        title: "Deterministic 120 FPS Table of Contents Scroll Spy",
        description:
          "Pre-caches document heading offsets into memory to eliminate forced layout reflows and deliver butter-smooth 120 FPS scrolling.",
      },
      {
        type: "feature",
        title: "Magnetic Frosted Glass Gliding Capsule",
        description:
          "Single dedicated frosted capsule with unbroken GPU compositor interpolation and integrated glowing amber vertical indicator pip.",
      },
      {
        type: "feature",
        title: "Orderly Typographical Heading Hierarchy",
        description:
          "Replaced messy bracket lines and beaded curves with clean typographical indentation for ##, ###, and #### sections.",
      },
      {
        type: "feature",
        title: "Silky Smooth Panel Collapse & Expand Transitions",
        description:
          "Added physics-based cubic-bezier transitions for Sidebar ([) and Table of Contents (]) with floating expand buttons.",
      },
      {
        type: "improvement",
        title: "Reordered Layout Mode Switcher",
        description:
          "Reordered header layout controls to Standard -> Full -> Focus for optimal developer reading ergonomics.",
      },
      {
        type: "improvement",
        title: "Harmonized Frosted Liquid Glass Tokens",
        description:
          "Synchronized backdrop blur, hairline borders, and specular highlight reflections across Sidebar and Table of Contents.",
      },
      {
        type: "improvement",
        title: "Official WILDFIRE DOCS Branding & Subtle Engine Watermark",
        description:
          "Prominently displays WILDFIRE DOCS in top navbar header while maintaining WF-DOCSCORE engine watermark in footer and status dock.",
      },
      {
        type: "fix",
        title: "Next.js Scroll Warning & SVG Path Syntax Fixes",
        description:
          "Resolved data-scroll-behavior Next.js console warning and recalculated cubic bezier coordinate pairs in liquid effects.",
      },
    ],
    highlights: [
      "Ultra-Smooth 120 FPS Table of Contents with magnetic frosted glass sliding capsule",
      "Silky smooth collapse / expand panel transitions with floating toggle controls",
      "Synchronized frosted glass aesthetic across Sidebar and Navigation components",
      "Reordered header layout switcher to Standard -> Full -> Focus",
      "Full release packaging for v1.3.0 with live Git commit tracking",
    ],
    slug: "v1-3-0",
  },
  {
    version: "v1.2.0",
    isLatest: false,
    date: "August 16, 2026",
    title: "Mobile & Tablet Optimization, Liquid Glass Header & Official Logo",
    summary:
      "A major UX evolution bringing 100% mobile and tablet responsive layouts, an in-page mobile Table of Contents accordion, official brand logo integration, and refined liquid glass headers.",
    author: {
      name: "iannC69",
      username: "iannC69",
      avatar: "https://github.com/iannC69.png",
    },
    git: {
      commitHash: "e739c21",
      commitUrl: "https://github.com/iannC69/wf-docscore/commit/e739c21",
      tagUrl: "https://github.com/iannC69/wf-docscore/releases/tag/v1.2.0",
    },
    changes: [
      {
        type: "feature",
        title: "In-Page Mobile Table of Contents Accordion",
        description:
          "Automatically collapses desktop right sidebar on <= 1200px screens into a sleek frosted dropdown that smoothly scrolls to sections.",
      },
      {
        type: "feature",
        title: "Official Brand Logo & Tab Favicon Integration",
        description:
          "Configured official logo.png across browser tabs, favicons, Apple touch icons, and fixed navbar.",
      },
      {
        type: "improvement",
        title: "100% Touch-Optimized Slide-Out Drawer",
        description:
          "Mobile sidebar now features 38px finger-friendly tap targets with automatic drawer closure on link navigation.",
      },
      {
        type: "improvement",
        title: "Refined Liquid Glass Header & Search Pill",
        description:
          "Added ember hover elevation, version badge tags, and mobile search button in the top navbar.",
      },
    ],
    highlights: [
      "Responsive 1/2/3 column layout switching for cards and grids",
      "Dynamic browser tab titles per documentation sub-page",
      "Zero TypeScript compilation warnings with Turbopack engine",
    ],
    slug: "v1-2-0",
  },
  {
    version: "v1.1.0",
    isLatest: false,
    date: "August 15, 2026",
    title: "Multi-Level Collapsible Navigation & Pinned Sidebar Dock",
    summary:
      "Introduced recursive collapsible sub-sections, comprehensive 6-part Installation guide, pinned 3-tier sidebar architecture, and bottom fade-down scroll effects.",
    author: {
      name: "iannC69",
      username: "iannC69",
      avatar: "https://github.com/iannC69.png",
    },
    git: {
      commitHash: "3cbb240",
      commitUrl: "https://github.com/iannC69/wf-docscore/commit/3cbb240",
      tagUrl: "https://github.com/iannC69/wf-docscore/releases/tag/v1.1.0",
    },
    changes: [
      {
        type: "feature",
        title: "Multi-Level Collapsible Tree Navigation",
        description:
          "Added interactive collapsible group headers and sub-page rows with rotating chevron indicators and persistent active states.",
      },
      {
        type: "feature",
        title: "Pinned 3-Tier Sidebar Architecture",
        description:
          "Production Edge card, system status indicator, and Molten Lava Wave Tank are now permanently pinned to the bottom dock.",
      },
      {
        type: "improvement",
        title: "Fade-Down Smooth Scroll Mask",
        description:
          "Long navigation lists cleanly dissolve behind the bottom dock with a 36px gradient overlay.",
      },
      {
        type: "improvement",
        title: "Comprehensive 6-Part Installation Sub-Guides",
        description:
          "Added Overview, Prerequisites, Quickstart, CLI Tooling, Docker Deployment, and Troubleshooting guides.",
      },
    ],
    highlights: [
      "Dynamic route-specific category pills with semantic icon colors",
      "Auto-expanding active parent directories on page load",
    ],
    slug: "v1-1-0",
  },
  {
    version: "v1.0.0",
    isLatest: false,
    date: "August 14, 2026",
    title: "Initial Production Release: Next-Gen Docs Platform",
    summary:
      "First official release of Wildfire Docs featuring Next.js 16 App Router, MDX rendering engine, live Git metadata sync, and tri-mode responsive layout system.",
    author: {
      name: "iannC69",
      username: "iannC69",
      avatar: "https://github.com/iannC69.png",
    },
    git: {
      commitHash: "f2bfbdf",
      commitUrl: "https://github.com/iannC69/wf-docscore/commit/f2bfbdf",
      tagUrl: "https://github.com/iannC69/wf-docscore/releases/tag/v1.0.0",
    },
    changes: [
      {
        type: "feature",
        title: "Tri-Mode Responsive Layout (Standard, Focus, Full)",
        description:
          "Customizable reading modes with keyboard shortcuts ([ to toggle Left Sidebar, ] to toggle Table of Contents).",
      },
      {
        type: "feature",
        title: "Live Git Metadata Synchronization",
        description:
          "Direct integration with Git commits displaying author avatar, commit hash chips, and 1-click GitHub Edit Page button.",
      },
      {
        type: "feature",
        title: "CmdK Raycast-Style Search Modal",
        description:
          "Fast fuzzy search over all documentation headings and body content with keyboard shortcut (⌘K / Ctrl+K).",
      },
      {
        type: "feature",
        title: "Liquid Glass & Molten Ember Theme",
        description:
          "Frosted glass aesthetic with seamless Molten Lava wave animation and dynamic dark/light themes.",
      },
    ],
    highlights: [
      "Interactive MDX components: Callouts, Tabs, Steps, CodeBlocks with copy",
      "Dynamic Recently Updated cards on the documentation hub",
      "Zero-runtime CSS variables design system with high performance",
    ],
    slug: "v1-0-0",
  },
  {
    version: "v0.9.0",
    isLatest: false,
    date: "August 10, 2026",
    title: "Alpha Engine Prototype & Core Architecture",
    summary:
      "Proof of concept exploring Turbopack-powered SSG document generation, frontmatter metadata parsing, and syntax highlighting.",
    author: {
      name: "iannC69",
      username: "iannC69",
      avatar: "https://github.com/iannC69.png",
    },
    git: {
      commitHash: "0a1b2c3",
      commitUrl: "https://github.com/iannC69/wf-docscore",
      tagUrl: "https://github.com/iannC69/wf-docscore/releases/tag/v0.9.0",
    },
    changes: [
      {
        type: "feature",
        title: "Core MDX Parser & Unified Pipeline",
        description:
          "Implemented remark-gfm, rehype-slug, and shiki syntax highlighting engine.",
      },
      {
        type: "improvement",
        title: "Static Site Generation (SSG) with generateStaticParams",
        description:
          "Pre-rendered all documentation routes at build time for sub-millisecond response times.",
      },
    ],
    slug: "v0-9-0",
  },
];

export async function getAllReleases(): Promise<ReleaseEntry[]> {
  return RELEASES_DATA;
}
