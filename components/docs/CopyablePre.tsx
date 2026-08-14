"use client";
import React, { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

export function CopyablePre({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & { [key: string]: any }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // Extract language from props or className (e.g. data-language="bash", className="language-typescript")
  const rawLang =
    props["data-language"] ||
    props["data-lang"] ||
    (typeof props.className === "string" && props.className.match(/language-([a-zA-Z0-9_-]+)/)?.[1]) ||
    "code";

  const displayLang = String(rawLang).toUpperCase();

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{displayLang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`code-block-copy${copied ? " copied" : ""}`}
          aria-label={copied ? "Copied to clipboard" : "Copy code"}
        >
          {copied ? (
            <>
              <Check size={12} aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
}
