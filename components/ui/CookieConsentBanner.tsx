"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  SlidersHorizontal,
  Cookie,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  ExternalLink,
  Shield,
  Activity,
  Layers,
  Megaphone,
} from "lucide-react";

interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
}

const STORAGE_KEY = "wf_cookie_consent_v1";

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  // Success animation state
  const [successPhase, setSuccessPhase] = useState<null | "loading" | "success" | "closing">(null);

  // Preference state
  const [functional, setFunctional] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<boolean>(true);
  const [marketing, setMarketing] = useState<boolean>(false);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (modalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [modalOpen]);

  useEffect(() => {
    // Check if consent was already given
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Delay slightly for smooth entrance
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed: CookiePreferences = JSON.parse(stored);
        setFunctional(parsed.functional ?? true);
        setAnalytics(parsed.analytics ?? true);
        setMarketing(parsed.marketing ?? false);
      }
    } catch {
      setIsOpen(true);
    }

    // Global listener so user can reopen preferences from footer or anywhere
    const handleReopen = () => {
      setIsOpen(false);
      setModalOpen(true);
    };

    window.addEventListener("wf-open-cookie-preferences", handleReopen);
    return () => {
      window.removeEventListener("wf-open-cookie-preferences", handleReopen);
    };
  }, []);

  const savePreferences = (prefs: {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => {
    const payload: CookiePreferences = {
      essential: true,
      functional: prefs.functional,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  };

  const saveWithAnimation = (prefs: {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => {
    savePreferences(prefs);
    setModalOpen(false);
    setIsOpen(true);
    setSuccessPhase("loading");

    // Phase 2: Success checkmark & emerald burst
    setTimeout(() => {
      setSuccessPhase("success");
    }, 1100);

    // Phase 3: Smooth exit slide down
    setTimeout(() => {
      setSuccessPhase("closing");
    }, 2800);

    // Final unmount
    setTimeout(() => {
      setSuccessPhase(null);
      setIsOpen(false);
    }, 3200);
  };

  const handleAcceptAll = () => {
    setFunctional(true);
    setAnalytics(true);
    setMarketing(true);
    saveWithAnimation({ functional: true, analytics: true, marketing: true });
  };

  const handleRejectNonEssential = () => {
    setFunctional(false);
    setAnalytics(false);
    setMarketing(false);
    savePreferences({ functional: false, analytics: false, marketing: false });
    setIsOpen(false);
    setModalOpen(false);
  };

  const handleSaveCustom = () => {
    saveWithAnimation({ functional, analytics, marketing });
  };

  const toggleSection = (sec: string) => {
    setExpandedSection((prev) => (prev === sec ? null : sec));
  };

  return (
    <>
      {/* ── FLOATING BOTTOM BANNER (normal + success states) ────────── */}
      {(isOpen || successPhase) && !modalOpen && (
        <div 
          className={`wf-cookie-banner-wrap ${successPhase === "closing" ? "wf-cookie-banner-wrap--closing" : ""}`} 
          role="region" 
          aria-label="Cookie & Confidentialitate"
        >
          <div className={`wf-cookie-banner ${successPhase ? `wf-cookie-banner--${successPhase}` : ""}`}>

            {/* ── SUCCESS / LOADING continuous seamless card ─── */}
            {successPhase ? (
              <div className={`wf-cookie-inline-success wf-cookie-inline-success--${successPhase}`} role="status" aria-live="polite">
                {/* Radial ambient glow */}
                <div className="wf-cookie-success-glow" aria-hidden="true" />

                {/* Continuous Ring Container */}
                <div className={`wf-cookie-success-ring wf-cookie-success-ring--${successPhase}`} aria-hidden="true">
                  <svg viewBox="0 0 56 56" className="wf-cookie-ring-svg">
                    <circle className="wf-cookie-ring-bg" cx="28" cy="28" r="23" />
                    <circle className="wf-cookie-ring-fill" cx="28" cy="28" r="23" />
                  </svg>

                  {/* Smooth Cross-fading Icons */}
                  <ShieldCheck size={22} className="wf-cookie-icon-shield" />
                  <Check size={24} className="wf-cookie-icon-check" />

                  {/* Micro Particle Burst on Success */}
                  {successPhase === "success" && (
                    <div className="wf-cookie-particles-box">
                      {[...Array(8)].map((_, i) => (
                        <span key={i} className={`wf-cookie-particle wf-cookie-particle--${i}`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Seamless Text & Progress */}
                <div className="wf-cookie-inline-text">
                  <span className={`wf-cookie-success-title ${successPhase === "success" ? "wf-cookie-success-title--success" : ""}`}>
                    {successPhase === "loading" ? "Salvăm preferințele..." : "Preferințe Salvate!"}
                  </span>
                  
                  {successPhase === "loading" ? (
                    <div className="wf-cookie-success-bar">
                      <div className="wf-cookie-success-bar-fill" />
                    </div>
                  ) : (
                    <span className="wf-cookie-success-sublabel">
                      Experiența ta WildFire a fost personalizată.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Left Content */}
                <div className="wf-cookie-banner-content">
                  <div className="wf-cookie-banner-header">
                    <div className="wf-cookie-icon-box">
                      <Cookie size={17} />
                    </div>
                    <div>
                      <h4 className="wf-cookie-title">Confidențialitate &amp; Tehnologii de Stocare</h4>
                      <div className="wf-cookie-gdpr-tag">
                        <ShieldCheck size={11} />
                        <span>Conform GDPR &amp; Directiva ePrivacy UE</span>
                      </div>
                    </div>
                  </div>

                  <p className="wf-cookie-description">
                    Utilizăm module cookie și stocare locală pentru a îmbunătăți performanța platformei,
                    a reține preferințele de navigare (dark/light) și a genera statistici anonime despre
                    articolele consultate. Cookie-urile funcționale sunt esențiale pentru rularea documentației.
                  </p>
                </div>

                {/* Right Actions */}
                <div className="wf-cookie-banner-actions">
                  <button
                    type="button"
                    id="cookie-customize-btn"
                    onClick={() => setModalOpen(true)}
                    className="wf-cookie-btn wf-cookie-btn--secondary"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Personalizează</span>
                  </button>

                  <button
                    type="button"
                    id="cookie-reject-btn"
                    onClick={handleRejectNonEssential}
                    className="wf-cookie-btn wf-cookie-btn--ghost"
                  >
                    <span>Doar Necesare</span>
                  </button>

                  <button
                    type="button"
                    id="cookie-accept-btn"
                    onClick={handleAcceptAll}
                    className="wf-cookie-btn wf-cookie-btn--primary"
                  >
                    <Check size={13} />
                    <span>Accept Toate</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── DETAILED PREFERENCES MODAL ─────────────────────────────── */}
      {modalOpen && (
        <div className="wf-cookie-modal-overlay" role="dialog" aria-modal="true">
          <div className="wf-cookie-modal">

            {/* Modal Header */}
            <div className="wf-cookie-modal-header">
              <div className="wf-cookie-modal-title-group">
                <div className="wf-cookie-modal-icon">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="wf-cookie-modal-title">Preferințe Confidențialitate &amp; Cookie-uri</h3>
                  <p className="wf-cookie-modal-subtitle">
                    Personalizează ce categorii de date și cookie-uri permiți pe acest dispozitiv.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="wf-cookie-modal-close"
                title="Închide"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category Cards List */}
            <div className="wf-cookie-categories-list">

              {/* 1. Essential */}
              <div className={`wf-cookie-cat-card ${expandedSection === "essential" ? "wf-cookie-cat-card--expanded" : ""}`}>
                <div className="wf-cookie-cat-header" onClick={() => toggleSection("essential")}>
                  <div className="wf-cookie-cat-left">
                    <div className="wf-cookie-cat-icon wf-cookie-cat-icon--green">
                      <Lock size={15} />
                    </div>
                    <div className="wf-cookie-cat-info">
                      <div className="wf-cookie-cat-title-row">
                        <span className="wf-cookie-cat-title">Esențiale &amp; Securitate</span>
                        <span className="wf-cookie-badge wf-cookie-badge--required">MANDATORIU</span>
                      </div>
                      <span className="wf-cookie-cat-sub">Sesiuni, protecție CSRF și randare pagini</span>
                    </div>
                  </div>

                  <div className="wf-cookie-cat-right">
                    <div className="wf-cookie-toggle wf-cookie-toggle--locked" title="Permanent activ">
                      <span className="wf-cookie-toggle-thumb wf-cookie-toggle-thumb--on" />
                    </div>
                    <button type="button" className="wf-cookie-expand-btn">
                      {expandedSection === "essential" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {expandedSection === "essential" && (
                  <div className="wf-cookie-cat-details">
                    <p>
                      Aceste tehnologii sunt strict necesare pentru funcționarea securizată a platformei Wildfire Docs.
                      Includ sesiunile de autentificare securizate ale echipei administrative, cheile de sesiune
                      anti-CSRF și mecanismul de protecție împotriva atacurilor DDoS.
                    </p>
                    <div className="wf-cookie-tech-pill">
                      <span>Exemple:</span>
                      <code>wf_admin_session</code>
                      <code>wf_csrf_token</code>
                      <code>data-theme</code>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Functional */}
              <div className={`wf-cookie-cat-card ${expandedSection === "functional" ? "wf-cookie-cat-card--expanded" : ""}`}>
                <div className="wf-cookie-cat-header" onClick={() => toggleSection("functional")}>
                  <div className="wf-cookie-cat-left">
                    <div className="wf-cookie-cat-icon wf-cookie-cat-icon--orange">
                      <Layers size={15} />
                    </div>
                    <div className="wf-cookie-cat-info">
                      <div className="wf-cookie-cat-title-row">
                        <span className="wf-cookie-cat-title">Funcționale &amp; Preferințe UI</span>
                        <span className="wf-cookie-badge wf-cookie-badge--recommended">RECOMANDAT</span>
                      </div>
                      <span className="wf-cookie-cat-sub">Păstrare Dark Mode, poziție sidebar și istoric căutare</span>
                    </div>
                  </div>

                  <div className="wf-cookie-cat-right">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={functional}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFunctional((v) => !v);
                      }}
                      className={`wf-cookie-toggle ${functional ? "wf-cookie-toggle--on" : ""}`}
                    >
                      <span className="wf-cookie-toggle-thumb" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleSection("functional"); }} className="wf-cookie-expand-btn">
                      {expandedSection === "functional" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {expandedSection === "functional" && (
                  <div className="wf-cookie-cat-details">
                    <p>
                      Permit reținerea setărilor tale vizuale pentru a nu le reconfigura la fiecare accesare:
                      starea extinsă/restrânsă a capitolelor din documentație, istoricul căutărilor recente
                      și preferința de layout.
                    </p>
                    <div className="wf-cookie-tech-pill">
                      <span>Stocare:</span>
                      <code>localStorage.theme</code>
                      <code>wf_search_recent</code>
                      <code>wf_sidebar_state</code>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Analytics */}
              <div className={`wf-cookie-cat-card ${expandedSection === "analytics" ? "wf-cookie-cat-card--expanded" : ""}`}>
                <div className="wf-cookie-cat-header" onClick={() => toggleSection("analytics")}>
                  <div className="wf-cookie-cat-left">
                    <div className="wf-cookie-cat-icon wf-cookie-cat-icon--purple">
                      <Activity size={15} />
                    </div>
                    <div className="wf-cookie-cat-info">
                      <div className="wf-cookie-cat-title-row">
                        <span className="wf-cookie-cat-title">Analitice &amp; Telemetrie Docs</span>
                        <span className="wf-cookie-badge wf-cookie-badge--analytics">PERFORMANȚĂ</span>
                      </div>
                      <span className="wf-cookie-cat-sub">Contorizare vizualizări pagini și acoperire căutare</span>
                    </div>
                  </div>

                  <div className="wf-cookie-cat-right">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={analytics}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnalytics((v) => !v);
                      }}
                      className={`wf-cookie-toggle ${analytics ? "wf-cookie-toggle--on" : ""}`}
                    >
                      <span className="wf-cookie-toggle-thumb" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleSection("analytics"); }} className="wf-cookie-expand-btn">
                      {expandedSection === "analytics" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {expandedSection === "analytics" && (
                  <div className="wf-cookie-cat-details">
                    <p>
                      Ne ajută să înțelegem ce articole sunt cele mai citite și ce subiecte caută jucătorii
                      fără a găsi rezultate (Search Content Gaps). Datele sunt agregate anonim, fără colectare de date personale cu caracter sensibil.
                    </p>
                    <div className="wf-cookie-tech-pill">
                      <span>Servicii:</span>
                      <code>doc_views (Supabase)</code>
                      <code>search-analytics</code>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Marketing */}
              <div className={`wf-cookie-cat-card ${expandedSection === "marketing" ? "wf-cookie-cat-card--expanded" : ""}`}>
                <div className="wf-cookie-cat-header" onClick={() => toggleSection("marketing")}>
                  <div className="wf-cookie-cat-left">
                    <div className="wf-cookie-cat-icon wf-cookie-cat-icon--orange">
                      <Megaphone size={15} />
                    </div>
                    <div className="wf-cookie-cat-info">
                      <div className="wf-cookie-cat-title-row">
                        <span className="wf-cookie-cat-title">Marketing &amp; Embed-uri Media</span>
                        <span className="wf-cookie-badge wf-cookie-badge--optional">OPȚIONAL</span>
                      </div>
                      <span className="wf-cookie-cat-sub">Embed-uri video YouTube/Twitch și preview-uri externe</span>
                    </div>
                  </div>

                  <div className="wf-cookie-cat-right">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={marketing}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMarketing((v) => !v);
                      }}
                      className={`wf-cookie-toggle ${marketing ? "wf-cookie-toggle--on" : ""}`}
                    >
                      <span className="wf-cookie-toggle-thumb" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleSection("marketing"); }} className="wf-cookie-expand-btn">
                      {expandedSection === "marketing" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {expandedSection === "marketing" && (
                  <div className="wf-cookie-cat-details">
                    <p>
                      Permite încărcarea conținutului multimedia extern integrat în ghiduri (videoclipuri demonstrative
                      de pe YouTube sau stream-uri Twitch). Fără acest acord, embed-urile externe vor fi blocate.
                    </p>
                    <div className="wf-cookie-tech-pill">
                      <span>Integrări:</span>
                      <code>YouTube Embeds</code>
                      <code>Twitch Streams</code>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="wf-cookie-modal-footer">
              <div className="wf-cookie-footer-note">
                <span className="wf-cookie-note-icon">
                  <ShieldCheck size={13} />
                </span>
                <span>Preferințele sunt salvate local timp de <strong>12 luni</strong>.</span>
              </div>

              <div className="wf-cookie-footer-buttons">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="wf-cookie-btn wf-cookie-btn--ghost"
                >
                  Doar Necesare
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="wf-cookie-btn wf-cookie-btn--secondary"
                >
                  Salvează Preferințele
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="wf-cookie-btn wf-cookie-btn--primary"
                >
                  Accept Toate
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
