import {
  AlertTriangle,
  ArrowUpRight,
  Beaker,
  BookMarked,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Search,
  Sigma,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { ResearchBrief as Brief } from "@/lib/research";

const strengthStyles: Record<string, string> = {
  Strong: "bg-[#e7efe3]/75 text-[#41633a] ring-[#41633a]/15",
  Moderate: "bg-[#f7e7d3]/75 text-[#8a4c14] ring-[#8a4c14]/15",
  Weak: "bg-[#f4ded6]/75 text-[#8f3a24] ring-[#8f3a24]/15",
};

const statusIcon = {
  documented: <CheckCircle2 className="h-3.5 w-3.5 text-[#41633a]" />,
  partial: <CircleDot className="h-3.5 w-3.5 text-[#8a4c14]" />,
  missing: <XCircle className="h-3.5 w-3.5 text-[#8f3a24]" />,
};

const effortLabel: Record<string, string> = { S: "Small · ~1 day", M: "Medium · ~1 week", L: "Large · multi-week" };

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
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

export function ResearchBriefView({ brief, title }: { brief: Brief; title: string }) {
  return (
    <div className="space-y-4">
      {/* Questions */}
      <Card
        title="Research questions"
        subtitle={`What to interrogate in “${title}”`}
        icon={<HelpCircle className="h-4 w-4" />}
      >
        <ol className="space-y-2.5">
          {brief.questions.map((question, i) => (
            <li key={question} className="flex gap-3 rounded-2xl border border-black/[0.06] bg-white/45 backdrop-blur-md p-3.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ember/10 font-mono text-[10px] font-semibold text-ember">
                Q{i + 1}
              </span>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">{question}</p>
            </li>
          ))}
        </ol>
      </Card>

      {/* Experiments */}
      <Card title="Experiment plan" subtitle="Concrete next steps with metrics and baselines" icon={<Beaker className="h-4 w-4" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          {brief.experiments.map((experiment) => (
            <article key={experiment.title} className="flex flex-col rounded-2xl border border-black/[0.07] bg-white/45 backdrop-blur-md p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[13px] font-semibold leading-snug text-ink">{experiment.title}</h3>
                <span className="shrink-0 rounded-md bg-white/55 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-ember ring-1 ring-inset ring-ember/15">
                  {experiment.effort}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">Hypothesis.</span> {experiment.hypothesis}
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">Design.</span> {experiment.design}
              </p>
              <dl className="mt-2.5 space-y-1 border-t border-black/[0.06] pt-2 text-[10.5px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Metric</dt>
                  <dd className="text-right font-medium text-ink">{experiment.metric}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Baseline</dt>
                  <dd className="text-right font-medium text-ink">{experiment.baseline}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Effort</dt>
                  <dd className="text-right text-ink-soft">{effortLabel[experiment.effort]}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </Card>

      {/* Claims + reproducibility */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Claim → evidence table" subtitle="Rate before you cite" icon={<ClipboardCheck className="h-4 w-4" />}>
          <div className="space-y-2.5">
            {brief.claims.map((claim, i) => (
              <article key={`${claim.claim}-${i}`} className="rounded-2xl border border-black/[0.06] bg-white/45 backdrop-blur-md p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium leading-relaxed text-ink">{claim.claim}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold ring-1 ring-inset ${strengthStyles[claim.strength]}`}>
                    {claim.strength}
                  </span>
                </div>
                <p className="mt-2 text-[10.5px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">Evidence:</span> {claim.evidence}
                </p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                  <span className="font-semibold">Verify:</span> {claim.howToVerify}
                </p>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Reproducibility audit" subtitle="What you can rebuild from this paper" icon={<ClipboardCheck className="h-4 w-4" />}>
          <ul className="space-y-2">
            {brief.reproducibility.map((row) => (
              <li key={row.item} className="flex gap-2.5 rounded-xl border border-black/[0.05] bg-white/45 backdrop-blur-md px-3 py-2.5">
                <span className="mt-0.5 shrink-0">{statusIcon[row.status]}</span>
                <span>
                  <span className="block text-[11.5px] font-semibold text-ink">{row.item}</span>
                  <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">{row.note}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/55 px-3 py-2 text-[10.5px] font-semibold text-[#6b4426]">
            <span>Audit score</span>
            <span>
              {Math.round(
                (brief.reproducibility.reduce((sum, r) => sum + (r.status === "documented" ? 1 : r.status === "partial" ? 0.5 : 0), 0) /
                  brief.reproducibility.length) *
                  100,
              )}
              %
            </span>
          </div>
        </Card>
      </div>

      {/* Open problems + follow-ups */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Open problems" subtitle="Where the paper stops" icon={<AlertTriangle className="h-4 w-4" />}>
          <ul className="space-y-2.5">
            {brief.openProblems.map((problem) => (
              <li key={problem} className="flex gap-2.5 text-[12px] leading-relaxed text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember/60" />
                {problem}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Follow-up work to do" subtitle="Small, high-yield next moves" icon={<Lightbulb className="h-4 w-4" />}>
          <ul className="space-y-2.5">
            {brief.followUps.map((item) => (
              <li key={item.title} className="rounded-xl border border-black/[0.06] bg-white/45 backdrop-blur-md px-3 py-2.5">
                <p className="text-[11.5px] font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{item.why}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Glossary */}
      <Card title="Working glossary" subtitle="Terms this paper assumes you know" icon={<Sigma className="h-4 w-4" />}>
        <dl className="grid gap-2 sm:grid-cols-2">
          {brief.glossary.map((entry) => (
            <div key={entry.term} className="rounded-xl border border-black/[0.06] bg-white/45 backdrop-blur-md px-3 py-2.5">
              <dt className="text-[11.5px] font-semibold text-ink">{entry.term}</dt>
              <dd className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{entry.definition}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* External research */}
      <Card title="Continue the literature" subtitle="Search this paper on external indexes" icon={<Search className="h-4 w-4" />}>
        <div className="grid gap-2 sm:grid-cols-2">
          {brief.external.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-black/[0.07] bg-white/45 backdrop-blur-md px-3.5 py-3 transition-colors hover:border-ember/30 hover:bg-white/60 backdrop-blur-md"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/55 text-ember ring-1 ring-inset ring-black/[0.06]">
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[12px] font-semibold text-ink group-hover:text-ember">
                  {link.label} <ArrowUpRight className="h-3 w-3" />
                </span>
                <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">{link.hint}</span>
              </span>
            </a>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted/80">
          <BookMarked className="mt-0.5 h-3 w-3 shrink-0" />
          These open a title search in an external index — results are live, not pre-computed here.
        </p>
      </Card>

      <div className="panel-warm-soft rounded-3xl p-5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8a4c14]">
          <Sparkles className="h-3.5 w-3.5" /> How this was generated
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-[#6b4426]">
          Derived from the extracted text: mathematical kernel, findings, limitations and detected experimental vocabulary. It is a
          structured reading scaffold, not a substitute for the paper&apos;s own appendix — verify each claim against the source.
        </p>
      </div>
    </div>
  );
}
