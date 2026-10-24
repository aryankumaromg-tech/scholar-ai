import type { ReactNode } from "react";

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim().length > 0);
  if (blocks.length <= 1) {
    return <div className={`whitespace-pre-line ${className}`}>{inline(text, "rt")}</div>;
  }
  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, i) => (
        <p key={i} className="leading-relaxed">
          {inline(block, `rt-${i}`)}
        </p>
      ))}
    </div>
  );
}
