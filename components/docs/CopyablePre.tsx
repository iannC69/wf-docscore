"use client";
import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

export function CopyablePre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleCopy}
        className={`code-block-copy${copied ? " copied" : ""}`}
        aria-label={copied ? "Copied!" : "Copy code"}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
      >
        {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
      </button>
      <pre ref={preRef} {...props}>{children}</pre>
    </div>
  );
}
