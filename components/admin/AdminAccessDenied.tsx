"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Lock,
  LayoutDashboard,
  FileEdit,
  ArrowLeft,
  User,
  Key,
  ShieldCheck,
  AlertOctagon,
} from "lucide-react";
import type { RoutePermissionSpec } from "@/lib/security/permissionsGuard";

interface AdminAccessDeniedProps {
  username?: string;
  displayName?: string;
  role?: string;
  pathname: string;
  requiredSpec?: RoutePermissionSpec;
  canEditDocs?: boolean;
}

export function AdminAccessDenied({
  username = "Administrator",
  displayName,
  role = "Membru Echipă",
  pathname,
  requiredSpec,
  canEditDocs = false,
}: AdminAccessDeniedProps) {
  return (
    <div className="admin-access-denied-container">
      <div className="admin-access-denied-card">
        {/* Top Glow & Shield Icon */}
        <div className="admin-access-denied-icon-wrap">
          <div className="admin-access-denied-icon-pulse" />
          <ShieldAlert size={44} className="admin-access-denied-shield" />
        </div>

        {/* Status Pill & Headings */}
        <div className="admin-access-denied-badge">
          <Lock size={12} />
          <span>ACCES RESTRICȚIONAT (403 FORBIDDEN)</span>
        </div>

        <h1 className="admin-access-denied-title">Nivel de Autorizare Insuficient</h1>
        <p className="admin-access-denied-desc">
          Această secțiune a panoului de control conține operațiuni cu impact critic asupra platformei și necesită permisiuni extinse pe care contul tău nu le deține în prezent.
        </p>

        {/* Security Breakdown Matrix */}
        <div className="admin-access-denied-matrix">
          <div className="admin-access-denied-row">
            <span className="admin-access-denied-key">
              <User size={13} />
              <span>Cont Autentificat</span>
            </span>
            <div className="admin-access-denied-val">
              <span className="admin-status-pill admin-status-pill--neutral">
                {displayName || username}
              </span>
              <span className="admin-status-pill admin-status-pill--role">
                {role.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="admin-access-denied-row">
            <span className="admin-access-denied-key">
              <AlertOctagon size={13} />
              <span>Secțiune Solicitată</span>
            </span>
            <div className="admin-access-denied-val">
              <code className="admin-code-cell">{pathname}</code>
              {requiredSpec?.category && (
                <span className="admin-status-pill admin-status-pill--category">
                  {requiredSpec.category}
                </span>
              )}
            </div>
          </div>

          <div className="admin-access-denied-row">
            <span className="admin-access-denied-key">
              <Key size={13} />
              <span>Permisiune Necesară</span>
            </span>
            <div className="admin-access-denied-val">
              <span className="admin-perm-tag admin-perm-tag--denied">
                {requiredSpec?.permKey || "Drepturi Extinse"}
              </span>
              {requiredSpec?.label && (
                <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                  ({requiredSpec.label})
                </span>
              )}
            </div>
          </div>

          <div className="admin-access-denied-row">
            <span className="admin-access-denied-key">
              <ShieldCheck size={13} />
              <span>Autoritate de Deblocare</span>
            </span>
            <div className="admin-access-denied-val">
              <span className="admin-root-badge">SUPER ADMIN ROOT (@iannC69)</span>
            </div>
          </div>
        </div>

        {/* Helpful Info Alert */}
        <div className="admin-access-denied-notice">
          <Lock size={14} className="text-amber-400 flex-shrink-0" />
          <span>
            Dacă ai nevoie de acces la această secțiune pentru îndeplinirea atribuțiilor administrative, solicită Super Administratorului Root (<strong>iannC69</strong>) activarea permisiunii specifice în modulul de gestiune a echipei.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="admin-access-denied-actions">
          <Link href="/admin" className="admin-btn admin-btn--primary">
            <LayoutDashboard size={14} />
            <span>Înapoi la Mission Control</span>
          </Link>
          {canEditDocs && (
            <Link href="/admin/content" className="admin-btn admin-btn--secondary">
              <FileEdit size={14} />
              <span>Deschide Content Studio</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
