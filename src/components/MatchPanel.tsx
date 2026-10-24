"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2, Sparkles, Wand2 } from "lucide-react";

interface Suggestion {
  slug: string;
  title: string;
  domain: string;
  difficulty: string;
  year: number;
  readingMinutes: number;
  mathFocus: string;
  reason: string;
  score: number;
}

const EXAMPLES = [
  "We introduce a diffusion-based generative model trained with a variational objective on image data.",
  "A quantum algorithm for unstructured search using amplitude amplification and phase oracles.",
  "We fine-tune a transformer language model and study attention sparsity across long sequences.",
];

export function MatchPanel() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not compute suggestions.");
        setItems(null);
      } else {
        setItems(data.suggestions as Suggestion[]);
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="matcher" className="panel-warm-soft relative scroll-mt-24 overflow-hidden rounded-[28px] p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/40" />
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full border border-white/30" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14]">
            <Wand2 className="h-3.5 w-3.5" /> Abstract matcher
          </div>
          <h2 className="display-sm mt-2 text-[22px] text-[#3b2415] sm:text-[26px]">
            Paste an abstract. Get your next three reads.
          </h2>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-[#6b4426]">
            Topic overlap, field and math difficulty — ranked against a curated catalog of landmark papers.
          </p>
        </div>
        <span className="rounded-full bg-white/50 px-2.5 py-1 text-[10px] font-semibold text-[#6b4426] ring-1 ring-inset ring-white/60">
          Live matching
        </span>
      </div>

      <form onSubmit={submit} className="relative mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Paste any abstract or a few sentences describing your interest…"
          className="w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-[13px] leading-relaxed text-[#3b2415] placeholder:text-[#a08466] outline-none backdrop-blur transition-colors focus:border-[#c25f21]/40 focus:bg-white/90 focus:ring-2 focus:ring-[#c25f21]/10"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="submit" disabled={loading || text.trim().length < 20} className="btn-warm disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Suggest papers
          </button>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setText(ex)}
              className="rounded-full border border-[#8a4c14]/15 px-2.5 py-1.5 text-[10.5px] font-medium text-[#6b4426] transition-colors hover:bg-white/50"
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </form>

      {error && <p className="relative mt-3 text-[11px] text-[#9c2f18]">{error}</p>}

      {items && items.length > 0 && (
        <ul className="relative mt-5 grid gap-2 border-t border-[#8a4c14]/12 pt-4">
          {items.map((item, i) => (
            <li key={item.slug}>
              <Link
                href={`/discover/${item.slug}`}
                className="group flex flex-wrap items-center gap-3 rounded-2xl border border-white/60 bg-white/55 px-3.5 py-2.5 transition-colors hover:bg-white/85"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#3b2415] text-[10px] font-semibold text-[#fdf3e3]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-[#3b2415]">{item.title}</span>
                  <span className="mt-0.5 block truncate text-[10.5px] text-[#7c5a3c]">
                    {item.reason} · {item.mathFocus}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-[#7c5a3c]">
                  <span className="rounded-md bg-[#3b2415]/[0.07] px-1.5 py-0.5">{item.difficulty}</span>
                  <span className="font-mono">{item.year}</span>
                  <span className="font-mono font-semibold text-[#8a4c14]">{item.score.toFixed(2)}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#8a4c14]" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {items && items.length === 0 && (
        <p className="relative mt-3 text-[11px] text-[#7c5a3c]">No close matches — try adding a method or field keyword.</p>
      )}
    </div>
  );
}
