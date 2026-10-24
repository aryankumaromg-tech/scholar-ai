import { NavBar } from "@/components/NavBar";
import { DifficultyPill } from "@/components/PaperSuggestionCard";
import { db } from "@/db";
import { analyses, papers } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Clock, FileText, Plus, Sigma, Sparkles, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PapersPage() {
  const [allPapers, allAnalyses] = await Promise.all([
    db.select().from(papers).orderBy(desc(papers.createdAt)),
    db.select().from(analyses).orderBy(desc(analyses.createdAt)),
  ]);

  const latestByPaper = new Map<number, (typeof allAnalyses)[number]>();
  for (const a of allAnalyses) if (!latestByPaper.has(a.paperId)) latestByPaper.set(a.paperId, a);

  const entries = allPapers.map((paper) => ({ paper, analysis: latestByPaper.get(paper.id) }));
  const avgMath = allAnalyses.length
    ? Math.round(allAnalyses.reduce((sum, a) => sum + (a.mathScore ?? 50), 0) / allAnalyses.length)
    : 0;

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 pt-4 sm:px-5">
        <section className="panel-warm-soft overflow-hidden rounded-[28px] px-6 py-9 sm:px-10 sm:py-11">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14] ring-1 ring-inset ring-white/60">
                <BookOpen className="h-3 w-3" /> Library
              </span>
              <h1 className="display mt-4 text-[clamp(1.9rem,4.4vw,3rem)] text-[#3b2415]">Your analyzed papers</h1>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#6b4426]">
                Every analysis keeps its brief, its math deep dive and the three papers suggested next. Re-run any time to
                refresh the maths.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href="/papers/new" className="btn-warm">
                  <Plus className="h-3.5 w-3.5" /> Analyze a paper
                </Link>
                <Link href="/discover" className="inline-flex items-center gap-2 rounded-full border border-[#3b2415]/20 px-4 py-2.5 text-[12px] font-semibold text-[#3b2415] hover:bg-white/50">
                  <Sparkles className="h-3.5 w-3.5" /> Browse suggestions
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: entries.length, label: "papers" },
                { value: allAnalyses.length, label: "passes" },
                { value: avgMath, label: "avg maths" },
              ].map((s) => (
                <div key={s.label} className="min-w-[76px] rounded-2xl bg-white/55 px-3 py-3 text-center ring-1 ring-inset ring-white/60">
                  <div className="font-mono text-[19px] font-medium text-[#3b2415]">{s.value}</div>
                  <div className="text-[9.5px] uppercase tracking-[0.12em] text-[#8a6a45]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {entries.length === 0 ? (
          <div className="panel-flat mt-4 px-6 py-16 text-center">
            <FileText className="mx-auto h-9 w-9 text-muted/60" />
            <h2 className="display-sm mt-3 text-[20px] text-ink">Your library is empty</h2>
            <p className="mt-1.5 text-[12.5px] text-ink-soft">Analyze a paper, or pick one from the curated catalog.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/papers/new" className="btn-warm">
                <Plus className="h-3.5 w-3.5" /> Analyze a paper
              </Link>
              <Link href="/discover" className="btn-outline">
                <Sparkles className="h-3.5 w-3.5 text-ember" /> Browse catalog
              </Link>
            </div>
          </div>
        ) : (
          <section className="mt-4 grid gap-3 md:grid-cols-2">
            {entries.map(({ paper, analysis }) => (
              <Link key={paper.id} href={`/papers/${paper.id}`} className="panel hover-lift group flex flex-col p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyPill value={analysis?.difficulty ?? "Intermediate"} />
                  <span className="chip !py-0.5">{analysis?.domain ?? "Unclassified"}</span>
                  {paper.fileType && <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[9.5px] font-semibold uppercase text-muted">{paper.fileType}</span>}
                  <span className="ml-auto flex items-center gap-1 font-mono text-[10.5px] text-muted">
                    <Sigma className="h-3 w-3 text-ember/70" /> {analysis?.mathScore ?? "—"}
                  </span>
                </div>
                <h2 className="display-sm mt-3 text-[18px] text-ink group-hover:text-ember">{paper.title}</h2>
                <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                  {analysis?.tldr ?? paper.abstract ?? "No abstract provided."}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/[0.07] pt-3.5 text-[10.5px] text-muted">
                  <span className="flex items-center gap-3">
                    {paper.authors && (
                      <span className="flex max-w-[150px] items-center gap-1 truncate">
                        <User className="h-3 w-3" /> <span className="truncate">{paper.authors}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {analysis?.readingMinutes ?? "—"}m
                    </span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-ember">
                    Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </section>
        )}

        <section className="panel mt-4 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div>
            <h2 className="display-sm text-[17px] text-ink">Looking for something to analyze next?</h2>
            <p className="mt-1 text-[12px] text-ink-soft">The catalog ranks papers by math focus, difficulty and topic overlap.</p>
          </div>
          <Link href="/discover" className="btn-ink">
            Browse suggestions <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </main>
    </div>
  );
}
