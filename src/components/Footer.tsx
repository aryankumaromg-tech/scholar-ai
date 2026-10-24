import Link from "next/link";
import { LotusMark } from "@/components/Mark";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/discover", label: "Paper catalog" },
      { href: "/discover#paths", label: "Learning paths" },
      { href: "/discover#matcher", label: "Abstract matcher" },
      { href: "/skills", label: "Research skills" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { href: "/papers", label: "Your library" },
      { href: "/papers/new", label: "Analyze a paper" },
      { href: "/papers/1?tab=mathematics", label: "Math deep dive" },
      { href: "/compare", label: "Compare papers" },
    ],
  },
  {
    title: "Plans",
    links: [
      { href: "/pricing", label: "Pricing & plans" },
      { href: "/pricing#compare", label: "Compare tiers" },
      { href: "/pricing#next", label: "What comes next" },
    ],
  },
  {
    title: "System",
    links: [
      { href: "/api/health", label: "Health" },
      { href: "/api/papers", label: "Papers API" },
      { href: "/api/suggestions", label: "Suggestions API" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/[0.07] bg-[#ebe6dc]/70">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <span className="flex items-center gap-2 text-ink">
              <LotusMark className="h-7 w-7" />
              <span className="text-[17px] font-semibold tracking-tight">ScholarAI</span>
            </span>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              Guided reading for research papers: structured briefs, equation-by-equation maths, and suggestions that build on
              what you just read. Analyses come from a deterministic local engine for demonstration.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/papers/new" className="btn-ink !py-2 !text-[12px]">
                Start reading
              </Link>
              <Link href="/discover" className="btn-outline !py-2 !text-[12px]">
                Browse catalog
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="eyebrow">{col.title}</h3>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[13px] text-ink-soft transition-colors hover:text-ember">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-black/[0.07] pt-5 text-[11.5px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ScholarAI — research reading, with the maths intact.</p>
          <p>Equations typeset with KaTeX · Next.js · Drizzle · PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}
