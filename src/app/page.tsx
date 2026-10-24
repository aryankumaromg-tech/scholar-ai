import { NavBar } from "@/components/NavBar";
import { SuggestionCard } from "@/components/PaperSuggestionCard";
import { DisplayMath } from "@/components/MathCard";
import { db } from "@/db";
import { analyses, papers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { LEARNING_PATHS } from "@/lib/catalog";
import { loadCatalog } from "@/lib/suggestions";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  Compass,
  FunctionSquare,
  Quote,
  Route,
  Sigma,
  Sparkles,
  Wand2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PORTRAITS = {
  hero: "/images/researcher-hero.jpg",
  one: "https://images.pexels.com/photos/4031686/pexels-photo-4031686.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  two: "https://images.pexels.com/photos/29547164/pexels-photo-29547164.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  three: "https://images.pexels.com/photos/8442615/pexels-photo-8442615.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
};

export default async function HomePage() {
  const catalog = await loadCatalog();
  const [allPapers, allAnalyses] = await Promise.all([
    db.select().from(papers).orderBy(desc(papers.createdAt)).limit(3),
    db.select().from(analyses).orderBy(desc(analyses.createdAt)),
  ]);

  const latestByPaper = new Map<number, (typeof allAnalyses)[number]>();
  for (const a of allAnalyses) if (!latestByPaper.has(a.paperId)) latestByPaper.set(a.paperId, a);
  const recent = allPapers.map((p) => ({ paper: p, analysis: latestByPaper.get(p.id) }));

  const showcase = catalog.find((c) => c.slug === "attention-is-all-you-need") ?? catalog[0];
  const picks = catalog.filter((c) => c.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-5 sm:pt-4">
        {/* ── Hero panel ───────────────────────────────────────────── */}
        <section className="panel-warm rounded-[26px] px-6 py-9 sm:rounded-[34px] sm:px-10 sm:py-12 lg:px-14">
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* portrait column */}
            <div className="order-2 flex flex-col items-center text-center lg:order-1">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full border border-white/25" />
                <div className="absolute -inset-8 rounded-full border border-white/12" />
                <img
                  src={PORTRAITS.hero}
                  alt="Researcher portrait"
                  loading="lazy"
                  className="relative h-[190px] w-[190px] rounded-full bg-[#e7d3b6] object-cover shadow-[0_24px_50px_-24px_rgba(60,25,0,0.7)] ring-1 ring-white/25 sm:h-[230px] sm:w-[230px]"
                />
              </div>
              <p className="mt-6 max-w-[240px] text-[11.5px] leading-relaxed text-[#fbe9d2]/80">
                Built for readers who want the derivation, not just the abstract. Equations decoded line by line.
              </p>
            </div>

            {/* copy column */}
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fdf0dd] backdrop-blur">
                <Sparkles className="h-3 w-3" /> Research reading companion
              </span>
              <h1 className="display mt-5 text-[clamp(2.3rem,5.4vw,3.9rem)] text-[#fdf6ea]">
                Guided through
                <br />
                every paper.
                <br />
                <span className="text-[#ffe0bb]">Maths included.</span>
              </h1>
              <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-[#fbe7cf]/85">
                ScholarAI reads a paper the way a good advisor would: the summary first, then the equations, then the three
                papers you should open next.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/papers/new"
                  className="inline-flex items-center gap-2 rounded-full bg-[#fdf6ea] px-5 py-3 text-[13px] font-semibold text-[#3b2415] shadow-lg shadow-[#5c2800]/25 transition-transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" /> Analyze a paper
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-[13px] font-semibold text-[#fdf6ea] transition-colors hover:bg-white/10"
                >
                  <Compass className="h-4 w-4" /> Explore the catalog
                </Link>
              </div>

              <div className="mt-7 grid max-w-md grid-cols-3 gap-2 border-t border-white/20 pt-5">
                {[
                  { value: catalog.length, label: "catalog papers" },
                  { value: LEARNING_PATHS.length, label: "reading paths" },
                  { value: "12", label: "math kernels" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-mono text-[19px] font-medium text-[#fdf6ea]">{s.value}</div>
                    <div className="text-[9.5px] uppercase tracking-[0.14em] text-[#f8ddbf]/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* floating equation strip */}
          {showcase && (
            <Link
              href={`/discover/${showcase.slug}`}
              className="group mt-9 flex flex-col gap-3 rounded-2xl border border-white/20 bg-[#3d1c06]/25 p-4 backdrop-blur-md transition-colors hover:bg-[#3d1c06]/35 sm:flex-row sm:items-center sm:gap-6 sm:px-6"
            >
              <div className="shrink-0">
                <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#ffdcb2]">
                  <FunctionSquare className="h-3 w-3" /> Equation of the day
                </div>
                <p className="mt-1 text-[12px] font-medium text-[#fdf6ea]">{showcase.equationLabel}</p>
              </div>
              <div className="on-dark min-w-0 flex-1 overflow-x-auto rounded-xl border border-white/15 bg-[#2a1204]/30 px-4 py-3 text-[13.5px]">
                <DisplayMath tex={showcase.keyEquation} />
              </div>
              <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-[#ffdcb2] transition-transform group-hover:-translate-y-0.5 sm:block" />
            </Link>
          )}
        </section>

        {/* ── Social proof ─────────────────────────────────────────── */}
        <section className="px-4 pb-6 pt-16 text-center sm:pt-20">
          <h2 className="display mx-auto max-w-3xl text-[clamp(1.9rem,4.2vw,3rem)] text-ink">
            Joined by the world&apos;s most curious researchers, engineers, and students.
          </h2>
          <div className="mt-9 flex flex-wrap items-start justify-center gap-8 sm:gap-14">
            {[
              { src: PORTRAITS.one, label: "Life sciences", note: "Clinical & health informatics" },
              { src: PORTRAITS.two, label: "AI research", note: "Deep learning & vision" },
              { src: PORTRAITS.three, label: "Applied science", note: "Physics & simulation" },
            ].map((p) => (
              <figure key={p.label} className="w-[150px] sm:w-[190px]">
                <img
                  src={p.src}
                  alt={p.label}
                  loading="lazy"
                  className="mx-auto h-[150px] w-[150px] rounded-full bg-[#e7d3b6] object-cover ring-1 ring-black/[0.08] sm:h-[188px] sm:w-[188px]"
                />
                <figcaption className="mt-4">
                  <div className="text-[13px] font-semibold text-ink">{p.label}</div>
                  <div className="mt-0.5 text-[11px] text-muted">{p.note}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Feature trio ─────────────────────────────────────────── */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-2 px-1">
            <div>
              <span className="eyebrow">What you get</span>
              <h2 className="display-sm mt-2 text-[26px] text-ink sm:text-[30px]">A brief, then the mathematics.</h2>
            </div>
            <Link href="/papers/new" className="flex items-center gap-1 text-[12px] font-semibold text-ember hover:text-ember-deep">
              Try it now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Structured brief",
                body: "TL;DR, key findings, methodology, limitations and a recommendation — no wall of text.",
                href: "/papers/1",
                cta: "See an example",
              },
              {
                icon: Sigma,
                title: "Maths deep dive",
                body: "Every core equation typeset and decoded, with a notation glossary and a derivation walkthrough.",
                href: "/papers/1?tab=mathematics",
                cta: "Open a deep dive",
              },
              {
                icon: Route,
                title: "Smarter next reads",
                body: "Suggestions ranked by topic overlap, field and math level — plus curated reading paths.",
                href: "/discover",
                cta: "Browse suggestions",
              },
            ].map(({ icon: Icon, title, body, href, cta }) => (
              <Link key={title} href={href} className="panel hover-lift group p-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f1e3d1] text-[#8a4c14] ring-1 ring-inset ring-[#8a4c14]/10">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="display-sm mt-4 text-[17px] text-ink">{title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{body}</p>
                <span className="mt-4 flex items-center gap-1 text-[11.5px] font-semibold text-ember">
                  {cta} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Recent analyses ──────────────────────────────────────── */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-2 px-1">
            <div>
              <span className="eyebrow">Your workspace</span>
              <h2 className="display-sm mt-2 text-[26px] text-ink sm:text-[30px]">Recent analyses</h2>
            </div>
            <Link href="/papers" className="flex items-center gap-1 text-[12px] font-semibold text-ember hover:text-ember-deep">
              Full library <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="panel-flat mt-5 flex flex-col items-center px-6 py-12 text-center">
              <Sparkles className="h-6 w-6 text-ember/60" />
              <p className="mt-3 max-w-sm text-[13px] text-ink-soft">
                No analyses yet. Start with a landmark paper from the catalog and see the full brief plus math deep dive.
              </p>
              <Link href="/discover" className="btn-ink mt-4">
                Pick a paper <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map(({ paper, analysis }) => (
                <Link key={paper.id} href={`/papers/${paper.id}`} className="panel hover-lift group flex flex-col p-5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="chip !py-0.5">{analysis?.domain ?? "Unclassified"}</span>
                    <span className="font-mono text-muted">{paper.year ?? "—"}</span>
                  </div>
                  <h3 className="display-sm mt-3 line-clamp-2 text-[16px] text-ink group-hover:text-ember">{paper.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">{analysis?.tldr ?? paper.abstract}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-black/[0.06] pt-3 text-[10.5px] text-muted">
                    <span className="flex items-center gap-1">
                      <Sigma className="h-3 w-3" /> math {analysis?.mathScore ?? "—"}/100
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {analysis?.readingMinutes ?? "—"}m
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Suggestions ──────────────────────────────────────────── */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-2 px-1">
            <div>
              <span className="eyebrow">Curated catalog</span>
              <h2 className="display-sm mt-2 text-[26px] text-ink sm:text-[30px]">Suggested for you</h2>
            </div>
            <Link href="/discover" className="flex items-center gap-1 text-[12px] font-semibold text-ember hover:text-ember-deep">
              All papers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((paper) => (
              <SuggestionCard key={paper.slug} paper={paper} />
            ))}
          </div>
        </section>

        {/* ── Learning paths ───────────────────────────────────────── */}
        <section id="paths" className="mt-14 scroll-mt-24">
          <div className="panel-warm-soft overflow-hidden rounded-[26px] p-6 sm:rounded-[32px] sm:p-9">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14]">
                  <Route className="h-3.5 w-3.5" /> Guided reading
                </div>
                <h2 className="display-sm mt-2 text-[26px] text-[#3b2415] sm:text-[32px]">
                  Four paths that build the mathematics in order
                </h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[#6b4426]">
                  Entropy → gradients → duality → attention → diffusion. Each step assumes only what came before it.
                </p>
              </div>
              <Link href="/discover#paths" className="inline-flex items-center gap-1.5 rounded-full bg-[#3b2415] px-4 py-2.5 text-[12px] font-semibold text-[#fdf3e3]">
                See all paths <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {LEARNING_PATHS.map((path) => (
                <Link
                  key={path.slug}
                  href="/discover#paths"
                  className="group rounded-2xl border border-white/60 bg-white/45 p-4 transition-colors hover:bg-white/75"
                >
                  <h3 className="text-[13px] font-semibold text-[#3b2415]">{path.title}</h3>
                  <p className="mt-1.5 line-clamp-3 text-[11.5px] leading-relaxed text-[#6b4426]">{path.description}</p>
                  <span className="mt-3 block font-mono text-[10px] text-[#8a4c14]">{path.steps.length} papers →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="mt-14 grid gap-3 md:grid-cols-3">
          {[
            { n: "01", title: "Submit a paper", body: "Paste a title with an abstract, or the full text for a richer math dive." },
            { n: "02", title: "Read the brief", body: "Summary, findings, methodology and limitations — structured for scanning." },
            { n: "03", title: "Dive into the maths", body: "Equations, notation and derivation steps, then three suggested next reads." },
          ].map((step) => (
            <div key={step.n} className="panel-flat p-5">
              <span className="font-mono text-[11px] text-ember">{step.n}</span>
              <h3 className="display-sm mt-2 text-[16px] text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{step.body}</p>
            </div>
          ))}
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="panel-warm mt-14 rounded-[26px] px-6 py-10 sm:rounded-[32px] sm:px-12 sm:py-14">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ffdcb2]">
                <Quote className="h-3.5 w-3.5" /> Start reading
              </div>
              <h2 className="display mt-3 text-[clamp(1.8rem,3.6vw,2.7rem)] text-[#fdf6ea]">
                Have a paper open in another tab?
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-[#fbe7cf]/85">
                Drop the abstract in. You&apos;ll get the brief, the maths and the next reads before your coffee cools.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/papers/new"
                className="inline-flex items-center gap-2 rounded-full bg-[#fdf6ea] px-5 py-3 text-[13px] font-semibold text-[#3b2415] shadow-lg shadow-[#5c2800]/25 transition-transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" /> Start an analysis
              </Link>
              <Link
                href="/discover#matcher"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-[13px] font-semibold text-[#fdf6ea] transition-colors hover:bg-white/10"
              >
                <Wand2 className="h-4 w-4" /> Match an abstract
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
