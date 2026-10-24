"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { LotusMark } from "@/components/Mark";

const left = [
  { href: "/discover", label: "Discover" },
  { href: "/skills", label: "Skills" },
  { href: "/papers/new", label: "Analyze" },
];
const right = [
  { href: "/papers", label: "Library" },
  { href: "/compare", label: "Compare" },
  { href: "/discover#paths", label: "Learning paths" },
  { href: "/pricing", label: "Pricing" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href.split("#")[0]) && href !== "/discover#paths");

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto max-w-6xl">
        <header className="relative flex h-[58px] items-center justify-between gap-3 rounded-full border border-black/[0.07] bg-[#f8f5ee]/85 px-2.5 shadow-[0_10px_30px_-22px_rgba(27,24,21,0.5)] backdrop-blur-xl sm:h-[62px] sm:px-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-full border border-black/[0.07] bg-[#f2eee5] text-ink transition-colors hover:bg-[#ece7db] sm:h-10 sm:w-10"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <nav className="hidden items-center gap-1 md:flex">
              {left.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    isActive(item.href) ? "bg-[#eee9dd] text-ink" : "text-ink-soft hover:bg-[#f1ede4] hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/discover#catalog"
                className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-[#f1ede4] hover:text-ink"
              >
                Catalog <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Link>
            </nav>
          </div>

          <Link href="/" className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center text-ink" aria-label="ScholarAI home">
            <LotusMark className="h-6 w-6 sm:h-7 sm:w-7" />
          </Link>

          <div className="flex items-center gap-1.5">
            <nav className="hidden items-center gap-1 lg:flex">
              {right.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive(item.href) ? "bg-[#eee9dd] text-ink" : "text-ink-soft hover:bg-[#f1ede4] hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/papers/new" className="btn-warm !px-3.5 !py-2 !text-[12.5px] sm:!px-4 sm:!py-2.5">
              <span className="hidden sm:inline">Get started</span>
              <span className="sm:hidden">Start</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {open && (
          <div className="animate-fade-up mt-2 rounded-3xl border border-black/[0.07] bg-[#f8f5ee]/95 p-3 shadow-xl shadow-black/5 backdrop-blur-xl md:hidden">
            <nav className="grid gap-1">
              {[{ href: "/", label: "Home" }, ...left, ...right].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-[#f1ede4] hover:text-ink"
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4 opacity-40" />
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
