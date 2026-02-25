import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import InstallCommand from "@/components/InstallCommand";
import DeletePackageButton from "@/components/DeletePackageButton";
import { getPackage, formatDownloads } from "@/lib/data";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ namespace: string; name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { namespace, name } = await params;
  const pkg = await getPackage(namespace, name);
  if (!pkg) return { title: "Not Found" };
  return {
    title: `${namespace}/${name}`,
    description: pkg.description,
  };
}

export default async function PackagePage({ params }: PageProps) {
  const { namespace, name } = await params;
  const pkg = await getPackage(namespace, name);
  if (!pkg) notFound();

  // Check if current user is the owner
  const session = await auth();
  const isOwner = session?.user?.name === namespace;

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#505050] mb-8">
          <Link href="/browse" className="hover:text-[#a0a0a0] transition-colors">Skills</Link>
          <span>/</span>
          <Link href={`/browse?namespace=${namespace}`} className="hover:text-[#a0a0a0] transition-colors">{namespace}</Link>
          <span>/</span>
          <span className="text-[#f0f0f0]">{name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Package header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-[#707070] text-sm">{namespace}/</span>
                {pkg.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f97316]/10 px-2 py-0.5 text-xs font-semibold text-[#f97316]">
                    ✓ official
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-[#f0f0f0] mb-3">{name}</h1>
              <p className="text-[#a0a0a0] text-base leading-relaxed max-w-2xl">
                {pkg.long_description ?? pkg.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {pkg.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/browse?tag=${tag}`}
                    className="rounded-md border border-[#1e1e1e] bg-[#111111] px-3 py-1 text-xs text-[#707070] hover:text-[#f97316] hover:border-[#f97316]/30 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Install */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#505050] mb-3">Install</h2>
              <InstallCommand namespace={namespace} name={name} />
              <p className="text-xs text-[#505050] mt-2">
                Requires ZeroClaw ≥ 0.1.7 with{" "}
                <code className="font-mono bg-[#111111] px-1 py-0.5 rounded text-[#a0a0a0]">--features wasm-tools</code>
              </p>
            </div>

            {/* Tools in this package */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#505050] mb-3">
                Tools ({pkg.tools.length})
              </h2>
              <div className="space-y-3">
                {pkg.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <code className="font-mono text-sm font-semibold text-[#f97316]">{tool.name}</code>
                    </div>
                    <p className="text-sm text-[#707070]">{tool.description}</p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 font-mono text-[11px] text-[#505050]">
                      <span className="truncate">
                        <span className="text-[#3a3a3a]">wasm  </span>{tool.wasm_url.split("/").pop()}
                      </span>
                      <span className="hidden sm:block text-[#2a2a2a]">·</span>
                      <span className="truncate">
                        <span className="text-[#3a3a3a]">manifest  </span>{tool.manifest_url.split("/").pop()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* README */}
            {pkg.readme && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-[#505050] mb-3">README</h2>
                <div className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-6">
                  <ReadmeRenderer content={pkg.readme} />
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:w-72 shrink-0 space-y-5">
            {/* Meta card */}
            <div className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-5 space-y-4">
              <MetaRow label="Version" value={`v${pkg.version}`} mono />
              <MetaRow label="Published" value={pkg.published_at} />
              <MetaRow label="Author" value={pkg.author} mono />
              <MetaRow label="Installs" value={formatDownloads(pkg.downloads)} />
              <MetaRow label="Tools" value={pkg.tools.length.toString()} />
            </div>

            {/* Links */}
            {(pkg.homepage || pkg.repository) && (
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#505050] mb-3">Links</p>
                {pkg.homepage && (
                  <ExternalLink href={pkg.homepage} label="Homepage" />
                )}
                {pkg.repository && (
                  <ExternalLink href={pkg.repository} label="Repository" />
                )}
              </div>
            )}

            {/* API endpoint info */}
            <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#505050] mb-3">Registry API</p>
              <p className="text-xs text-[#505050] mb-2">ZeroClaw fetches this endpoint during install:</p>
              <code className="block font-mono text-[11px] text-[#707070] break-all">
                GET /api/v1/packages/{namespace}/{name}
              </code>
            </div>

            {/* Delete button (only for owner) */}
            <DeletePackageButton namespace={namespace} name={name} isOwner={isOwner} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-[#505050]">{label}</span>
      <span className={`text-sm text-[#a0a0a0] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-2 text-sm text-[#707070] hover:text-[#f97316] transition-colors group"
    >
      <span>{label}</span>
      <span className="text-[#3a3a3a] group-hover:text-[#f97316] transition-colors">↗</span>
    </a>
  );
}

function ReadmeRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-[#f0f0f0] mt-0 mb-4 pb-2 border-b border-[#1e1e1e]">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold text-[#f0f0f0] mt-8 mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-[#f0f0f0] mt-6 mb-2">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-[#a0a0a0] leading-relaxed mb-4">
            {children}
          </p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-[#f97316] hover:text-[#fb923c] transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="font-mono text-sm bg-[#1a1a1a] text-[#f0f0f0] px-1.5 py-0.5 rounded">
              {children}
            </code>
          ) : (
            <pre className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-4 overflow-x-auto my-4">
              <code className={`${className} font-mono text-sm text-[#a0a0a0]`}>
                {children}
              </code>
            </pre>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-[#a0a0a0] space-y-1 mb-4 pl-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-[#a0a0a0] space-y-1 mb-4 pl-2">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[#f97316] pl-4 italic text-[#707070] my-4">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-[#1e1e1e] my-6" />,
        table: ({ children }) => (
          <table className="w-full text-sm text-left text-[#a0a0a0] border border-[#1e1e1e] rounded-lg overflow-hidden my-4">
            {children}
          </table>
        ),
        thead: ({ children }) => (
          <thead className="bg-[#1a1a1a] text-[#f0f0f0]">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 border-t border-[#1e1e1e]">{children}</td>
        ),
        strong: ({ children }) => (
          <strong className="text-[#f0f0f0] font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
