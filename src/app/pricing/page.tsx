import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { PlanCheckoutButton } from "@/components/PlanCheckoutButton";
import { razorpayConfigured } from "@/lib/plans";
import { ArrowRight, ArrowUpRight, Check, CreditCard, GraduationCap, Handshake, Minus, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "Free, Pro, and Research & Institution plans for ScholarAI: paper analysis, math deep dives, multi-paper comparison, and shared research workspaces.",
};

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    cadence: "forever",
    priceNote: "No card required",
    kicker: "For occasional reading",
    blurb: "Limited paper analyses and basic summaries.",
    cta: { label: "Start free", href: "/papers/new" },
    features: [
      "5 paper analyses per month",
      "Basic summary: TL;DR, findings, limitations",
      "Curated catalog and next-read suggestions",
      "Paste text or upload one PDF up to 5 MB",
      "1 saved paper in your library",
    ],
    warm: false,
    badge: null as string | null,
  },
  {
    id: "pro",
    name: "Pro",
    price: 5,
    cadence: "per month",
    priceNote: "Billed monthly · cancel anytime",
    kicker: "For serious daily reading",
    blurb: "Higher usage limits, advanced analysis, and multi-paper comparison.",
    cta: { label: "Get Pro", href: "/papers/new" },
    features: [
      "100 paper analyses per month",
      "Math deep dives: equations, derivations, notation glossary",
      "PDF · PPT/PPTX · TXT upload up to 15 MB",
      "Two-paper comparison with synthesis and verdict",
      "Deep research: experiment plans and reproducibility audit",
      "Research notes, 4 citation styles, evidence checklist",
    ],
    warm: true,
    badge: "Most popular" as string | null,
  },
  {
    id: "premium",
    name: "Premium",
    price: 15,
    cadence: "per month",
    priceNote: "Billed monthly · cancel anytime",
    kicker: "For labs and heavy readers",
    blurb: "Everything in Pro plus shared workspaces, collaboration and the largest allowances.",
    cta: { label: "Go Premium", href: "/papers/new" },
    features: [
      "Unlimited paper analyses",
      "Everything in Pro, with priority document parsing",
      "Shared workspace across your lab or department",
      "Collaborative research notes and a common library",
      "Bulk import and library-wide search",
      "Priority support and early access to new research tools",
    ],
    warm: false,
    badge: null as string | null,
  },
];

const INCLUDED_IN = [
  { label: "Paper analyses per month", free: "5", pro: "100", premium: "Unlimited" },
  { label: "Saved papers in library", free: "1", pro: "Unlimited", premium: "Unlimited" },
  { label: "Upload size limit", free: "5 MB", pro: "15 MB", premium: "50 MB" },
  { label: "Formats supported", free: "PDF · TXT", pro: "PDF · PPTX · TXT", premium: "PDF · PPTX · PPT · TXT" },
];

const MATRIX: { label: string; free: boolean | string; pro: boolean | string; premium: boolean | string }[] = [
  { label: "Basic summary & key findings", free: true, pro: true, premium: true },
  { label: "Catalog, suggestions & learning paths", free: true, pro: true, premium: true },
  { label: "Math deep dives & derivations", free: false, pro: true, premium: true },
  { label: "PPT/PPTX upload & larger files", free: false, pro: true, premium: true },
  { label: "Multi-paper comparison & synthesis", free: false, pro: true, premium: true },
  { label: "Deep research brief (experiments, audit)", free: false, pro: true, premium: true },
  { label: "Notes, citations & evidence checklist", free: false, pro: true, premium: true },
  { label: "Shared workspace & collaboration", free: false, pro: false, premium: true },
  { label: "Priority parsing & support", free: false, pro: false, premium: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-[11.5px] font-medium text-ink-soft">{value}</span>;
  }
  return value ? (
    <Check className="mx-auto h-4 w-4 text-[#41633a]" aria-label="Included" />
  ) : (
    <Minus className="mx-auto h-4 w-4 text-muted/45" aria-label="Not included" />
  );
}

