"use client";

import { useState } from "react";

interface Props {
  namespace: string;
  name: string;
  version?: string;
}

export default function InstallCommand({ namespace, name, version }: Props) {
  const [copied, setCopied] = useState(false);
  const cmd = version
    ? `zeroclaw skill install ${namespace}/${name}@${version}`
    : `zeroclaw skill install ${namespace}/${name}`;

  const copy = async () => {
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 text-[#f97316] font-mono text-sm select-none">$</span>
        <code className="font-mono text-sm text-[#f0f0f0] truncate">{cmd}</code>
      </div>
      <button
        onClick={copy}
        className="shrink-0 flex items-center gap-1.5 rounded-lg border border-[#1e1e1e] px-3 py-1.5 text-xs text-[#a0a0a0] transition-all hover:border-[#f97316]/40 hover:text-[#f0f0f0] active:scale-95"
      >
        {copied ? (
          <>
            <CheckIcon className="h-3.5 w-3.5 text-[#22c55e]" />
            <span className="text-[#22c55e]">Copied</span>
          </>
        ) : (
          <>
            <CopyIcon className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 11V3.5A1.5 1.5 0 014.5 2H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 8.5l4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
