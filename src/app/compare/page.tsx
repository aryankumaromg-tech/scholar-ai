import { NavBar } from "@/components/NavBar";
import { DifficultyPill } from "@/components/PaperSuggestionCard";
import { RichText } from "@/components/RichText";
import { db } from "@/db";
import { analyses, papers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Scale, Sigma, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

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

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-3 pt-5 sm:px-5">
        <Link href={left ? `/papers/${left.paper.id}?tab=tools` : "/papers"} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to research tools
        </Link>

        <section className="panel-warm-soft mt-4 overflow-hidden rounded-[28px] px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14] ring-1 ring-inset ring-white/60">
                <Scale className="h-3 w-3" /> Literature comparison
              </span>
              <h1 className="display mt-4 text-[clamp(1.9rem,4.5vw,3rem)] text-[#3b2415]">Compare papers, claim by claim.</h1>
              <p className="mt-3 text-[13px] leading-relaxed text-[#6b4426]">
                Put two analyses beside each other to compare the problem, method, contribution, limitations, mathematical
                load, and reading cost.
              </p>
            </div>
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/50 text-[#8a4c14] ring-1 ring-inset ring-white/60">
              <Scale className="h-7 w-7" />
            </span>
          </div>
        </section>

        <form action="/compare" method="get" className="panel mt-4 grid items-end gap-3 p-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:p-5">
          <label className="block">
            <span className="eyebrow">Paper A</span>
            <select name="left" defaultValue={leftId} className="mt-2 w-full rounded-xl border border-black/[0.09] bg-[#f8f5ee] px-3 py-2.5 text-[12px] text-ink outline-none focus:border-ember/40">
              {library.map((entry) => (
                <option key={entry.paper.id} value={entry.paper.id}>{entry.paper.title}</option>
              ))}
            </select>
          </label>
          <ArrowRight className="mb-3 hidden h-4 w-4 text-muted sm:block" />
          <label className="block">
            <span className="eyebrow">Paper B</span>
            <select name="right" defaultValue={rightId} className="mt-2 w-full rounded-xl border border-black/[0.09] bg-[#f8f5ee] px-3 py-2.5 text-[12px] text-ink outline-none focus:border-ember/40">
              {library.map((entry) => (
                <option key={entry.paper.id} value={entry.paper.id}>{entry.paper.title}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-ink mb-0.5">Compare</button>
        </form>

        {left && right && left.analysis && right.analysis ? (
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {[left, right].map((entry, index) => (
                <Link key={entry.paper.id} href={`/papers/${entry.paper.id}`} className={`rounded-[24px] p-5 ${index === 0 ? "panel" : "panel-warm-soft"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#3b2415] text-[10px] font-semibold text-[#fdf3e3]">{index === 0 ? "A" : "B"}</span>
                    <DifficultyPill value={entry.analysis?.difficulty ?? "Intermediate"} />
                    <span className="chip !py-0.5">{entry.analysis?.domain ?? "Unclassified"}</span>
                  </div>
                  <h2 className="display-sm mt-3 text-[19px] text-ink">{entry.paper.title}</h2>
                  <p className="mt-1.5 text-[11.5px] text-muted">{entry.paper.authors ?? "Unknown author"} · {entry.paper.year ?? "n.d."}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Metric icon={<Sigma className="h-3.5 w-3.5" />} value={`${entry.analysis?.mathScore ?? "—"}/100`} label="maths" />
                    <Metric icon={<Clock className="h-3.5 w-3.5" />} value={`${entry.analysis?.readingMinutes ?? "—"}m`} label="read" />
                    <Metric icon={<BookOpen className="h-3.5 w-3.5" />} value={(entry.analysis?.topics ?? "").split(",").filter(Boolean).length} label="topics" />
                  </div>
                </Link>
              ))}
            </div>

            <CompareRow title="In one sentence" left={left.analysis.tldr ?? ""} right={right.analysis.tldr ?? ""} />
            <CompareRow title="Methodology" left={left.analysis.methodology ?? ""} right={right.analysis.methodology ?? ""} />
            <CompareRow title="Main contribution" left={left.analysis.contributions} right={right.analysis.contributions} />
            <CompareRow title="Limitations" left={left.analysis.limitations ?? ""} right={right.analysis.limitations ?? ""} />
            <CompareRow title="Recommended follow-up" left={left.analysis.recommendations ?? ""} right={right.analysis.recommendations ?? ""} />
          </div>
        ) : (
          <div className="panel-flat mt-4 px-6 py-14 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-ember/60" />
            <h2 className="display-sm mt-3 text-[18px] text-ink">Two analyzed papers are required</h2>
            <p className="mt-1.5 text-[12px] text-muted">Analyze another paper, then return here to compare them.</p>
            <Link href="/papers/new" className="btn-warm mt-4">Analyze a paper</Link>
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
      <header className="border-b border-black/[0.07] bg-[#f3efe5] px-5 py-2.5">
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