export default function PricingPage() {
  const paymentsReady = razorpayConfigured();
  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 pt-4 sm:px-5">
        {/* Hero */}
        <section className="panel-warm-soft relative overflow-hidden rounded-[28px] px-6 py-9 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(233,160,82,0.3),transparent_70%)]" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a4c14] ring-1 ring-inset ring-white/60">
              <Sparkles className="h-3 w-3" /> Plans
            </span>
            <h1 className="display mt-4 text-[clamp(1.9rem,4.6vw,3rem)] text-[#3b2415]">
              Pick the depth of analysis you need.
            </h1>
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-[#6b4426]">
              Every plan reads the same papers — they differ in how far the analysis goes, how much you can process, and how
              many people you read with.
            </p>
            <p className="mt-5 inline-flex rounded-full bg-white/50 px-3 py-1.5 text-[11px] font-medium text-[#6b4426] ring-1 ring-inset ring-white/60">
              Prices in USD. Pro and Premium are billed monthly; cancel anytime. Beta launch pricing.
            </p>
          </div>
        </section>

        {/* Tiers */}
        <section className="mt-4 grid gap-3 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={
                tier.warm
                  ? "panel-warm flex flex-col rounded-[26px] p-6 sm:p-7 lg:-mt-4 lg:mb-4"
                  : "panel hover-lift flex flex-col p-6 sm:p-7"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={`display-sm text-[20px] ${tier.warm ? "text-[#fdf6ea]" : "text-ink"}`}>{tier.name}</h2>
                  <p className={`mt-0.5 text-[11px] ${tier.warm ? "text-[#fbe7cf]/75" : "text-muted"}`}>{tier.kicker}</p>
                </div>
                {tier.badge && (
                  <span className={`rounded-full px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] ${
                    tier.warm ? "bg-[#3b2415] text-[#fdf3e3]" : "bg-ember text-white"
                  }`}>
                    {tier.badge}
                  </span>
                )}
              </div>

              <div className="mt-5">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-[clamp(1.9rem,3.4vw,2.5rem)] font-semibold tracking-[-0.035em] ${tier.warm ? "text-[#fdf6ea]" : "text-ink"}`}>
                    ${tier.price}
                  </span>
                  <span className={`text-[11px] font-medium ${tier.warm ? "text-[#fbe7cf]/75" : "text-muted"}`}>
                    /{tier.cadence}
                  </span>
                </div>
                <div className={`mt-1 text-[10.5px] ${tier.warm ? "text-[#fbe7cf]/65" : "text-muted"}`}>{tier.priceNote}</div>
              </div>

              <p className={`mt-4 text-[13px] leading-relaxed ${tier.warm ? "text-[#fbe7cf]/90" : "text-ink-soft"}`}>{tier.blurb}</p>

              <ul className={`mt-5 flex-1 space-y-2.5 border-t pt-4 ${tier.warm ? "border-white/20" : "border-black/[0.07]"}`}>
                {tier.features.map((feature) => (
                  <li key={feature} className={`flex gap-2.5 text-[12.5px] leading-relaxed ${tier.warm ? "text-[#fdf6ea]/90" : "text-ink-soft"}`}>
                    <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tier.warm ? "text-[#ffd8ac]" : "text-[#41633a]"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {tier.price > 0 ? (
                <PlanCheckoutButton
                  planId={tier.id as "pro" | "premium"}
                  label={tier.cta.label}
                  warm={tier.warm}
                  priceLabel={`$${tier.price}/mo`}
                />
              ) : (
                <Link
                  href={tier.cta.href}
                  className={
                    tier.warm
                      ? "mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#fdf6ea] px-4 py-3 text-[12.5px] font-semibold text-[#3b2415] transition-transform hover:-translate-y-0.5"
                      : "btn-outline mt-6 w-full"
                  }
                >
                  {tier.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </article>
          ))}
        </section>

        {!paymentsReady && (
          <p className="mt-3 flex items-start gap-2 rounded-2xl border border-[#8a4c14]/20 bg-[#f7e7d3]/70 px-4 py-3 text-[11.5px] leading-relaxed text-[#6b4426] backdrop-blur-md">
            <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-semibold">Test mode:</span> the Razorpay key ID is configured, but{" "}
              <code className="rounded bg-white/60 px-1 py-0.5">RAZORPAY_KEY_SECRET</code> is missing — checkout will not start
              until it is added. Prices are display-only for the Free tier.
            </span>
          </p>
        )}

        {/* Allowances strip */}
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/45 pb-3">
            <h2 className="display-sm text-[20px] text-ink">Monthly allowances</h2>
            <span className="text-[11px] text-muted">Same engine — priced by how much you read</span>
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDED_IN.map((row) => (
              <div key={row.label} className="glass-inset p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{row.label}</div>
                <dl className="mt-2.5 space-y-1.5 text-[11.5px]">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-soft">Free</dt>
                    <dd className="font-mono font-semibold text-ink">{row.free}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-soft">Pro · $5</dt>
                    <dd className="font-mono font-semibold text-ember">{row.pro}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-soft">Premium · $15</dt>
                    <dd className="font-mono font-semibold text-ink">{row.premium}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison matrix */}
        <section id="compare" className="mt-8 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-black/[0.08] pb-3">
            <h2 className="display-sm text-[20px] text-ink">Compare at a glance</h2>
            <span className="text-[11px] text-muted">Same analysis engine, different allowances</span>
          </div>
          <div className="panel mt-4 overflow-x-auto p-0">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-black/[0.07] bg-white/32 backdrop-blur-md">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Capability</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-ink">Free</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-ink">Pro</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-ember">Premium</th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 1 ? "bg-white/45 backdrop-blur-md/60" : ""}>
                    <td className="border-t border-black/[0.05] px-5 py-3 text-[12.5px] text-ink-soft">{row.label}</td>
                    <td className="border-t border-black/[0.05] px-4 py-3 text-center">
                      <Cell value={row.free} />
                    </td>
                    <td className="border-t border-black/[0.05] px-4 py-3 text-center">
                      <Cell value={row.pro} />
                    </td>
                    <td className="border-t border-black/[0.05] px-4 py-3 text-center">
                      <Cell value={row.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Future opportunities */}
        <section id="next" className="mt-8 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-black/[0.08] pb-3">
            <h2 className="display-sm text-[20px] text-ink">What we&apos;re building next</h2>
            <span className="text-[11px] text-muted">Future opportunities</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              {
                icon: GraduationCap,
                title: "University partnerships",
                body: "Course-reader licenses, seminar reading lists, and student cohorts that work through a learning path together — with the same math deep dives that make a proof readable.",
              },
              {
                icon: Handshake,
                title: "Academic platform integrations",
                body: "Import from arXiv, Zotero, Overleaf and reference managers, so a paper arrives with its metadata intact and leaves with a citation in the right style.",
              },
            ].map((item) => (
              <div key={item.title} className="panel-flat p-5 sm:p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/55 text-[#8a4c14] ring-1 ring-inset ring-[#8a4c14]/10">
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="display-sm mt-3.5 text-[17px] text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="panel-warm mt-10 rounded-[26px] px-6 py-9 sm:px-10 sm:py-11">
          <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="display text-[clamp(1.6rem,3.2vw,2.3rem)] text-[#fdf6ea]">
                Start free, upgrade for $5 when the reading gets serious.
              </h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-[#fbe7cf]/85">
                No card, no setup — paste a paper and read the analysis, including the equations, in seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/papers/new" className="inline-flex items-center gap-2 rounded-full bg-[#fdf6ea] px-5 py-3 text-[13px] font-semibold text-[#3b2415] transition-transform hover:-translate-y-0.5">
                Analyze a paper <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/discover" className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-[13px] font-semibold text-[#fdf6ea] transition-colors hover:bg-white/10">
                Browse the catalog <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
