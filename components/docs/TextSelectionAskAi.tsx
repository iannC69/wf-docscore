"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";

export function TextSelectionAskAi() {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const checkSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setVisible(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 5 || text.length > 800) {
      setVisible(false);
      return;
    }

    // Ensure selection is inside docs content area
    const anchorNode = selection.anchorNode;
    const element = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
    const docsContainer = element?.closest("#docs-main-container, .docs-content, .docs-article-body, article");

    if (!docsContainer) {
      setVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setVisible(false);
      return;
    }

    // Position popover right above the selection (with viewport clamping)
    const popoverHeight = 36;
    const popoverWidth = 140;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = rect.top + scrollY - popoverHeight - 8;
    if (rect.top < 60) {
      // If too close to top, show below selection
      top = rect.bottom + scrollY + 8;
    }

    let left = rect.left + scrollX + rect.width / 2 - popoverWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 16));

    setSelectedText(text);
    setCoords({ top, left });
    setVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small timeout to allow selection range to settle
      setTimeout(checkSelection, 20);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVisible(false);
        return;
      }
      setTimeout(checkSelection, 20);
    };

    const handleScroll = () => {
      if (visible) setVisible(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      // Click outside hides
      setVisible(false);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [checkSelection, visible]);

  const handleTriggerAi = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedText) return;

    // Get current page title for extra context
    const pageTitle = typeof document !== "undefined" ? document.title.split("|")[0].trim() : "";

    const query = pageTitle
      ? `Explică-mi pe scurt acest fragment/titlu din ghidul «${pageTitle}»:\n\n> "${selectedText}"`
      : `Explică-mi pe scurt această secțiune din documentație:\n\n> "${selectedText}"`;

    window.dispatchEvent(
      new CustomEvent("wf:open-ai", {
        detail: {
          query,
          autoSubmit: true,
        },
      })
    );

    setVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  if (!visible) return null;

  return (
    <div
      ref={popoverRef}
      className="docs-selection-ai-popover"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      <button
        type="button"
        className="docs-selection-ai-btn"
        onClick={handleTriggerAi}
        title="Explică selecția cu WildFire AI"
      >
        <Sparkles size={12} className="docs-selection-sparkle" />
        <span>Explică cu AI</span>
      </button>
    </div>
  );
}
