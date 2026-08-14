import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "var(--space-16) var(--space-6)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-full)",
          color: "var(--color-text-tertiary)",
          display: "flex",
          height: 64,
          justifyContent: "center",
          width: 64,
        }}
      >
        <FileQuestion size={28} />
      </div>
      <div>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
            marginBottom: "var(--space-2)",
          }}
        >
          Page not found
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-base)" }}>
          This page doesn't exist yet, or may have been moved.
        </p>
      </div>
      <Link
        href="/docs"
        style={{
          alignItems: "center",
          background: "var(--color-primary)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text-on-primary)",
          display: "inline-flex",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          padding: "var(--space-2) var(--space-5)",
          textDecoration: "none",
          transition: "opacity var(--transition-fast)",
        }}
      >
        Back to docs
      </Link>
    </div>
  );
}
