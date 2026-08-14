"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function FeedbackWidget() {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  if (voted) {
    return (
      <div className="feedback">
        <span className="feedback-thanks">
          {voted === "yes" ? "🎉 Thanks for the feedback!" : "📝 Thanks! We'll work on improving this."}
        </span>
      </div>
    );
  }

  return (
    <div className="feedback">
      <span className="feedback-label">Was this page helpful?</span>
      <div className="feedback-btns">
        <button className="feedback-btn feedback-btn--yes" onClick={() => setVoted("yes")}>
          <ThumbsUp size={14} /> Yes
        </button>
        <button className="feedback-btn feedback-btn--no" onClick={() => setVoted("no")}>
          <ThumbsDown size={14} /> No
        </button>
      </div>
    </div>
  );
}
