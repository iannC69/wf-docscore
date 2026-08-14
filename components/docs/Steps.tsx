import React from "react";

// ─── Steps ────────────────────────────────────────────────────────────────────

interface StepProps {
  title: string;
  children: React.ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <div className="step">
      <div className="step-number" aria-hidden="true" />
      <div className="step-content">
        <div className="step-title">{title}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <div className="steps">{children}</div>;
}
