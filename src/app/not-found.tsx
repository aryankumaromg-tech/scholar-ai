import { NavBar } from "@/components/NavBar";
import { LotusMark } from "@/components/Mark";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/55 text-[#8a4c14] ring-1 ring-inset ring-[#8a4c14]/10">
          <LotusMark className="h-8 w-8" />
        </span>
        <p className="eyebrow mt-6">404</p>
        <h1 className="display mt-2 text-[clamp(2rem,5vw,3rem)] text-ink">This page never made it past review.</h1>
        <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
          The paper or page you were looking for isn&apos;t here. Head back to the library, or browse the catalog for something
          worth reading.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link href="/papers" className="btn-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to library
          </Link>
          <Link href="/discover" className="btn-outline">
            <Compass className="h-3.5 w-3.5 text-ember" /> Browse catalog
          </Link>
        </div>
      </main>
    </div>
  );
}
