import type { MathEquation } from "@/db/schema";
import { renderTex } from "@/lib/latex";
import { FunctionSquare } from "lucide-react";

export function MathCard({ equation, index, dark = false }: { equation: MathEquation; index: number; dark?: boolean }) {
  return (
    <article className="panel overflow-hidden p-5 sm:p-6">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ember/10 text-[10.5px] font-semibold text-ember ring-1 ring-inset ring-ember/15">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="display-sm text-[15px] text-ink">{equation.label}</h4>
        </div>
        <FunctionSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted/60" />
      </div>

      <div
        className={`${dark ? "eq-panel-dark on-dark" : "eq-panel"} overflow-x-auto px-4 py-5 text-[15px]`}
        dangerouslySetInnerHTML={{ __html: renderTex(equation.latex, true) }}
      />

      <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink-soft">{equation.plain}</p>

      {equation.symbols.length > 0 && (
        <dl className="mt-4 grid gap-2 border-t border-black/[0.07] pt-3.5 sm:grid-cols-2">
          {equation.symbols.map((sym) => (
            <div key={sym.symbol} className="flex items-start gap-2.5">
              <dt className="shrink-0 rounded-lg bg-[#f1ece1] px-2 py-1 text-[12.5px] text-[#5c3a1c] ring-1 ring-inset ring-black/[0.05]">
                <span dangerouslySetInnerHTML={{ __html: renderTex(sym.symbol, false) }} />
              </dt>
              <dd className="pt-0.5 text-[11.5px] leading-relaxed text-muted">{sym.meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

export function InlineMath({ tex, className = "" }: { tex: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: renderTex(tex, false) }} />;
}

export function DisplayMath({ tex, className = "" }: { tex: string; className?: string }) {
  return <div className={`overflow-x-auto ${className}`} dangerouslySetInnerHTML={{ __html: renderTex(tex, true) }} />;
}
