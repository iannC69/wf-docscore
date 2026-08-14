import Link from "next/link";
import React from "react";
import { ArrowRight } from "lucide-react";

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  title: string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
  tag?: string;
  children?: React.ReactNode;
}

export function Card({ title, description, href, icon, tag, children }: CardProps) {
  const content = (
    <>
      <div className="card-header-row">
        {icon && <div className="card-icon-box">{icon}</div>}
        {tag && <span className="card-tag">{tag}</span>}
        <ArrowRight size={15} className="card-arrow" aria-hidden="true" />
      </div>
      <div className="card-title">{title}</div>
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
