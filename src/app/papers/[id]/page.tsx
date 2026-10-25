import { NavBar } from "@/components/NavBar";
import { Tabs, type TabDef } from "@/components/Tabs";
import { DisplayMath, InlineMath, MathCard } from "@/components/MathCard";
import { RichText } from "@/components/RichText";
import { ReanalyzeButton } from "@/components/ReanalyzeButton";
import { ResearchWorkspace } from "@/components/ResearchWorkspace";
import { ResearchBriefView } from "@/components/ResearchBrief";
import { generateResearchBrief } from "@/lib/research";
import { CompactSuggestion, DifficultyPill, SuggestionCard } from "@/components/PaperSuggestionCard";
import { db } from "@/db";
import { analyses, papers, researchNotes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { buildMathBreakdown } from "@/lib/math-deep-dive";
import { suggestForPaper } from "@/lib/suggestions";
import type { MathBreakdown } from "@/db/schema";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Beaker,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  FlaskConical,
  FunctionSquare,
  Gauge,
  Layers,
  Lightbulb,
  ListOrdered,
  NotebookPen,
  Plus,
  Sigma,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

function Panel({
  title,
  icon,
  children,
  subtitle,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/55 text-[#8a4c14] ring-1 ring-inset ring-[#8a4c14]/10">
          {icon}
        </span>
        <div>
          <h2 className="display-sm text-[17px] text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ScoreMeter({ value, label, hint }: { value: number; label: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c5a3c]">{label}</span>
        <span className="font-mono text-[13px] font-semibold text-[#3b2415]">
          {value}
          <span className="text-[9.5px] font-normal text-[#8a6a45]">/100</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#3b2415]/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#e2a35f] via-[#c9671f] to-[#a34a14]"
          style={{ width: `${Math.max(6, Math.min(100, value))}%` }}
        />
      </div>
      {hint && <p className="mt-1.5 text-[10px] leading-relaxed text-[#7c5a3c]">{hint}</p>}
    </div>
  );
}

function FallbackMath(): MathBreakdown {
  return buildMathBreakdown({ title: "paper", content: "" }).kernel;
}

export default async function PaperDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const requestedTab = typeof sp.tab === "string" ? sp.tab : "";
  const initialTab = ["overview", "mathematics", "research", "insights", "tools", "related"].includes(requestedTab) ? requestedTab : undefined;

  const paperId = Number.parseInt(id, 10);
  if (!Number.isFinite(paperId)) notFound();

  const [paper] = await db.select().from(papers).where(eq(papers.id, paperId));
  if (!paper) notFound();

  const history = await db.select().from(analyses).where(eq(analyses.paperId, paperId)).orderBy(desc(analyses.createdAt));
  const latest = history[0];
  const savedNotes = await db
    .select()
    .from(researchNotes)
    .where(eq(researchNotes.paperId, paperId))
    .orderBy(desc(researchNotes.updatedAt));
  const math: MathBreakdown = latest?.mathJson ?? FallbackMath();
  const topics = (latest?.topics ?? "Machine Learning").split(",").map((t) => t.trim()).filter(Boolean);
  const domain = latest?.domain ?? "Machine Learning";
  const difficulty = latest?.difficulty ?? "Intermediate";
  const readingMinutes = latest?.readingMinutes ?? Math.max(6, Math.round(paper.content.split(/\s+/).length / 180));
  const mathScore =
    latest?.mathScore ?? buildMathBreakdown({ title: paper.title, abstract: paper.abstract, content: paper.content }).mathScore;

  const researchBrief = generateResearchBrief(
    { title: paper.title, abstract: paper.abstract, content: paper.content, authors: paper.authors, year: paper.year },
    {
      keyFindings: latest?.keyFindings,
      methodology: latest?.methodology,
      limitations: latest?.limitations,
      recommendations: latest?.recommendations,
      contributions: latest?.contributions,
      topics: latest?.topics,
      domain: latest?.domain,
      difficulty: latest?.difficulty,
      mathScore: latest?.mathScore,
    },
  );

  const related = (await suggestForPaper(topics, domain, difficulty, 6))
    .filter((r) => r.item.title.toLowerCase() !== paper.title.toLowerCase())
    .slice(0, 6);

  const libraryRows = await db
    .select({ analysis: analyses, paper: papers })
    .from(analyses)
    .innerJoin(papers, eq(analyses.paperId, papers.id))
    .orderBy(desc(analyses.createdAt))
    .limit(40);
  const seen = new Set<number>();
  const libraryMatches = libraryRows
    .filter(({ paper: p, analysis: a }) => {
      if (p.id === paper.id || seen.has(p.id)) return false;
      seen.add(p.id);
      const otherTopics = (a.topics ?? "").split(",").map((t) => t.trim().toLowerCase());
      return otherTopics.some((t) => topics.map((x) => x.toLowerCase()).includes(t));
    })
    .slice(0, 3);

  const uniqueSymbols = math.equations
    .flatMap((e) => e.symbols)
    .filter((s, i, arr) => arr.findIndex((x) => x.symbol === s.symbol) === i);

  const tabs: TabDef[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <BookOpen className="h-3.5 w-3.5" />,
      content: (
        <div className="space-y-4">
          <div className="panel-warm-soft rounded-[24px] p-5 sm:p-6">
            <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#8a4c14]">
              <Zap className="h-3 w-3" /> TL;DR
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-[#3b2415]">
              {latest?.tldr ?? "Analysis pending — re-run to generate the summary."}
            </p>
          </div>

          <Panel title="What this paper does" icon={<Brain className="h-4 w-4" />} subtitle="Structured summary">
            <RichText text={latest?.summary ?? "No summary generated yet."} className="text-[13.5px] text-ink-soft" />
          </Panel>

          <Panel title="Key findings" icon={<Lightbulb className="h-4 w-4" />} subtitle="Claims worth remembering">
            <div className="space-y-2.5">
              {((latest?.keyFindings ?? "") || "No findings generated yet.")
                .split("\n\n")
                .filter(Boolean)
                .map((finding, i) => (
                  <div key={i} className="flex gap-3 rounded-2xl border border-black/[0.06] bg-white/45 backdrop-blur-md p-4">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/55 font-mono text-[10px] font-semibold text-[#8a4c14]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[13px] leading-relaxed text-ink-soft">{finding}</p>
                  </div>
                ))}
            </div>
          </Panel>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Field", value: domain, icon: <Layers className="h-4 w-4" /> },
              { label: "Maths density", value: `${mathScore}/100`, icon: <Sigma className="h-4 w-4" /> },
              { label: "Reading time", value: `${readingMinutes} min`, icon: <Clock className="h-4 w-4" /> },
            ].map((c) => (
              <div key={c.label} className="panel-flat p-4">
                <span className="text-ember">{c.icon}</span>
                <div className="mt-2 text-[15px] font-semibold text-ink">{c.value}</div>
                <div className="text-[9.5px] uppercase tracking-[0.12em] text-muted">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "mathematics",
      label: "Mathematics",
      hint: `${math.equations.length} eq`,
      icon: <Sigma className="h-3.5 w-3.5" />,
      content: (
        <div className="space-y-4">
          <div className="panel-warm-soft overflow-hidden rounded-[24px] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-xl">
                <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#8a4c14]">
                  <FunctionSquare className="h-3 w-3" /> Deep dive · the maths
                </div>
                <h2 className="display-sm mt-2 text-[21px] text-[#3b2415] sm:text-[24px]">{math.headline}</h2>
              </div>
              <div className="w-full max-w-[180px] rounded-2xl bg-white/55 p-3.5 ring-1 ring-inset ring-white/60">
                <ScoreMeter value={mathScore} label="Maths density" hint="From notation, results and derivation language." />
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-[13.5px] leading-relaxed text-[#4a3323]">{math.intuition}</p>
          </div>

          <div>
            <div className="mb-2.5 flex items-center gap-2 border-b border-black/[0.08] pb-2">
              <Sigma className="h-4 w-4 text-ember" />
              <h3 className="text-[12.5px] font-semibold text-ink">Equations, decoded</h3>
              <span className="ml-auto text-[10.5px] text-muted">{math.equations.length} core results</span>
            </div>
            <div className="grid gap-3">
              {math.equations.map((equation, i) => (
                <MathCard key={`${equation.label}-${i}`} equation={equation} index={i} dark />
              ))}
            </div>
          </div>

          <Panel title="Derivation walkthrough" icon={<ListOrdered className="h-4 w-4" />} subtitle="Follow the algebra, not just the result">
            <ol className="relative space-y-4 border-l border-black/10 pl-6">
              {math.steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full border border-ember/25 bg-white/60 backdrop-blur-md font-mono text-[9.5px] font-semibold text-ember">
                    {i + 1}
                  </span>
                  <h4 className="text-[13px] font-semibold text-ink">{step.title}</h4>
                  {step.latex && (
                    <div className="eq-panel mt-2 overflow-x-auto px-3 py-3 text-[13px]">
                      <DisplayMath tex={step.latex} />
                    </div>
                  )}
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{step.explanation}</p>
                </li>
              ))}
            </ol>
          </Panel>

          {uniqueSymbols.length > 0 && (
            <Panel title="Notation glossary" icon={<FunctionSquare className="h-4 w-4" />} subtitle="Every symbol used above">
              <dl className="grid gap-2 sm:grid-cols-2">
                {uniqueSymbols.map((sym) => (
                  <div key={sym.symbol} className="flex items-start gap-2.5 rounded-xl border border-black/[0.06] bg-white/45 backdrop-blur-md px-3 py-2.5">
                    <span className="min-w-[52px] shrink-0 text-[12.5px] text-[#5c3a1c]">
                      <InlineMath tex={sym.symbol} />
                    </span>
                    <span className="text-[11.5px] leading-relaxed text-muted">{sym.meaning}</span>
                  </div>
                ))}
              </dl>
            </Panel>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <Panel title="Cost & complexity" icon={<Gauge className="h-4 w-4" />} subtitle="Where the compute goes">
              <p className="text-[12.5px] leading-relaxed text-ink-soft">{math.complexity}</p>
            </Panel>
            <Panel title="Where it can break" icon={<AlertTriangle className="h-4 w-4" />} subtitle="Pitfalls before you implement">
              <ul className="space-y-2.5">
                {math.pitfalls.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember/60" />
                    {p}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      ),
    },
    {
      id: "research",
      label: "Deep research",
      hint: `${researchBrief.questions.length}`,
      icon: <Beaker className="h-3.5 w-3.5" />,
      content: <ResearchBriefView brief={researchBrief} title={paper.title} />,
    },
    {
      id: "insights",
      label: "Insights",
      icon: <FlaskConical className="h-3.5 w-3.5" />,
      content: (
        <div className="space-y-4">
          <Panel title="Methodology" icon={<FlaskConical className="h-4 w-4" />} subtitle="How the evidence was produced">
            <RichText text={latest?.methodology ?? "No methodology notes generated."} className="text-[13px] text-ink-soft" />
          </Panel>
          <Panel title="Contributions" icon={<CheckCircle2 className="h-4 w-4" />} subtitle="What is genuinely new">
            <RichText text={latest?.contributions ?? ""} className="text-[13px] text-ink-soft" />
          </Panel>
          <Panel title="Limitations" icon={<AlertTriangle className="h-4 w-4" />} subtitle="Read these before citing">
            <RichText text={latest?.limitations ?? ""} className="text-[13px] text-ink-soft" />
          </Panel>
          <Panel title="Recommendations" icon={<Compass className="h-4 w-4" />} subtitle="What to do next">
            <RichText text={latest?.recommendations ?? ""} className="text-[13px] text-ink-soft" />
          </Panel>
        </div>
      ),
    },
    {
      id: "tools",
      label: "Research tools",
      hint: `${savedNotes.length}`,
      icon: <NotebookPen className="h-3.5 w-3.5" />,
      content: latest ? (
        <ResearchWorkspace
          paper={{
            id: paper.id,
            title: paper.title,
            authors: paper.authors,
            year: paper.year,
            source: paper.source,
            content: paper.content,
            abstract: paper.abstract,
          }}
          analysis={{
            tldr: latest.tldr,
            summary: latest.summary,
            keyFindings: latest.keyFindings,
            methodology: latest.methodology,
            contributions: latest.contributions,
            limitations: latest.limitations,
            recommendations: latest.recommendations,
            domain: latest.domain,
            topics: latest.topics,
            mathScore: latest.mathScore,
          }}
          initialNotes={savedNotes.map((note) => ({
            ...note,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
          }))}
        />
      ) : (
        <div className="panel p-8 text-center text-[13px] text-muted">Run an analysis before opening the research workspace.</div>
      ),
    },
    {
      id: "related",
      label: "Read next",
      hint: `${related.length}`,
      icon: <Compass className="h-3.5 w-3.5" />,
      content: (
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.08] pb-2">
              <h3 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Sparkles className="h-3.5 w-3.5 text-ember" /> Suggested from the catalog
              </h3>
              <span className="text-[10.5px] text-muted">Topic overlap · field · maths level</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map(({ item, reason }) => (
                <SuggestionCard key={item.slug} paper={item} reason={reason} />
              ))}
            </div>
          </div>

          {libraryMatches.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between border-b border-black/[0.08] pb-2">
                <h3 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                  <BookOpen className="h-3.5 w-3.5 text-ember" /> From your library
                </h3>
                <Link href="/papers" className="text-[10.5px] font-medium text-ember hover:text-ember-deep">
                  View all
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {libraryMatches.map(({ paper: p, analysis: a }) => (
                  <Link key={p.id} href={`/papers/${p.id}`} className="panel-flat group p-4 transition-colors hover:bg-white/60 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <DifficultyPill value={a.difficulty ?? "Intermediate"} />
                      <span className="font-mono text-[9.5px] text-muted">{a.mathScore ?? 50}/100</span>
                    </div>
                    <h4 className="mt-2 line-clamp-2 text-[12.5px] font-semibold text-ink group-hover:text-ember">{p.title}</h4>
                    <p className="mt-1 truncate text-[10.5px] text-muted">{a.domain ?? "Machine Learning"}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="panel-warm-soft rounded-3xl p-5">
            <h3 className="text-[13px] font-semibold text-[#3b2415]">Want a different angle?</h3>
            <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-[#6b4426]">
              Browse the catalog, filter by maths level, or paste an abstract into the matcher for personalised next reads.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/discover" className="inline-flex items-center gap-1.5 rounded-full bg-[#3b2415] px-3.5 py-2 text-[11px] font-semibold text-[#fdf3e3]">
                Open discover <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link href="/papers/new" className="inline-flex items-center gap-1.5 rounded-full border border-[#3b2415]/20 px-3.5 py-2 text-[11px] font-semibold text-[#3b2415] hover:bg-white/50">
                <Plus className="h-3 w-3" /> Analyze another
              </Link>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 pt-5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/papers" className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to library
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/papers/${paper.id}?tab=mathematics`} className="inline-flex items-center gap-1.5 rounded-full border border-ember/25 bg-[#f7e7d3]/75 px-3.5 py-2 text-[11.5px] font-semibold text-[#8a4c14] transition-colors hover:bg-[#f3ddc3]">
              <Sigma className="h-3.5 w-3.5" /> Deep dive maths
            </Link>
            <ReanalyzeButton paperId={paper.id} />
          </div>
        </div>

        <section className="panel-warm-soft mt-4 overflow-hidden rounded-[28px] px-6 py-7 sm:px-9 sm:py-9">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyPill value={difficulty} className="!bg-white/60" />
            <span className="rounded-full bg-white/50 px-2.5 py-1 text-[10.5px] font-medium text-[#6b4426] ring-1 ring-inset ring-white/60">{domain}</span>
            <span className="rounded-full bg-white/50 px-2.5 py-1 text-[10.5px] font-medium text-[#6b4426] ring-1 ring-inset ring-white/60">{readingMinutes} min read</span>
            <span className="rounded-full bg-[#3b2415] px-2.5 py-1 text-[10.5px] font-semibold text-[#fdf3e3]">maths {mathScore}/100</span>
            {paper.source && <span className="rounded-full bg-white/50 px-2.5 py-1 text-[10.5px] text-[#6b4426]">{paper.source}</span>}
            {paper.fileName && (
              <span className="inline-flex max-w-[240px] items-center gap-1.5 truncate rounded-full bg-white/50 px-2.5 py-1 text-[10.5px] text-[#6b4426]" title={paper.fileName}>
                <FileText className="h-3 w-3 shrink-0" /> <span className="truncate">{paper.fileName}</span>
              </span>
            )}
          </div>

          <h1 className="display mt-4 max-w-4xl text-[clamp(1.7rem,3.6vw,2.6rem)] text-[#3b2415]">{paper.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-[#7c5a3c]">
            {paper.authors && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {paper.authors}
              </span>
            )}
            {paper.year && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {paper.year}
              </span>
            )}
            <span className="font-mono text-[10.5px] text-[#8a6a45]">#{paper.id}</span>
          </div>

          {paper.abstract && (
            <p className="mt-4 max-w-3xl rounded-2xl border border-white/60 bg-white/45 p-4 text-[12.5px] leading-relaxed text-[#4a3323]">
              <span className="mr-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14]">Abstract</span>
              {paper.abstract}
            </p>
          )}
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_288px]">
          <div className="min-w-0">
            <Tabs tabs={tabs} initial={initialTab} />
          </div>

          <aside className="space-y-3 lg:sticky lg:top-[92px] lg:self-start">
            <div className="panel p-5">
              <h3 className="eyebrow">Analysis card</h3>
              <div className="mt-3 space-y-3">
                <ScoreMeter value={mathScore} label="Maths density" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-black/[0.06] bg-white/45 backdrop-blur-md p-3">
                    <div className="font-mono text-[15px] font-semibold text-ink">{paper.content.split(/\s+/).filter(Boolean).length}</div>
                    <div className="text-[9.5px] uppercase tracking-wider text-muted">words</div>
                  </div>
                  <div className="rounded-xl border border-black/[0.06] bg-white/45 backdrop-blur-md p-3">
                    <div className="font-mono text-[15px] font-semibold text-ink">{history.length}</div>
                    <div className="text-[9.5px] uppercase tracking-wider text-muted">passes</div>
                  </div>
                </div>
                <dl className="space-y-2 border-t border-black/[0.07] pt-3 text-[11px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Engine</dt>
                    <dd className="truncate font-mono text-ink-soft">{latest?.aiModel ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Generated</dt>
                    <dd className="text-ink-soft">{latest ? new Date(latest.createdAt).toLocaleDateString() : "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Difficulty</dt>
                    <dd className="text-ink-soft">{difficulty}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="panel p-5">
              <div className="flex items-center justify-between">
                <h3 className="eyebrow">Read next</h3>
                <Link href="/discover" className="text-[10px] font-semibold text-ember hover:text-ember-deep">
                  Discover
                </Link>
              </div>
              <div className="mt-3 space-y-1">
                {related.slice(0, 3).map(({ item, reason }) => (
                  <CompactSuggestion key={item.slug} paper={item} reason={reason} />
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <h3 className="eyebrow">Topics</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <Link
                    key={t}
                    href={`/discover?q=${encodeURIComponent(t)}`}
                    className="rounded-full border border-black/[0.08] bg-white/45 backdrop-blur-md px-2.5 py-1 text-[10px] text-ink-soft transition-colors hover:border-ember/30 hover:text-ember"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
