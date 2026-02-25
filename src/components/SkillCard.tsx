import Link from "next/link";
import { SkillPackage } from "@/lib/types";
import { formatDownloads } from "@/lib/data";

interface Props {
  pkg: SkillPackage;
}

export default function SkillCard({ pkg }: Props) {
  const href = `/packages/${pkg.namespace}/${pkg.name}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-5 transition-all duration-200 hover:border-[#f97316]/40 hover:bg-[#111111] hover:shadow-[0_0_20px_rgba(249,115,22,0.07)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[#707070] text-sm font-mono">{pkg.namespace}/</span>
            {pkg.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f97316]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#f97316]">
                ✓ official
              </span>
            )}
          </div>
          <h3 className="text-[#f0f0f0] font-semibold text-base leading-tight truncate group-hover:text-[#f97316] transition-colors">
            {pkg.name}
          </h3>
        </div>
        <span className="shrink-0 rounded-md border border-[#1e1e1e] px-2 py-0.5 font-mono text-xs text-[#707070]">
          v{pkg.version}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-[#a0a0a0] leading-relaxed line-clamp-2 mb-4 flex-1">
        {pkg.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {pkg.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#161616] px-2 py-0.5 text-[11px] text-[#707070] border border-[#1e1e1e]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[#505050]">
        <span className="flex items-center gap-1.5">
          <ToolsIcon className="h-3.5 w-3.5" />
          {pkg.tools.length} tool{pkg.tools.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <DownloadIcon className="h-3.5 w-3.5" />
          {formatDownloads(pkg.downloads)} installs
        </span>
      </div>
    </Link>
  );
}

function ToolsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
