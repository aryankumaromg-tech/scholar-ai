import { NavBar } from "@/components/NavBar";
import { MatchPanel } from "@/components/MatchPanel";
import { SuggestionCard } from "@/components/PaperSuggestionCard";
import { DisplayMath } from "@/components/MathCard";
import { LEARNING_PATHS } from "@/lib/catalog";
import { loadCatalog } from "@/lib/suggestions";
import Link from "next/link";
import { Compass, Filter, Route, Search, Sigma, Sparkles, X } from "lucide-react";

export const dynamic = "force-dynamic";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const SORTS = [
  { id: "impact", label: "Most cited" },
  { id: "newest", label: "Newest" },
  { id: "quickest", label: "Quickest" },
  { id: "easiest", label: "Easiest maths" },
];

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function pick(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

function buildHref(base: Record<string, string>, patch: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...base, ...patch };
  for (const [k, v] of Object.entries(merged)) if (v && v !== "All") params.set(k, v);
  const qs = params.toString();
  return `/discover${qs ? `?${qs}` : ""}`;
}

export default async function DiscoverPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = pick(sp, "q").trim();
  const domain = pick(sp, "domain") || "All";
  const difficulty = pick(sp, "difficulty") || "All";
  const sort = pick(sp, "sort") || "impact";

  const catalog = await loadCatalog();
  const domains = [...new Set(catalog.map((c) => c.domain))].sort();
  const base = { q, domain, difficulty, sort };

  const needle = q.toLowerCase();
  let results = catalog.filter((item) => {
    const matchesQ =
      !needle ||
      [item.title, item.authors, item.abstract, item.mathFocus, item.domain, ...item.topics].join(" ").toLowerCase().includes(needle);
    const matchesDomain = domain === "All" || item.domain === domain;
    const matchesDifficulty = difficulty === "All" || item.difficulty === difficulty;
    return matchesQ && matchesDomain && matchesDifficulty;
  });

  const difficultyRank: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };
  results = [...results].sort((a, b) => {
    if (sort === "newest") return b.year - a.year;
    if (sort === "quickest") return a.readingMinutes - b.readingMinutes;
    if (sort === "easiest") return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
    return b.citations - a.citations;
  });

  const isDefaultView = !q && domain === "All" && difficulty === "All";
  const picks = catalog.filter((c) => c.featured).slice(0, 3);
  const catalogBySlug = new Map(catalog.map((c) => [c.slug, c]));
  const showcase = catalog.find((c) => c.slug === "shannon-1948") ?? catalog[0];

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 pt-4 sm:px-5">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[26px] border border-black/[0.07] bg-[#f7f4ec] px-6 py-10 sm:rounded-[32px] sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(233,160,82,0.35),transparent_70%)]" />
          <div className="relative grid gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14]">
                <Compass className="h-3 w-3" /> Discover
              </span>
              <h1 className="display mt-4 text-[clamp(2rem,4.6vw,3.3rem)] text-ink">
                Suggested papers, ranked by the <span className="text-ember">maths</span> you want to learn.
              </h1>
              <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
                A curated catalog of landmark papers, each with its key equation, the mathematical idea at its core, and the
                reason to read it next. Filter by field or difficulty — or match your own abstract.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Link href="#catalog" className="btn-ink">
                  Browse {catalog.length} papers
                </Link>
                <Link href="#matcher" className="btn-outline">
                  <Sparkles className="h-3.5 w-3.5 text-ember" /> Match an abstract
                </Link>
              </div>
            </div>

            {showcase && (
              <Link
                href={`/discover/${showcase.slug}`}
                className="group block rounded-2xl border border-black/[0.08] bg-white/60 backdrop-blur-md p-4 shadow-[0_18px_40px_-30px_rgba(27,24,21,0.6)] transition-colors hover:border-ember/30"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8a6a45]">
                    <Sigma className="h-3 w-3" /> Featured equation
                  </span>
                  <span className="rounded-full bg-white/55 px-2 py-0.5 text-[9.5px] font-semibold text-[#8a4c14]">
                    {showcase.difficulty}
                  </span>
                </div>
                <div className="eq-panel mt-3 overflow-x-auto px-3 py-4 text-[13px]">
                  <DisplayMath tex={showcase.keyEquation} />
                </div>
                <p className="mt-3 text-[12.5px] font-semibold text-ink group-hover:text-ember">{showcase.title}</p>
                <p className="mt-1 text-[10.5px] text-muted">{showcase.equationLabel}</p>
              </Link>
            )}
          </div>
        </section>

        {/* Matcher */}
        <section className="mt-4">
          <MatchPanel />
        </section>

        {/* Filters */}
        <section className="mt-8 px-1">
          <form action="/discover" method="get" className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 backdrop-blur-md p-1.5 pl-4 focus-within:border-ember/35">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search titles, authors, topics, or math concepts…"
              className="w-full bg-transparent py-2 text-[13px] text-ink placeholder:text-muted/70 outline-none"
            />
            {domain !== "All" && <input type="hidden" name="domain" value={domain} />}
            {difficulty !== "All" && <input type="hidden" name="difficulty" value={difficulty} />}
            <input type="hidden" name="sort" value={sort} />
            <button type="submit" className="btn-ink !py-2">
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                <Filter className="h-3 w-3" /> Field
              </span>
              <FilterChip href={buildHref(base, { domain: undefined })} active={domain === "All"} label="All" />
              {domains.map((d) => (
                <FilterChip key={d} href={buildHref(base, { domain: d })} active={domain === d} label={d} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">Maths level</span>
              <FilterChip href={buildHref(base, { difficulty: undefined })} active={difficulty === "All"} label="Any" />
              {DIFFICULTIES.map((d) => (
                <FilterChip key={d} href={buildHref(base, { difficulty: d })} active={difficulty === d} label={d} />
              ))}
              <span className="ml-auto flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-white/60 backdrop-blur-md p-1">
                {SORTS.map((s) => (
                  <Link
                    key={s.id}
                    href={buildHref(base, { sort: s.id })}
                    className={`rounded-full px-2.5 py-1.5 text-[10.5px] font-medium transition-colors ${
                      sort === s.id ? "bg-[#1b1815] text-[#f8f4ec]" : "text-muted hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </span>
            </div>
          </div>

          {(q || domain !== "All" || difficulty !== "All") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
              <span>
                <span className="font-semibold text-ink">{results.length}</span> result{results.length === 1 ? "" : "s"}
                {q && <> for &ldquo;{q}&rdquo;</>}
              </span>
              <Link href="/discover" className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] px-2 py-0.5 text-[10.5px] text-ink-soft hover:bg-white/50">
                <X className="h-3 w-3" /> Clear
              </Link>
            </div>
          )}
        </section>

        {/* Picks */}
        {isDefaultView && picks.length > 0 && (
          <section className="mt-10">
            <SectionHeading icon={<Sparkles className="h-3.5 w-3.5" />} title="Editor's picks" hint="Twenty minutes each, worth every one" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((paper) => (
                <SuggestionCard key={paper.slug} paper={paper} />
              ))}
            </div>
          </section>
        )}

        {/* Catalog */}
        <section id="catalog" className="mt-10 scroll-mt-24">
          <SectionHeading
            icon={<Compass className="h-3.5 w-3.5" />}
            title={isDefaultView ? "The full catalog" : "Matching papers"}
            hint={`${results.length} of ${catalog.length} papers`}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((paper) => (
              <SuggestionCard key={paper.slug} paper={paper} />
            ))}
          </div>
          {results.length === 0 && (
            <div className="panel-flat mt-4 px-6 py-12 text-center">
              <p className="text-[13px] text-ink-soft">Nothing matched that combination.</p>
              <Link href="/discover" className="btn-ink mt-4">
                Reset filters
              </Link>
            </div>
          )}
        </section>

        {/* Paths */}
        <section id="paths" className="mt-16 scroll-mt-24">
          <SectionHeading icon={<Route className="h-3.5 w-3.5" />} title="Learning paths" hint="Sequenced so the maths builds" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {LEARNING_PATHS.map((path) => {
              const steps = path.steps.map((slug) => catalogBySlug.get(slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
              return (
                <div key={path.slug} className="panel p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="display-sm text-[19px] text-ink">{path.title}</h3>
                    <span className="chip !py-0.5">{steps.length} papers</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{path.description}</p>
                  <ol className="mt-4 space-y-0.5">
                    {steps.map((paper, i) => (
                      <li key={paper.slug}>
                        <Link
                          href={`/discover/${paper.slug}`}
                          className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/32 backdrop-blur-md"
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/55 font-mono text-[9.5px] font-semibold text-[#8a4c14]">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-soft group-hover:text-ink">{paper.title}</span>
                          <span className="shrink-0 font-mono text-[10px] text-muted">{paper.year}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-2.5 py-1.5 text-[10.5px] font-medium transition-colors ${
        active
          ? "bg-[#1b1815] text-[#f8f4ec]"
          : "border border-black/[0.08] bg-white/60 backdrop-blur-md text-ink-soft hover:border-black/20 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

function SectionHeading({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.08] pb-3">
      <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
        <span className="text-ember">{icon}</span>
        {title}
      </h2>
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </div>
  );
}
