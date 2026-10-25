import { NavBar } from "@/components/NavBar";
import { CompactSuggestion, DifficultyPill, formatCitations } from "@/components/PaperSuggestionCard";
import { DisplayMath } from "@/components/MathCard";
import { LEARNING_PATHS, rankRelated } from "@/lib/catalog";
import { loadCatalog } from "@/lib/suggestions";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Clock,
  ExternalLink,
  FunctionSquare,
  Lightbulb,
  Quote,
  Route,
  Search,
  Sigma,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CatalogPaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await loadCatalog();
  const paper = catalog.find((c) => c.slug === slug);
  if (!paper) notFound();

  const related = rankRelated({ topics: paper.topics, domain: paper.domain, difficulty: paper.difficulty }, catalog, 4).filter(
    (r) => r.item.slug !== paper.slug,
  );
  const path = LEARNING_PATHS.find((p) => p.steps.includes(paper.slug));
  const prefill = new URLSearchParams({
    from: paper.slug,
    title: paper.title,
    authors: paper.authors,
    year: String(paper.year),
    venue: paper.venue,
    abstract: paper.abstract,
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-3 pt-5 sm:px-5">
        <Link href="/discover" className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to discover
        </Link>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <article className="panel-warm-soft overflow-hidden rounded-[28px] p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyPill value={paper.difficulty} className="!bg-white/60" />
                <span className="rounded-full bg-white/50 px-2.5 py-1 text-[10.5px] font-medium text-[#6b4426] ring-1 ring-inset ring-white/60">
                  {paper.domain}
                </span>
                {paper.featured && (
                  <span className="rounded-full bg-[#3b2415] px-2.5 py-1 text-[10px] font-semibold text-[#fdf3e3]">Editor&apos;s pick</span>
                )}
                <span className="ml-auto font-mono text-[11px] text-[#8a6a45]">
                  {paper.venue} · {paper.year}
                </span>
              </div>

              <h1 className="display mt-4 text-[clamp(1.8rem,3.8vw,2.7rem)] text-[#3b2415]">{paper.title}</h1>
              <p className="mt-2 text-[12px] text-[#7c5a3c]">{paper.authors}</p>

              <div className="mt-5 flex flex-wrap gap-4 border-y border-[#8a4c14]/15 py-3 text-[11px] text-[#6b4426]">
                <span className="flex items-center gap-1.5">
                  <Quote className="h-3.5 w-3.5" /> {formatCitations(paper.citations)} citations
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {paper.readingMinutes} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <FunctionSquare className="h-3.5 w-3.5" /> {paper.equationLabel}
                </span>
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-[#4a3323]">{paper.abstract}</p>

              <div className="mt-5">
                <div className="mb-2 flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14]">
                  <Sigma className="h-3 w-3" /> The equation that matters
                </div>
                <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/65 px-4 py-5">
                  <DisplayMath tex={paper.keyEquation} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {paper.topics.map((t) => (
                  <span key={t} className="rounded-full bg-white/55 px-2.5 py-1 text-[10.5px] text-[#6b4426]">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href={`/papers/new?${prefill.toString()}`} className="btn-warm">
                  <Sparkles className="h-3.5 w-3.5" /> Run AI analysis
                </Link>
                <a href={paper.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#3b2415]/20 px-4 py-2.5 text-[12px] font-semibold text-[#3b2415] transition-colors hover:bg-white/50">
                  <ExternalLink className="h-3.5 w-3.5" /> Original paper
                </a>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="panel p-5">
                <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  <Sparkles className="h-3 w-3 text-ember" /> Math focus
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{paper.mathFocus}</p>
              </div>
              <div className="panel p-5">
                <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                  <Lightbulb className="h-3 w-3 text-ember" /> Why read it
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{paper.whyRead}</p>
              </div>
            </div>

            {path && (
              <div className="panel p-5 sm:p-6">
                <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ember">
                  <Route className="h-3 w-3" /> Part of a learning path
                </div>
                <h2 className="display-sm mt-2 text-[19px] text-ink">{path.title}</h2>
                <p className="mt-1 text-[12.5px] text-ink-soft">{path.description}</p>
                <ol className="mt-4 grid gap-1 sm:grid-cols-2">
                  {path.steps.map((stepSlug, i) => {
                    const step = catalog.find((c) => c.slug === stepSlug);
                    if (!step) return null;
                    const isCurrent = step.slug === paper.slug;
                    return (
                      <li key={stepSlug}>
                        <Link
                          href={`/discover/${step.slug}`}
                          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] transition-colors ${
                            isCurrent
                              ? "bg-[#f1e3d1] text-[#5c3a1c] ring-1 ring-inset ring-[#8a4c14]/15"
                              : "text-ink-soft hover:bg-[#f3efe5] hover:text-ink"
                          }`}
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-black/[0.05] font-mono text-[9.5px]">{i + 1}</span>
                          <span className="truncate">{step.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="panel p-5">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                <BookOpen className="h-3.5 w-3.5 text-ember" /> Read next
              </h2>
              <div className="mt-3 space-y-1">
                {related.map(({ item, reason }) => (
                  <CompactSuggestion key={item.slug} paper={item} reason={reason} />
                ))}
              </div>
            </div>

            <div className="panel-warm rounded-3xl p-5">
              <h2 className="text-[14px] font-semibold text-[#fdf6ea]">Deep dive the maths</h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#fbe7cf]/85">
                Run this paper through the analyzer for equation-by-equation explanations, symbol glossaries and derivation steps.
              </p>
              <Link
                href={`/papers/new?${prefill.toString()}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#fdf6ea] px-3.5 py-2 text-[11.5px] font-semibold text-[#3b2415]"
              >
                Start the analysis <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="panel p-5">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                <Search className="h-3.5 w-3.5 text-ember" /> Related research
              </h2>
              <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
                Live title searches on external indexes — cited-by lists, follow-ups, connected work.
              </p>
              <div className="mt-3 space-y-1.5">
                {[
                  { label: "Semantic Scholar", href: `https://www.semanticscholar.org/search?q=${encodeURIComponent(paper.title)}&sort=relevance` },
                  { label: "Google Scholar", href: `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}` },
                  { label: "Connected Papers", href: `https://www.connectedpapers.com/search?q=${encodeURIComponent(paper.title)}` },
                  { label: "arXiv listings", href: `https://arxiv.org/a/search?query=${encodeURIComponent(paper.title)}&searchtype=all` },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-2 rounded-xl border border-black/[0.06] bg-[#f8f5ee] px-3 py-2 text-[11.5px] font-medium text-ink-soft transition-colors hover:border-ember/30 hover:text-ember"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 text-muted transition-transform group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="panel-flat p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Quick facts</h2>
              <dl className="mt-3 space-y-2 text-[11.5px]">
                {[
                  ["Published", `${paper.venue}, ${paper.year}`],
                  ["Field", paper.domain],
                  ["Maths level", paper.difficulty],
                  ["Reading time", `${paper.readingMinutes} minutes`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-black/[0.05] pb-1.5 last:border-0">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
