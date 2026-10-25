/**
 * Decorative frosted slabs behind the page, echoing the reference material:
 * large translucent rounded rectangles catching light on a cool slate canvas.
 * Purely cosmetic — fixed, non-interactive, hidden from assistive tech.
 */
const TILES = [
  { className: "left-[-4%] top-[6%] h-40 w-[42%] rotate-[-6deg] opacity-70", delay: "0s" },
  { className: "left-[8%] top-[22%] h-24 w-[30%] rotate-[3deg] opacity-55", delay: "-3s" },
  { className: "right-[-6%] top-[3%] h-48 w-[34%] rotate-[5deg] opacity-65", delay: "-5s" },
  { className: "right-[10%] top-[30%] h-28 w-[22%] rotate-[-4deg] opacity-45", delay: "-2s" },
  { className: "left-[26%] bottom-[6%] h-36 w-[36%] rotate-[2deg] opacity-40", delay: "-7s" },
  { className: "right-[-3%] bottom-[12%] h-32 w-[26%] rotate-[-7deg] opacity-50", delay: "-4s" },
];

export function GlassBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* soft light blooms */}
      <div className="absolute -left-24 -top-28 h-[420px] w-[420px] rounded-full bg-white/55 blur-[120px]" />
      <div className="absolute right-[-10%] top-[8%] h-[380px] w-[380px] rounded-full bg-[#cdd8ef]/60 blur-[110px]" />
      <div className="absolute bottom-[-12%] left-[30%] h-[420px] w-[520px] rounded-full bg-[#aab4c8]/40 blur-[130px]" />

      {/* frosted slabs */}
      {TILES.map((tile) => (
        <div key={tile.className} className={`glass-tile float-slow ${tile.className}`} style={{ animationDelay: tile.delay }} />
      ))}

      {/* fine top light streak, as in the reference */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}
