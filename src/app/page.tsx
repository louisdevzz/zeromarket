import Link from "next/link";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import { CATEGORIES, formatDownloads, getAllPackages } from "@/lib/data";

export default async function HomePage() {
  const allPackages = await getAllPackages();
  const featured = allPackages.filter((p) => p.verified);
  const totalDownloads = allPackages.reduce((s, p) => s + p.downloads, 0);

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-[#1e1e1e]">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.12) 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/5 px-4 py-1.5 text-sm text-[#f97316] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f97316] animate-pulse" />
            Official WASM Skill Registry for ZeroClaw
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#f0f0f0] mb-6 leading-tight">
            Extend your agent
            <br />
            <span className="text-[#f97316]">without limits.</span>
          </h1>

          <p className="text-lg text-[#707070] max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse, install, and publish WASM skill packages for your ZeroClaw agent.
            Any language. One command. Zero friction.
          </p>

          {/* Install hero command */}
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a]/80 backdrop-blur-sm max-w-lg mx-auto px-6 py-4 mb-10">
            <span className="text-[#f97316] font-mono text-sm shrink-0">$</span>
            <code className="font-mono text-sm text-[#f0f0f0] flex-1 text-left">
              zeroclaw skill install &lt;namespace&gt;/&lt;skill&gt;
            </code>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/browse"
              className="rounded-full bg-[#f97316] px-6 py-3 text-sm font-semibold text-black hover:bg-[#fb923c] transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              Browse {allPackages.length} skills
            </Link>
            <a
              href="https://docs.zeromarket.dev/publish"
              className="rounded-full border border-[#1e1e1e] px-6 py-3 text-sm font-semibold text-[#a0a0a0] hover:text-[#f0f0f0] hover:border-[#2e2e2e] transition-colors"
            >
              Publish a skill →
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: allPackages.length.toString(), label: "Skills" },
            { value: formatDownloads(totalDownloads), label: "Installs" },
            { value: "4", label: "Languages" },
            { value: "100%", label: "WASI sandbox" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-[#f97316]">{value}</div>
              <div className="text-sm text-[#505050] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16 space-y-16">
        {/* ── Categories ── */}
        <section>
          <SectionHeader title="Categories" href="/browse" />
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.tag}
                href={`/browse?tag=${cat.tag}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] p-4 text-center transition-all hover:border-[#f97316]/30 hover:bg-[#111111] group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium text-[#a0a0a0] group-hover:text-[#f0f0f0] transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured / Official ── */}
        {featured.length > 0 && (
          <section>
            <SectionHeader
              title="Official Skills"
              subtitle="Maintained by the ZeroClaw team"
              href="/browse?namespace=zeroclaw"
            />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((pkg) => (
                <SkillCard key={`${pkg.namespace}/${pkg.name}`} pkg={pkg} />
              ))}
            </div>
          </section>
        )}

        {/* ── Community ── */}
        {allPackages.filter((p) => !p.verified).length > 0 && (
          <section>
            <SectionHeader
              title="Community Skills"
              subtitle="Built and shared by the community"
              href="/browse"
            />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPackages.filter((p) => !p.verified).map((pkg) => (
                <SkillCard key={`${pkg.namespace}/${pkg.name}`} pkg={pkg} />
              ))}
            </div>
          </section>
        )}

        {/* ── How it works ── */}
        <section className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] overflow-hidden">
          <div className="px-8 py-10">
            <h2 className="text-xl font-bold text-[#f0f0f0] mb-2">How ZeroMarket works</h2>
            <p className="text-sm text-[#707070] mb-8">
              WASM skills use a simple stdin/stdout protocol. Any language that compiles to WebAssembly works.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Find a skill",
                  body: "Search the registry. Every skill shows its tools, install command, and documentation.",
                },
                {
                  step: "02",
                  title: "Install in one command",
                  body: "zeroclaw skill install namespace/name downloads and verifies the WASM binaries automatically.",
                },
                {
                  step: "03",
                  title: "Agent uses it",
                  body: "ZeroClaw auto-discovers installed skills. The LLM can call your new tool immediately.",
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-4">
                  <span className="shrink-0 font-mono text-xs font-bold text-[#f97316] mt-0.5">{step}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#f0f0f0] mb-1">{title}</h3>
                    <p className="text-sm text-[#707070] leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Protocol code strip */}
          <div className="border-t border-[#1e1e1e] bg-[#0a0a0a] px-8 py-5">
            <p className="text-xs text-[#505050] mb-3 font-mono">WASI stdio protocol — the only contract your tool must follow:</p>
            <div className="flex flex-col sm:flex-row gap-2 font-mono text-xs">
              <div className="flex-1 rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3">
                <span className="text-[#505050]">{"// stdin → args from LLM"}</span>
                <br />
                <span className="text-[#f97316]">{"{"}</span>
                <span className="text-[#a0a0a0]">&quot;city&quot;: &quot;Hanoi&quot;</span>
                <span className="text-[#f97316]">{"}"}</span>
              </div>
              <div className="hidden sm:flex items-center text-[#2e2e2e] text-lg">→</div>
              <div className="flex-1 rounded-lg border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3">
                <span className="text-[#505050]">{"// stdout → result"}</span>
                <br />
                <span className="text-[#f97316]">{"{"}</span>
                <span className="text-[#22c55e]">&quot;success&quot;: true</span>
                <span className="text-[#a0a0a0]">, &quot;output&quot;: &quot;…&quot;</span>
                <span className="text-[#f97316]">{"}"}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e1e1e] mt-8">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#505050]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f97316]">ZeroMarket</span>
              <span>— The ZeroClaw skill registry</span>
            </div>
            <div className="text-xs text-[#3a3a3a]">
              Built by{" "}
              <a
                href="https://potlock.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#505050] hover:text-[#a0a0a0] transition-colors"
              >
                Potluck Labs, Inc
              </a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://docs.zeromarket.dev" className="hover:text-[#a0a0a0] transition-colors">Docs</a>
            <a href="https://github.com/zeroclaw-labs/zeroclaw" className="hover:text-[#a0a0a0] transition-colors">GitHub</a>
            <a href="/api/v1/packages" className="hover:text-[#a0a0a0] transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-[#f0f0f0]">{title}</h2>
        {subtitle && <p className="text-sm text-[#505050] mt-0.5">{subtitle}</p>}
      </div>
      <Link href={href} className="text-sm text-[#f97316] hover:text-[#fb923c] transition-colors">
        View all →
      </Link>
    </div>
  );
}
