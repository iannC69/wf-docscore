import type { Metadata } from "next";
import { Suspense } from "react";
import { PageProgressBar } from "@/components/ui/PageProgressBar";
import { AiHelper } from "@/components/ui/AiHelper";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import "./globals.css";
import "@/styles/light-theme-extras.css";

export const metadata: Metadata = {
  title: {
    default: "Wildfire Docs — Powered by WF-DOCSCORE",
    template: "%s — Wildfire Docs",
  },
  description:
    "Wildfire Docs — Ultra-fast documentation platform powered by WF-DOCSCORE Engine with live Git synchronization and liquid aesthetics.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply dark theme before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  document.documentElement.setAttribute('data-theme', stored || 'dark');
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <PageProgressBar />
        </Suspense>
        {children}
        <AiHelper />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
