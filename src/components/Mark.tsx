export function LotusMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M24 39c-6.2 0-11.2-5-11.2-11.2 0-1.9.5-3.7 1.4-5.3 1.7 3.9 4.9 6.6 9.8 6.6s8.1-2.7 9.8-6.6c.9 1.6 1.4 3.4 1.4 5.3C35.2 34 30.2 39 24 39Z" />
      <path d="M24 29.1c-4.6 0-8.3-3.7-8.3-8.3 0-4.1 2.8-7.5 6.5-8.6-.9 1.7-1.4 3.6-1.4 5.6 0 4.6 1.4 8.2 3.2 11.3Z" />
      <path d="M24 29.1c4.6 0 8.3-3.7 8.3-8.3 0-4.1-2.8-7.5-6.5-8.6.9 1.7 1.4 3.6 1.4 5.6 0 4.6-1.4 8.2-3.2 11.3Z" />
      <path d="M24 18.4c1.9-2.1 3-4.8 3-7.8 0-1.4-.3-2.7-.8-3.9M24 18.4c-1.9-2.1-3-4.8-3-7.8 0-1.4.3-2.7.8-3.9" />
      <path d="M12.8 22.5c-1.9 1.2-3.2 3.2-3.6 5.5M35.2 22.5c1.9 1.2 3.2 3.2 3.6 5.5" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-ink">
      <LotusMark className={compact ? "h-5 w-5" : "h-6 w-6"} />
      {!compact && <span className="text-[15px] font-semibold tracking-tight">ScholarAI</span>}
    </span>
  );
}
