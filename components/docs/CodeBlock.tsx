"use client";
import { useState, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  "data-language"?: string;
  "data-filename"?: string;
}

export function CodeBlock({
  children,
  "data-language": lang,
  "data-filename": filename,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">
          {filename ? (
            <span className="code-block-filename">{filename}</span>
          ) : (
            lang ?? "code"
          )}
        </span>
        <button
          onClick={handleCopy}
          className={`code-block-copy${copied ? " copied" : ""}`}
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <><Check size={12} /> Copied</>
          ) : (
            <><Copy size={12} /> Copy</>
          )}
        </button>
      </div>
      <pre ref={preRef} {...props}>{children}</pre>
    </div>
  );
}
