import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import {
  ArrowUpRight,
  Boxes,
  CircuitBoard,
  Command,
  Filter,
  GitFork,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  categoryUrl,
  skillUrl,
  SKILL_CATEGORIES,
  SKILLS_NPM,
  SKILLS_REPO,
  SKILLS_WELCOME,
  SKILL_STATS,
  SUPPORTED_AGENTS,
} from "@/lib/skills";

export const metadata: Metadata = {
  title: "Research skills",
  description:
    "Browse 98 AI research and engineering skills across 23 categories — training, inference, evaluation, interpretability and paper writing — from the open-source AI Research Skills Library.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function pick(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

export default async function SkillsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = pick(sp, "q").trim().toLowerCase();
  const active = pick(sp, "cat");

  const categories = active ? SKILL_CATEGORIES.filter((c) => c.name === active) : SKILL_CATEGORIES;

  const results = categories
    .flatMap((category) =>
      category.skills
        .filter((skill) => {
          if (!q) return true;
          return `${skill.name} ${skill.note ?? ""} ${category.name}`.toLowerCase().includes(q);
        })
        .map((skill) => ({ category, skill })),
    )
    .slice(0, 60);

  const activeCategory = SKILL_CATEGORIES.find((c) => c.name === active);
  const autoresearch = SKILL_CATEGORIES[0];
  const autoresearchSkill = autoresearch.skills[0];

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 pt-4 sm:px-5">
        {/* Hero */}
        <section className="panel-warm relative overflow-hidden rounded-[28px] px-6 py-9 sm:px-10 sm:py-12">
          <div className="arc-lines absolute inset-0 opacity-70" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fdf0dd] backdrop-blur-sm">
                <GitFork className="h-3 w-3" /> Open source · MIT · Orchestra Research
              </span>
              <h1 className="display mt-4 text-[clamp(1.9rem,4.8vw,3.1rem)] text-[#fdf6ea]">
                The engineering half of research, as installable skills.
              </h1>
              <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-white/85">
                You read the papers here — the <strong className="font-semibold text-white">AI Research Skills Library</strong>{" "}
                hands your coding agent production knowledge for doing the work: training, fine-tuning, inference, evaluation,
                interpretability and paper writing.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <a
                  href={SKILLS_REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#fdf6ea] px-5 py-3 text-[13px] font-semibold text-[#3b2415] transition-transform hover:-translate-y-0.5"
                >
                  View on GitHub <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#install"
                  className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-[13px] font-semibold text-[#fdf6ea] transition-colors hover:bg-white/10"
                >
                  Install in one command
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: SKILL_STATS.skills, label: "skills" },
                { value: SKILL_STATS.categories, label: "categories" },
                { value: SKILL_STATS.license, label: "license" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/25 bg-white/12 px-3 py-4 text-center backdrop-blur-sm">
                  <div className="font-mono text-[21px] font-medium text-[#fdf6ea]">{s.value}</div>
                  <div className="mt-0.5 text-[9.5px] uppercase tracking-[0.12em] text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Install */}
        <section id="install" className="mt-4 scroll-mt-24">
          <div className="panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ember">
                  <Command className="h-3.5 w-3.5" /> Quick install
                </div>
                <h2 className="display-sm mt-2 text-[18px] text-ink">One command for humans, one line for agents</h2>
              </div>
              <span className="chip">{SKILLS_NPM}</span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold text-muted">Terminal</p>
                <pre className="mt-1.5 overflow-x-auto rounded-xl border border-black/[0.07] bg-[#16130f] px-3.5 py-3 text-[12px] leading-relaxed text-[#f5d9b5]">{`npx ${SKILLS_NPM}`}</pre>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  Interactive installer: auto-detects your coding agents, installs to <code className="rounded bg-white/45 px-1">~/.orchestra/skills/</code> and
                  symlinks into each agent. Also offers <code className="rounded bg-white/45 px-1">list</code> and <code className="rounded bg-white/45 px-1">update</code>.
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted">For AI agents</p>
                <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap rounded-xl border border-black/[0.07] bg-[#16130f] px-3.5 py-3 text-[11.5px] leading-relaxed text-[#f5d9b5]">{`Read ${SKILLS_WELCOME}
and follow the instructions to
install and use AI Research Skills.`}</pre>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">The welcome doc handles the whole bootstrap, then loads the autoresearch orchestration layer.</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-black/[0.07] pt-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">Works with</span>
              {SUPPORTED_AGENTS.map((agent) => (
                <span key={agent} className="chip !py-1">{agent}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Featured: autoresearch */}
        <section className="mt-4">
          <div className="panel-warm-soft rounded-[26px] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14]">
                  <Route className="h-3.5 w-3.5" /> Central orchestration layer
                </div>
                <h2 className="display-sm mt-2 text-[22px] text-[#3b2415]">{autoresearchSkill.name}</h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[#6b4426]">{autoresearchSkill.note}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Literature survey", "Ideation", "Experiments", "Synthesis", "Paper writing"].map((stage) => (
                    <span key={stage} className="rounded-full bg-white/55 px-2.5 py-1 text-[10.5px] font-medium text-[#6b4426] ring-1 ring-inset ring-white/60">
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={skillUrl(autoresearch, autoresearchSkill)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#3b2415] px-4 py-2.5 text-[11.5px] font-semibold text-[#fdf3e3]"
              >
                Read the skill <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Search + filters */}
        <section className="mt-8 px-1">
          <form action="/skills" method="get" className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 backdrop-blur-md p-1.5 pl-4 focus-within:border-ember/35">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search skills — fine-tuning, attention, RL, vector search, LaTeX…"
              className="w-full bg-transparent py-2 text-[13px] text-ink placeholder:text-muted/70 outline-none"
            />
            {active && <input type="hidden" name="cat" value={active} />}
            <button type="submit" className="btn-ink !py-2">Search</button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
              <Filter className="h-3 w-3" /> Category
            </span>
            <Link href={q ? `/skills?q=${encodeURIComponent(q)}` : "/skills"} className={`rounded-full px-3 py-1.5 text-[11px] font-medium ${!active ? "chip-active" : "border border-black/[0.08] bg-white/60 backdrop-blur-md text-ink-soft hover:border-black/20"}`}>
              All
            </Link>
            {SKILL_CATEGORIES.map((category) => {
              const isActive = active === category.name;
              return (
                <Link
                  key={category.dir}
                  href={`/skills?cat=${encodeURIComponent(category.name)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${isActive ? "chip-active" : "border border-black/[0.08] bg-white/60 backdrop-blur-md text-ink-soft hover:border-black/20"}`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-muted">
            <span>
              <span className="font-semibold text-ink">{results.length}</span> skill{results.length === 1 ? "" : "s"}
              {q && <> matching &ldquo;{q}&rdquo;</>}
              {activeCategory && <> in {activeCategory.name}</>}
            </span>
            {(q || active) && (
              <Link href="/skills" className="inline-flex items-center gap-1 rounded-full bg-white/45 px-2.5 py-1 text-[11px] text-ink-600 hover:bg-sand-300">
                <X className="h-3 w-3" /> Clear
              </Link>
            )}
          </div>
        </section>

        {/* Skill grid */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ category, skill }) => (
            <a
              key={`${category.dir}-${skill.name}`}
              href={skillUrl(category, skill)}
              target="_blank"
              rel="noreferrer"
              className="panel hover-lift group flex flex-col p-4.5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="chip !py-1 !text-[10px]">{category.name}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted transition-all group-hover:-translate-y-0.5 group-hover:text-ember" />
              </div>
              <h3 className="display-sm mt-2.5 text-[15.5px] text-ink group-hover:text-ember">{skill.name}</h3>
              {skill.note && <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">{skill.note}</p>}
            </a>
          ))}
          {results.length === 0 && (
            <div className="panel-flat col-span-full px-6 py-12 text-center">
              <p className="text-[13px] text-ink-soft">No skill matches that search.</p>
              <Link href="/skills" className="btn-ink mt-4 inline-flex">Browse all categories</Link>
            </div>
          )}
        </section>

        {/* Attribution */}
        <section className="mt-8 rounded-[26px] border border-black/[0.08] bg-white/32 backdrop-blur-md p-5 sm:p-7">
          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                <ShieldCheck className="h-3.5 w-3.5" /> About the library
              </div>
              <h2 className="display-sm mt-2 text-[19px] text-ink">Maintained by Orchestra Research</h2>
              <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-ink-soft">
                {SKILL_STATS.skills} skills across {SKILL_STATS.categories} categories, released under the MIT license and kept in sync by CI.
                Each skill follows a progressive-disclosure structure — a focused SKILL.md plus references — so your agent loads only
                what the task needs. Full inventory is in the repository.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a href={SKILLS_REPO} target="_blank" rel="noreferrer" className="btn-ink">
                <Boxes className="h-3.5 w-3.5" /> Repository
              </a>
              <a href={SKILLS_WELCOME} target="_blank" rel="noreferrer" className="btn-outline">
                <Sparkles className="h-3.5 w-3.5 text-ember" /> Welcome doc
              </a>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-1.5 border-t border-black/[0.07] pt-4">
            {SKILL_CATEGORIES.map((category) => (
              <a
                key={category.dir}
                href={categoryUrl(category)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-white/60 backdrop-blur-md px-2 py-1 text-[10.5px] text-ink-soft ring-1 ring-inset ring-black/[0.06] transition-colors hover:text-ember"
              >
                <CircuitBoard className="h-3 w-3" /> {category.name}
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
