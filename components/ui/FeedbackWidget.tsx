"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare } from "lucide-react";

export function FeedbackWidget() {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  if (voted) {
    return (
      <div className="feedback">
        {voted === "yes" ? (
          <span className="feedback-thanks">
            <CheckCircle2 size={15} className="feedback-thanks-icon" aria-hidden="true" />
            Thank you for your feedback!
          </span>
        ) : (
          <span className="feedback-thanks">
            <MessageSquare size={15} className="feedback-thanks-icon" aria-hidden="true" />
            Thank you. We will work on improving this guide.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="feedback">
      <span className="feedback-label">Was this page helpful?</span>
      <div className="feedback-btns">
        <button
          type="button"
          className="feedback-btn feedback-btn--yes"
          onClick={() => setVoted("yes")}
          aria-label="Mark page as helpful"
        >
          <ThumbsUp size={13} aria-hidden="true" />
          <span>Yes</span>
        </button>
        <button
          type="button"
          className="feedback-btn feedback-btn--no"
          onClick={() => setVoted("no")}
          aria-label="Mark page as not helpful"
        >
          <ThumbsDown size={13} aria-hidden="true" />
          <span>No</span>
        </button>
      </div>
    </div>
  );
}
