import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { DifficultyPill } from "@/components/PaperSuggestionCard";
import { RichText } from "@/components/RichText";
import { db } from "@/db";
import { analyses, papers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { loadCatalog, suggestForPaper } from "@/lib/suggestions";
import { buildComparison } from "@/lib/research";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  Compass,
  GitCompareArrows,
  Layers,
  Scale,
  Sigma,
  Sparkles,
  Target,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare papers",
  description: "Compare two analyzed papers side by side: methods, claims, limitations, math density, and what to read first.",
};

type SearchParams = Promise<{ left?: string; right?: string }>;

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const rows = await db
    .select({ paper: papers, analysis: analyses })
    .from(papers)
    .leftJoin(analyses, eq(analyses.paperId, papers.id))
    .orderBy(desc(analyses.createdAt), desc(papers.createdAt));

  const unique = new Map<number, (typeof rows)[number]>();
  for (const row of rows) if (!unique.has(row.paper.id)) unique.set(row.paper.id, row);
  const library = [...unique.values()];

  const requestedLeft = Number.parseInt(sp.left ?? "", 10);
  const requestedRight = Number.parseInt(sp.right ?? "", 10);
  const leftId = Number.isFinite(requestedLeft) ? requestedLeft : library[0]?.paper.id;
  const rightId = Number.isFinite(requestedRight)
    ? requestedRight
    : library.find((entry) => entry.paper.id !== leftId)?.paper.id;
  const left = library.find((entry) => entry.paper.id === leftId);
  const right = library.find((entry) => entry.paper.id === rightId);

  const canCompare = Boolean(left?.analysis && right?.analysis && left.paper.id !== right.paper.id);

  const synthesis = canCompare && left && right
    ? buildComparison(
        {
          title: left.paper.title,
          year: left.paper.year,
          authors: left.paper.authors,
          domain: left.analysis?.domain,
          difficulty: left.analysis?.difficulty,
          mathScore: left.analysis?.mathScore,
          readingMinutes: left.analysis?.readingMinutes,
          topics: left.analysis?.topics,
          abstract: left.paper.abstract,
          keyFindings: left.analysis?.keyFindings,
          limitations: left.analysis?.limitations,
          methodology: left.analysis?.methodology,
        },
        {
          title: right.paper.title,
          year: right.paper.year,
          authors: right.paper.authors,
          domain: right.analysis?.domain,
          difficulty: right.analysis?.difficulty,
          mathScore: right.analysis?.mathScore,
          readingMinutes: right.analysis?.readingMinutes,
          topics: right.analysis?.topics,
          abstract: right.paper.abstract,
          keyFindings: right.analysis?.keyFindings,
          limitations: right.analysis?.limitations,
          methodology: right.analysis?.methodology,
        },
      )
    : null;

  // Related work for each side, excluding the other paper
  const catalog = await loadCatalog();
  const relatedFor = async (entry: NonNullable<typeof left>) => {
    const topics = (entry.analysis?.topics ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    const picks = await suggestForPaper(topics, entry.analysis?.domain ?? null, entry.analysis?.difficulty ?? null, 5);
    return picks.filter((p) => catalog.some((c) => c.slug === p.item.slug)).slice(0, 3);
  };
  const leftRelated = canCompare && left ? await relatedFor(left) : [];
  const rightRelated = canCompare && right ? await relatedFor(right) : [];

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 pt-5 sm:px-5">
        <Link
          href={left ? `/papers/${left.paper.id}?tab=research` : "/papers"}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to research tools
        </Link>

        <section className="panel-warm-soft mt-4 overflow-hidden rounded-[28px] px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14] ring-1 ring-inset ring-white/60">
                <Scale className="h-3 w-3" /> Literature comparison
              </span>
              <h1 className="display mt-4 text-[clamp(1.9rem,4.5vw,3rem)] text-[#3b2415]">
                Two papers, one synthesis.
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-[#6b4426]">
                Compare problem framing, method, evidence style and limitations — then see overlap, a verdict, and which one to
                read first.
              </p>
            </div>
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/50 text-[#8a4c14] ring-1 ring-inset ring-white/60">
              <GitCompareArrows className="h-7 w-7" />
            </span>
          </div>
        </section>

        {/* Selector */}
        <form action="/compare" method="get" className="panel mt-4 grid items-end gap-3 p-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:p-5">
          <label className="block">
            <span className="eyebrow">Paper A</span>
            <select
              name="left"
              defaultValue={leftId}
              className="mt-2 w-full rounded-xl border border-black/[0.09] bg-white/45 backdrop-blur-md px-3 py-2.5 text-[12px] text-ink outline-none focus:border-ember/40"
            >
              {library.map((entry) => (
                <option key={entry.paper.id} value={entry.paper.id}>
                  {entry.paper.title}
                </option>
              ))}
            </select>
          </label>
          <ArrowRight className="mb-3 hidden h-4 w-4 text-muted sm:block" />
          <label className="block">
            <span className="eyebrow">Paper B</span>
            <select
              name="right"
              defaultValue={rightId}
              className="mt-2 w-full rounded-xl border border-black/[0.09] bg-white/45 backdrop-blur-md px-3 py-2.5 text-[12px] text-ink outline-none focus:border-ember/40"
            >
              {library.map((entry) => (
                <option key={entry.paper.id} value={entry.paper.id}>
                  {entry.paper.title}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-ink mb-0.5">
            Compare
          </button>
        </form>

        {canCompare && left && right && synthesis ? (
          <div className="mt-4 space-y-3">
            {/* Cards */}
            <div className="grid gap-3 md:grid-cols-2">
              {[left, right].map((entry, index) => (
                <Link
                  key={entry.paper.id}
                  href={`/papers/${entry.paper.id}`}
                  className={`hover-lift rounded-[24px] p-5 ${index === 0 ? "panel" : "panel-warm-soft"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#3b2415] text-[10px] font-semibold text-[#fdf3e3]">
                      {index === 0 ? "A" : "B"}
                    </span>
                    <DifficultyPill value={entry.analysis?.difficulty ?? "Intermediate"} />
                    <span className="chip !py-0.5">{entry.analysis?.domain ?? "Unclassified"}</span>
                  </div>
                  <h2 className="display-sm mt-3 text-[19px] text-ink">{entry.paper.title}</h2>
                  <p className="mt-1.5 text-[11.5px] text-muted">
                    {entry.paper.authors ?? "Unknown author"} · {entry.paper.year ?? "n.d."}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Metric icon={<Sigma className="h-3.5 w-3.5" />} value={`${entry.analysis?.mathScore ?? "—"}/100`} label="maths" />
                    <Metric icon={<Clock className="h-3.5 w-3.5" />} value={`${entry.analysis?.readingMinutes ?? "—"}m`} label="read" />
                    <Metric
                      icon={<Layers className="h-3.5 w-3.5" />}
                      value={(entry.analysis?.topics ?? "").split(",").filter(Boolean).length}
                      label="topics"
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Synthesis */}
            <section className="panel-warm overflow-hidden rounded-[26px] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/75">
                    <Sparkles className="h-3.5 w-3.5" /> Synthesis
                  </div>
                  <h2 className="display-sm mt-2 text-[19px] text-[#fdf6ea]">How these two relate</h2>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[#fbe7cf]/90">{synthesis.verdict}</p>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
                  <div className="font-mono text-[22px] font-medium text-[#fdf6ea]">{synthesis.overlapScore}%</div>
                  <div className="text-[9px] uppercase tracking-[0.12em] text-white/70">topic overlap</div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/20 bg-[#3d1c06]/20 p-3.5">
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-[#ffdcb2]">Shared topics</div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#fdf6ea]/90">
                    {synthesis.sharedTopics.length ? synthesis.sharedTopics.join(" · ") : "No direct topic overlap — read as complementary lines."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-[#3d1c06]/20 p-3.5">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.13em] text-[#ffdcb2]">
                    <Compass className="h-3 w-3" /> Start with {synthesis.readingOrder.first === "left" ? "A" : "B"}
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#fdf6ea]/90">{synthesis.readingOrder.reason}</p>
                </div>
              </div>

              {synthesis.combinedGaps.length > 0 && (
                <div className="mt-2 rounded-2xl border border-white/20 bg-[#3d1c06]/20 p-3.5">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.13em] text-[#ffdcb2]">
                    <Target className="h-3 w-3" /> Gaps neither paper closes
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {synthesis.combinedGaps.map((gap) => (
                      <li key={gap} className="flex gap-2 text-[11.5px] leading-relaxed text-[#fdf6ea]/90">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#ffdcb2]" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Contrast table */}
            <section className="panel overflow-hidden p-0">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-black/[0.07] bg-white/32 backdrop-blur-md">
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Dimension</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-ink">Paper A</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-ink">Paper B</th>
                  </tr>
                </thead>
                <tbody>
                  {synthesis.contrasts.map((row, i) => (
                    <tr key={row.dimension} className={i % 2 === 1 ? "bg-white/45 backdrop-blur-md/60" : ""}>
                      <td className="border-t border-black/[0.05] px-5 py-2.5 text-[11.5px] font-medium text-ink-soft">{row.dimension}</td>
                      <td className="border-t border-black/[0.05] px-4 py-2.5 text-[11.5px] text-ink">{row.left}</td>
                      <td className="border-t border-black/[0.05] px-4 py-2.5 text-[11.5px] text-ink">{row.right}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Narrative rows */}
            <CompareRow title="In one sentence" left={left.analysis?.tldr ?? ""} right={right.analysis?.tldr ?? ""} />
            <CompareRow title="Methodology" left={left.analysis?.methodology ?? ""} right={right.analysis?.methodology ?? ""} />
            <CompareRow title="Main contribution" left={left.analysis?.contributions ?? ""} right={right.analysis?.contributions ?? ""} />
            <CompareRow title="Limitations" left={left.analysis?.limitations ?? ""} right={right.analysis?.limitations ?? ""} />
            <CompareRow title="Recommended follow-up" left={left.analysis?.recommendations ?? ""} right={right.analysis?.recommendations ?? ""} />

            {/* Related work for both */}
            <section className="grid gap-3 md:grid-cols-2">
              {[
                { label: "Related to A", entry: left, picks: leftRelated },
                { label: "Related to B", entry: right, picks: rightRelated },
              ].map((group) => (
                <div key={group.label} className="panel p-5">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{group.label}</h2>
                  <div className="mt-3 space-y-2">
                    {group.picks.length === 0 && (
                      <p className="text-[11.5px] text-muted">No close catalog matches for this paper.</p>
                    )}
                    {group.picks.map(({ item, reason }) => (
                      <Link
                        key={item.slug}
                        href={`/discover/${item.slug}`}
                        className="group flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white/45 backdrop-blur-md px-3 py-2.5 transition-colors hover:border-ember/30"
                      >
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/55 font-mono text-[9px] font-semibold text-[#8a4c14] ring-1 ring-inset ring-black/[0.05]">
                          {item.year.toString().slice(2)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-semibold text-ink group-hover:text-ember">{item.title}</span>
                          <span className="mt-0.5 block truncate text-[10.5px] text-muted">{reason}</span>
                        </span>
                        <ArrowUpRight className="mt-1 h-3 w-3 shrink-0 text-muted" />
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/discover?q=${encodeURIComponent((group.entry.analysis?.topics ?? "").split(",")[0]?.trim() || group.entry.paper.title)}`}
                    className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold text-ember hover:text-ember-deep"
                  >
                    <BookOpen className="h-3 w-3" /> More in the catalog
                  </Link>
                </div>
              ))}
            </section>
          </div>
        ) : (
          <div className="panel-flat mt-4 px-6 py-14 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-ember/60" />
            <h2 className="display-sm mt-3 text-[18px] text-ink">
              {library.length < 2 ? "Analyze two papers to compare them" : "Pick two different papers"}
            </h2>
            <p className="mt-1.5 text-[12px] text-muted">
              Comparison needs two analyzed papers — upload one or run an analysis from the catalog.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href="/papers/new" className="btn-warm">Analyze a paper</Link>
              <Link href="/discover" className="btn-outline">Browse catalog</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white/45 px-2.5 py-2.5 text-center">
      <span className="mx-auto block w-fit text-ember">{icon}</span>
      <div className="mt-1 text-[12px] font-semibold text-ink">{value}</div>
      <div className="text-[9px] uppercase tracking-[0.12em] text-muted">{label}</div>
    </div>
  );
}

function CompareRow({ title, left, right }: { title: string; left: string; right: string }) {
  return (
    <section className="panel overflow-hidden">
      <header className="border-b border-black/[0.07] bg-white/32 backdrop-blur-md px-5 py-2.5">
        <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
      </header>
      <div className="grid md:grid-cols-2">
        <div className="p-5 md:border-r md:border-black/[0.07]">
          <span className="mb-2 block text-[10px] font-semibold text-ember">PAPER A</span>
          <RichText text={left} className="text-[12.5px] leading-relaxed text-ink-soft" />
        </div>
        <div className="border-t border-black/[0.07] p-5 md:border-t-0">
          <span className="mb-2 block text-[10px] font-semibold text-ember">PAPER B</span>
          <RichText text={right} className="text-[12.5px] leading-relaxed text-ink-soft" />
        </div>
      </div>
    </section>
  );
}
