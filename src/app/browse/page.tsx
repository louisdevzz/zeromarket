import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import { getAllPackages, CATEGORIES } from "@/lib/data";

interface PageProps {
  searchParams: Promise<{ q?: string; tag?: string; namespace?: string }>;
}

export const metadata = { title: "Browse Skills" };

export default async function BrowsePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";
  const tag = params.tag?.toLowerCase() ?? "";
  const ns = params.namespace?.toLowerCase() ?? "";

  // Fetch real packages from database
  const allPackages = await getAllPackages();

  const filtered = allPackages.filter((p) => {
    if (ns && p.namespace !== ns) return false;
    if (tag && !p.tags.includes(tag)) return false;
    if (q) {
      return (
        p.name.toLowerCase().includes(q) ||
        p.namespace.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeTag = tag || ns;
  const activeLabel = ns
    ? `namespace: ${ns}`
    : tag
    ? CATEGORIES.find((c) => c.tag === tag)?.label ?? tag
    : null;

  // Get unique namespaces for sidebar
  const namespaces = [...new Set(allPackages.map((p) => p.namespace))];

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f0f0]">
            {activeLabel ? (
              <>
                Skills <span className="text-[#f97316]">/ {activeLabel}</span>
              </>
            ) : (
              "Browse Skills"
            )}
          </h1>
          <p className="text-sm text-[#505050] mt-1">
            {filtered.length} skill{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-56 shrink-0">
            <SearchForm defaultValue={q} />

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#505050] mb-3">Categories</p>
              <div className="space-y-0.5">
                <FilterLink href="/browse" active={!activeTag} label="All skills" count={allPackages.length} />
                {CATEGORIES.map((cat) => (
                  <FilterLink
                    key={cat.tag}
                    href={`/browse?tag=${cat.tag}`}
                    active={tag === cat.tag}
                    label={`${cat.icon} ${cat.label}`}
                    count={allPackages.filter((p) => p.tags.includes(cat.tag)).length}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#505050] mb-3">Namespace</p>
              <div className="space-y-0.5">
                <FilterLink href="/browse" active={!ns} label="All" count={allPackages.length} />
                {namespaces.map((namespace) => (
                  <FilterLink
                    key={namespace}
                    href={`/browse?namespace=${namespace}`}
                    active={ns === namespace}
                    label={namespace}
                    count={allPackages.filter((p) => p.namespace === namespace).length}
                    orange={namespace === "zeroclaw"}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] py-20 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-[#a0a0a0] font-medium">No skills found</p>
                <p className="text-sm text-[#505050] mt-1">Try a different search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((pkg) => (
                  <SkillCard key={`${pkg.namespace}/${pkg.name}`} pkg={pkg} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="get" action="/browse">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505050] pointer-events-none" />
        <input
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="Search skills…"
          className="w-full rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] pl-9 pr-4 py-2.5 text-sm text-[#f0f0f0] placeholder-[#505050] outline-none focus:border-[#f97316]/40 focus:ring-1 focus:ring-[#f97316]/20 transition-colors"
        />
      </div>
    </form>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
  orange,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  orange?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-[#f97316]/10 text-[#f97316]"
          : "text-[#707070] hover:bg-[#111111] hover:text-[#f0f0f0]"
      }`}
    >
      <span className={orange && !active ? "text-[#f97316]/70" : ""}>{label}</span>
      <span className={`text-xs ${active ? "text-[#f97316]/60" : "text-[#3a3a3a]"}`}>{count}</span>
    </a>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
