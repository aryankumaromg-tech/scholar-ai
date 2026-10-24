import { NavBar } from "@/components/NavBar";
import { NewPaperForm, type Prefill } from "@/components/NewPaperForm";
import { loadCatalog } from "@/lib/suggestions";
import Link from "next/link";
import { ArrowLeft, Sigma, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function pick(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

export default async function NewPaperPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const from = pick(sp, "from");

  const initial: Prefill = {
    title: pick(sp, "title"),
    authors: pick(sp, "authors"),
    year: pick(sp, "year"),
    source: pick(sp, "venue") || pick(sp, "source"),
    abstract: pick(sp, "abstract"),
    content: "",
  };

  if (from) {
    const catalog = await loadCatalog();
    const match = catalog.find((c) => c.slug === from);
    if (match) {
      initial.title = initial.title || match.title;
      initial.authors = initial.authors || match.authors;
      initial.year = initial.year || String(match.year);
      initial.source = initial.source || match.venue;
      initial.abstract = initial.abstract || match.abstract;
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 pt-5 sm:px-5">
        <Link href="/papers" className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to library
        </Link>

        <section className="mt-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-[#fbf9f4] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14]">
            <Sparkles className="h-3 w-3" /> New analysis
          </span>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="display text-[clamp(1.9rem,4.4vw,3rem)] text-ink">
                Analyze a paper, then dive into its <span className="text-ember">maths</span>.
              </h1>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                Paste a title and whatever text you have. You&rsquo;ll get a structured brief, key findings, suggested next reads
                and an equation-by-equation deep dive.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-black/[0.07] bg-[#fbf9f4] px-4 py-3">
              <Sigma className="h-4 w-4 text-ember" />
              <div>
                <div className="text-[11.5px] font-semibold text-ink">12 math kernels</div>
                <div className="text-[10px] text-muted">attention · diffusion · duality · quantum…</div>
              </div>
            </div>
          </div>
          {from && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f1e3d1] px-3 py-1.5 text-[11px] font-medium text-[#8a4c14] ring-1 ring-inset ring-[#8a4c14]/15">
              Pre-filled from the catalog — add the full text for a richer math dive.
            </p>
          )}
        </section>

        <div className="mt-7">
          <NewPaperForm initial={initial} />
        </div>
      </main>
    </div>
  );
}
