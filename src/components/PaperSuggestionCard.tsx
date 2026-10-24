import Link from "next/link";
import { ArrowUpRight, Clock, Quote, Sparkles } from "lucide-react";
import type { CatalogItem } from "@/lib/catalog";
import { DisplayMath } from "@/components/MathCard";

const difficultyStyles: Record<string, string> = {
  Beginner: "bg-[#e7efe3] text-[#41633a] ring-[#41633a]/15",
  Intermediate: "bg-[#f7e7d3] text-[#8a4c14] ring-[#8a4c14]/15",
  Advanced: "bg-[#f4ded6] text-[#8f3a24] ring-[#8f3a24]/15",
};

export function formatCitations(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function DifficultyPill({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ring-1 ring-inset ${
        difficultyStyles[value] ?? difficultyStyles.Intermediate
      } ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {value}
    </span>
  );
}

export function SuggestionCard({ paper, reason }: { paper: CatalogItem; reason?: string }) {
  return (
    <article className="panel hover-lift group relative flex flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <DifficultyPill value={paper.difficulty} />
        <span className="chip !py-1">{paper.domain}</span>
        <span className="ml-auto font-mono text-[10.5px] text-muted">{paper.year}</span>
      </div>

      <h3 className="display-sm mt-3 text-[17px] text-ink">
        <Link href={`/discover/${paper.slug}`} className="transition-colors hover:text-ember">
          {paper.title}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-1 text-[11.5px] text-muted">{paper.authors}</p>

      <div className="eq-panel mt-3 overflow-hidden px-3 py-3">
        <div className="overflow-x-auto text-[12.5px]">
          <DisplayMath tex={paper.keyEquation} />
        </div>
        <span className="mt-2 block text-[9.5px] uppercase tracking-[0.14em] text-[#8a6a45]">{paper.equationLabel}</span>
      </div>

      <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">{paper.abstract}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {paper.topics.slice(0, 3).map((topic) => (
          <span key={topic} className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted">
            {topic}
          </span>
        ))}
      </div>

      {reason && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-ember">
          <Sparkles className="h-3 w-3" /> {reason}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/[0.07] pt-3.5">
        <span className="flex items-center gap-3 text-[10.5px] text-muted">
          <span className="flex items-center gap-1">
            <Quote className="h-3 w-3" /> {formatCitations(paper.citations)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {paper.readingMinutes}m
          </span>
        </span>
        <Link
          href={`/papers/new?from=${paper.slug}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-ember transition-colors hover:text-ember-deep"
        >
          Analyze <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function CompactSuggestion({ paper, reason }: { paper: CatalogItem; reason?: string }) {
  return (
    <Link
      href={`/discover/${paper.slug}`}
      className="group flex gap-3 rounded-2xl border border-transparent px-1 py-2 transition-colors hover:border-black/[0.05] hover:bg-[#f3efe5]"
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f1e3d1] font-mono text-[10px] font-semibold text-[#8a4c14] ring-1 ring-inset ring-[#8a4c14]/10">
        {paper.year.toString().slice(2)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] font-semibold text-ink transition-colors group-hover:text-ember">
          {paper.title}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted">
          {paper.domain} · {paper.readingMinutes}m read
        </span>
        {reason && <span className="mt-0.5 block truncate text-[10px] font-medium text-ember/80">{reason}</span>}
      </span>
    </Link>
  );
}
