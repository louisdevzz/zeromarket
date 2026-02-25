"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Link from "next/link";

interface FileEntry {
  file: File;
  relativePath: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Files allowed in a skill package — source code and build artifacts are excluded. */
const ALLOWED_FILENAMES = new Set([
  "tool.wasm",
  "manifest.json",
  "SKILL.md",
  "README.md",
]);

function isAllowedFile(relativePath: string): boolean {
  const basename = relativePath.split("/").pop() ?? relativePath;
  return ALLOWED_FILENAMES.has(basename);
}

function stripFolderPrefix(relativePath: string): string {
  // webkitdirectory gives "folder/file.txt" — strip the outer folder prefix
  const parts = relativePath.split("/");
  return parts.length > 1 ? parts.slice(1).join("/") : relativePath;
}

function generateSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getValidationErrors(
  slug: string,
  displayName: string,
  files: FileEntry[],
  isDuplicate: boolean
): string[] {
  const errors: string[] = [];
  if (!slug.trim()) errors.push("Slug is required.");
  if (!displayName.trim()) errors.push("Display name is required.");
  if (isDuplicate) errors.push("A skill with this name already exists in your namespace.");
  if (files.length === 0) errors.push("Add at least one file.");
  if (files.length > 0) {
    const hasWasm = files.some((f) => f.relativePath.endsWith(".wasm"));
    if (!hasWasm) errors.push("At least one .wasm file is required.");
    const hasSkillMd = files.some(
      (f) =>
        f.relativePath === "SKILL.md" || f.relativePath.endsWith("/SKILL.md")
    );
    if (!hasSkillMd) errors.push("SKILL.md is required.");
  }
  return errors;
}

export default function UploadPage() {
  const { data: session, status } = useSession();

  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [tagsInput, setTagsInput] = useState("");
  const [changelog, setChangelog] = useState("");
  const [slugFromManifest, setSlugFromManifest] = useState(false);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const validationErrors = getValidationErrors(slug, displayName, files, isDuplicate);
  const isValid = validationErrors.length === 0;

  // Debounced slug duplicate check
  useEffect(() => {
    if (!slug.trim() || !session) {
      setIsDuplicate(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          setIsDuplicate(data.exists);
        }
      } catch {
        // Ignore network errors
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slug, session]);

  const processFiles = useCallback(
    async (rawFiles: FileList | File[]) => {
      const entries: FileEntry[] = [];
      for (const file of Array.from(rawFiles)) {
        const raw =
          (file as { webkitRelativePath?: string }).webkitRelativePath ||
          file.name;
        // Strip outer folder prefix and filter to allowed files only
        const relativePath = stripFolderPrefix(raw);
        if (!isAllowedFile(relativePath)) continue;
        entries.push({ file, relativePath });
      }

      setFiles(entries);

      // Auto-parse manifest.json to pre-fill form fields
      const manifestFile = entries.find(
        (e) =>
          e.relativePath.endsWith("manifest.json") &&
          !e.relativePath.endsWith(".manifest.json")
      );
      if (manifestFile) {
        try {
          const text = await manifestFile.file.text();
          const manifest = JSON.parse(text);
          if (manifest.name && !slug) {
            setSlug(manifest.name);
            setSlugFromManifest(true);
          }
          if (manifest.display_name && !displayName)
            setDisplayName(manifest.display_name);
          if (manifest.tags && Array.isArray(manifest.tags) && !tagsInput)
            setTagsInput(manifest.tags.join(", "));
        } catch {
          // Non-fatal
        }
      }
    },
    [slug, displayName, tagsInput]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  const handlePublish = async () => {
    if (!isValid || !session) return;
    setUploading(true);
    setUploadError(null);
    setSuccessUrl(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.set("slug", slug.trim());
    formData.set("displayName", displayName.trim());
    formData.set("version", version.trim() || "1.0.0");
    formData.set("tags", JSON.stringify(tags));
    formData.set("changelog", changelog);

    for (const entry of files) {
      // Send file with basename as name so the server can save it
      const renamedFile = new File([entry.file], entry.relativePath, {
        type: entry.file.type,
      });
      formData.append("files", renamedFile);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
      } else {
        setSuccessUrl(data.url);
      }
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const displayedFiles = files.slice(0, 5);
  const extraCount = files.length - 5;

  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-[#505050] mb-2";
  const inputClass =
    "w-full border border-[#1e1e1e] bg-[#0a0a0a] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder-[#3a3a3a] focus:border-[#f97316]/40 outline-none transition-colors";
  const panelClass =
    "rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-6";

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Publish a Skill</h1>
          <p className="text-sm text-[#505050] mt-1">
            Upload your WASM skill package to the ZeroMarket registry.
          </p>
        </div>

        {successUrl ? (
          <div className="rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/5 p-8 text-center">
            <div className="text-[#22c55e] text-4xl mb-3">✓</div>
            <h2 className="text-lg font-semibold text-[#f0f0f0] mb-2">
              Skill published successfully!
            </h2>
            <Link
              href={successUrl}
              className="inline-flex items-center gap-2 mt-3 rounded-full bg-[#f97316] px-5 py-2 text-sm font-semibold text-black hover:bg-[#fb923c] transition-colors"
            >
              View package ↗
            </Link>
          </div>
        ) : (
          <>
            {/* 2×2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Top-left: Form fields */}
              <div className={panelClass}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#505050] mb-5">
                  Package Info
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        const newDisplayName = e.target.value;
                        setDisplayName(newDisplayName);
                        if (!slugFromManifest) {
                          setSlug(generateSlug(newDisplayName));
                        }
                      }}
                      placeholder="My Skill"
                      className={`${inputClass} ${isDuplicate ? "border-red-500/50" : ""}`}
                    />
                    {isCheckingSlug && (
                      <p className="text-[11px] text-[#505050] mt-1">
                        Checking availability...
                      </p>
                    )}
                    {isDuplicate && (
                      <p className="text-[11px] text-red-400 mt-1">
                        A skill with this name already exists in your namespace.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Version</label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tags</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="latest, utility, api"
                      className={inputClass}
                    />
                    <p className="text-[11px] text-[#3a3a3a] mt-1">
                      Comma separated
                    </p>
                  </div>
                </div>
              </div>

              {/* Top-right: Drop zone */}
              <div className={panelClass}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-[#505050]">
                    Drop a Folder
                  </h2>
                  {files.length > 0 && (
                    <span className="text-[11px] text-[#505050]">
                      {files.length} file{files.length !== 1 ? "s" : ""} ·{" "}
                      {formatBytes(totalSize)}
                    </span>
                  )}
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`rounded-lg border-dashed border-2 transition-colors p-6 text-center ${
                    isDragging
                      ? "border-[#f97316] bg-[#f97316]/5"
                      : "border-[#f97316]/40"
                  }`}
                >
                  <p className="text-sm font-medium text-[#a0a0a0] mb-1">
                    Drop your skill folder here
                  </p>
                  <p className="text-xs text-[#505050] mb-1">
                    Only <span className="font-mono text-[#707070]">tool.wasm</span>,{" "}
                    <span className="font-mono text-[#707070]">manifest.json</span>,{" "}
                    <span className="font-mono text-[#707070]">SKILL.md</span>,{" "}
                    <span className="font-mono text-[#707070]">README.md</span>{" "}
                    will be uploaded — source code and build artifacts are filtered out automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-default mt-3 rounded-md border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-2 text-xs font-semibold text-[#a0a0a0] hover:border-[#f97316]/40 hover:text-[#f0f0f0] transition-colors"
                  >
                    Choose Folder
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    // @ts-expect-error webkitdirectory is non-standard but widely supported
                    webkitdirectory="true"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>

                <div className="mt-4">
                  {files.length === 0 ? (
                    <p className="text-xs text-[#3a3a3a]">No files selected.</p>
                  ) : (
                    <ul className="space-y-1">
                      {displayedFiles.map((entry, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="truncate text-[#707070] font-mono">
                            {entry.relativePath}
                          </span>
                          <span className="shrink-0 text-[#3a3a3a]">
                            {formatBytes(entry.file.size)}
                          </span>
                        </li>
                      ))}
                      {extraCount > 0 && (
                        <li className="text-xs text-[#3a3a3a]">
                          +{extraCount} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Bottom-left: Validation */}
              <div className={panelClass}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#505050] mb-4">
                  Validation
                </h2>
                {isValid ? (
                  <div className="flex items-center gap-2 text-[#22c55e] text-sm font-semibold">
                    <span>✓</span>
                    <span>Ready to publish.</span>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {validationErrors.map((err, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#f97316]">
                        <span className="shrink-0 mt-0.5">✗</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Bottom-right: Changelog */}
              <div className={panelClass}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#505050] mb-4">
                  Changelog
                </h2>
                <textarea
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Describe what changed in this skill..."
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* Error display */}
            {uploadError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {uploadError}
              </div>
            )}

            {/* Publish / Sign in */}
            <div className="flex items-center gap-4">
              {status === "loading" ? (
                <div className="text-sm text-[#505050]">Loading…</div>
              ) : !session ? (
                <button
                  onClick={() => signIn("github")}
                  className="cursor-default flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#fb923c] transition-colors"
                >
                  <GitHubIcon className="h-4 w-4" />
                  Sign in with GitHub to publish
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePublish}
                    disabled={!isValid || uploading}
                    className="cursor-default rounded-full bg-[#f97316] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#fb923c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Publishing…" : "Publish Skill"}
                  </button>
                  <span className="text-sm text-[#505050] font-mono">
                    signed in as @{(session.user as { username: string }).username}
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
