import Link from "next/link";
import React from "react";

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  title: string;
  description?: string;
  href?: string;
  icon?: string;
  children?: React.ReactNode;
}

export function Card({ title, description, href, icon, children }: CardProps) {
  const content = (
    <>
      <div className="card-title">
        {icon && <span aria-hidden="true">{icon}</span>}
        {title}
      </div>
      {description && <p className="card-description">{description}</p>}
      {children && <div className="card-description">{children}</div>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="card">
        {content}
      </Link>
    );
  }

  return <div className="card">{content}</div>;
}

// ─── Cards Grid ────────────────────────────────────────────────────────────────

export function Cards({ children }: { children: React.ReactNode }) {
  return <div className="cards">{children}</div>;
}
