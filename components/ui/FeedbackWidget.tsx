"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FeedbackWidget() {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const { t, locale } = useLanguage();

  if (voted) {
    return (
      <div className="feedback">
        {voted === "yes" ? (
          <span className="feedback-thanks">
            <CheckCircle2 size={15} className="feedback-thanks-icon" aria-hidden="true" />
            {t.feedback.thankYou}
          </span>
        ) : (
          <span className="feedback-thanks">
            <MessageSquare size={15} className="feedback-thanks-icon" aria-hidden="true" />
            {locale === "ro"
              ? "Îți mulțumim. Vom lucra la îmbunătățirea acestui ghid."
              : "Thank you. We will work on improving this guide."}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="feedback">
      <span className="feedback-label">{t.feedback.wasHelpful}</span>
      <div className="feedback-btns">
        <button
          type="button"
          className="feedback-btn feedback-btn--yes"
          onClick={() => setVoted("yes")}
          aria-label="Mark page as helpful"
        >
          <ThumbsUp size={13} aria-hidden="true" />
          <span>{t.feedback.yes}</span>
        </button>
        <button
          type="button"
          className="feedback-btn feedback-btn--no"
          onClick={() => setVoted("no")}
          aria-label="Mark page as not helpful"
        >
          <ThumbsDown size={13} aria-hidden="true" />
          <span>{t.feedback.no}</span>
        </button>
      </div>
    </div>
  );
}
