"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  FileSearch,
  Loader2,
  NotebookPen,
  Plus,
  Quote,
  Scale,
  Search,
  Trash2,
} from "lucide-react";

interface Note {
  id: number;
  paperId: number;
  title: string;
  body: string;
  color: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface WorkspacePaper {
  id: number;
  title: string;
  authors: string | null;
  year: number | null;
  source: string | null;
  content: string;
  abstract: string | null;
}

interface WorkspaceAnalysis {
  tldr: string | null;
  summary: string;
  keyFindings: string;
  methodology: string | null;
  contributions: string;
  limitations: string | null;
  recommendations: string | null;
  domain: string | null;
  topics: string | null;
  mathScore: number | null;
}

const noteColors: Record<string, string> = {
  amber: "bg-[#f7e7d3]/75 border-[#8a4c14]/15",
  sage: "bg-[#e7efe3]/75 border-[#41633a]/15",
  rose: "bg-[#f4ded6]/75 border-[#8f3a24]/15",
  blue: "bg-[#e1ebef]/75 border-[#41606d]/15",
};

function authorParts(authors: string | null) {
  const clean = (authors ?? "Unknown author").replace(/\bet al\.?/gi, "").trim();
  return clean.split(/,|\band\b|&/).map((a) => a.trim()).filter(Boolean);
}

function citations(paper: WorkspacePaper) {
  const people = authorParts(paper.authors);
  const year = paper.year ?? "n.d.";
  const venue = paper.source ?? "Unpublished manuscript";
  const first = people[0] ?? "Unknown author";
  const lastFirst = first.split(/\s+/).reverse().join(", ");
  const apaAuthors = people.length > 1 ? `${lastFirst}, et al.` : lastFirst;
  const mlaAuthors = people.length > 1 ? `${lastFirst}, et al.` : lastFirst;
  const key = `${first.split(/\s+/).at(-1)?.toLowerCase() ?? "paper"}${paper.year ?? "nd"}`.replace(/[^a-z0-9]/g, "");

  return {
    APA: `${apaAuthors} (${year}). ${paper.title}. ${venue}.`,
    MLA: `${mlaAuthors}. “${paper.title}.” ${venue}, ${year}.`,
    Chicago: `${lastFirst}. “${paper.title}.” ${venue} (${year}).`,
    BibTeX: `@article{${key},\n  title = {${paper.title}},\n  author = {${paper.authors ?? "Unknown"}},\n  year = {${paper.year ?? ""}},\n  journal = {${venue}}\n}`,
  };
}

export function ResearchWorkspace({
  paper,
  analysis,
  initialNotes,
}: {
  paper: WorkspacePaper;
  analysis: WorkspaceAnalysis;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteColor, setNoteColor] = useState("amber");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const citationMap = useMemo(() => citations(paper), [paper]);

  const findings = analysis.keyFindings.split("\n\n").map((f) => f.trim()).filter(Boolean);
  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const text = paper.content.replace(/\s+/g, " ");
    const lower = text.toLowerCase();
    const results: string[] = [];
    let cursor = 0;
    while (results.length < 6) {
      const at = lower.indexOf(needle, cursor);
      if (at < 0) break;
      results.push(text.slice(Math.max(0, at - 90), Math.min(text.length, at + needle.length + 120)));
      cursor = at + needle.length;
    }
    return results;
  }, [paper.content, query]);

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  async function addNote() {
    if (!noteBody.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/papers/${paper.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: noteTitle || "Research note", body: noteBody, color: noteColor }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes((current) => [data.note as Note, ...current]);
        setNoteTitle("");
        setNoteBody("");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: number) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) setNotes((current) => current.filter((note) => note.id !== id));
  }

  function exportMarkdown() {
    const markdown = `# ${paper.title}\n\n**Authors:** ${paper.authors ?? "Unknown"}  \n**Year:** ${paper.year ?? "Unknown"}  \n**Source:** ${paper.source ?? "Unknown"}\n\n## TL;DR\n${analysis.tldr ?? ""}\n\n## Summary\n${analysis.summary}\n\n## Key findings\n${findings.map((f) => `- ${f}`).join("\n")}\n\n## Methodology\n${analysis.methodology ?? ""}\n\n## Contributions\n${analysis.contributions}\n\n## Limitations\n${analysis.limitations ?? ""}\n\n## Recommendations\n${analysis.recommendations ?? ""}\n\n## Notes\n${notes.map((n) => `### ${n.title}\n${n.body}`).join("\n\n")}\n`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${paper.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "research-brief"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Notes */}
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ember">
                <NotebookPen className="h-3.5 w-3.5" /> Research notes
              </div>
              <h2 className="display-sm mt-2 text-[18px] text-ink">Keep the thought beside the paper</h2>
            </div>
            <span className="chip !py-0.5">{notes.length}</span>
          </div>
          <div className="mt-4 space-y-2.5">
            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title (optional)"
              className="w-full rounded-xl border border-black/[0.09] bg-white/45 backdrop-blur-md px-3 py-2 text-[12px] outline-none focus:border-ember/40"
            />
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={4}
              placeholder="Question, critique, connection, experiment idea…"
              className="w-full resize-y rounded-xl border border-black/[0.09] bg-white/45 backdrop-blur-md px-3 py-2.5 text-[12px] leading-relaxed outline-none focus:border-ember/40"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5" aria-label="Note color">
                {Object.keys(noteColors).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNoteColor(color)}
                    className={`h-5 w-5 rounded-full border ${noteColors[color]} ${noteColor === color ? "ring-2 ring-ink/40 ring-offset-2 ring-offset-[#fbf9f4]" : ""}`}
                    aria-label={`${color} note`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => void addNote()} disabled={saving || !noteBody.trim()} className="btn-ink !px-3.5 !py-2 !text-[11px] disabled:opacity-40">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Save note
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2.5 border-t border-black/[0.07] pt-4">
            {notes.length === 0 && <p className="text-[11.5px] text-muted">No notes yet. Add a question or connection you want to revisit.</p>}
            {notes.map((note) => (
              <article key={note.id} className={`rounded-2xl border p-3.5 ${noteColors[note.color] ?? noteColors.amber}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[12px] font-semibold text-ink">{note.title}</h3>
                  <button type="button" onClick={() => void deleteNote(note.id)} className="text-muted transition-colors hover:text-[#8f3a24]" aria-label="Delete note">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[11.5px] leading-relaxed text-ink-soft">{note.body}</p>
                <p className="mt-2 text-[9.5px] text-muted">{new Date(note.updatedAt).toLocaleDateString()}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Citations */}
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ember">
            <Quote className="h-3.5 w-3.5" /> Citation builder
          </div>
          <h2 className="display-sm mt-2 text-[18px] text-ink">Four formats, ready to paste</h2>
          <div className="mt-4 space-y-2.5">
            {Object.entries(citationMap).map(([style, value]) => (
              <div key={style} className="rounded-2xl border border-black/[0.07] bg-white/45 backdrop-blur-md p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">{style}</span>
                  <button type="button" onClick={() => void copy(value, style)} className="flex items-center gap-1 text-[10.5px] font-semibold text-ember hover:text-ember-deep">
                    {copied === style ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
                    {copied === style ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[11.5px] leading-relaxed text-ink-soft">{value}</pre>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* search */}
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ember">
            <FileSearch className="h-3.5 w-3.5" /> Search inside paper
          </div>
          <h2 className="display-sm mt-2 text-[18px] text-ink">Find every mention in context</h2>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-black/[0.09] bg-white/45 backdrop-blur-md px-3.5">
            <Search className="h-3.5 w-3.5 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a term, method, dataset…" className="w-full bg-transparent py-2.5 text-[12px] outline-none" />
          </div>
          <div className="mt-3 space-y-2">
            {query.trim().length >= 2 && searchResults.length === 0 && <p className="text-[11px] text-muted">No exact mentions found.</p>}
            {searchResults.map((snippet, i) => (
              <p key={`${snippet}-${i}`} className="rounded-xl border border-black/[0.06] bg-white/45 backdrop-blur-md px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-soft">
                …{snippet}…
              </p>
            ))}
          </div>
        </section>

        {/* evidence checklist */}
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ember">
            <CheckCircle2 className="h-3.5 w-3.5" /> Evidence checklist
          </div>
          <h2 className="display-sm mt-2 text-[18px] text-ink">Verify the claims as you read</h2>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
            Mark each extracted finding only after you locate its supporting experiment, table, or proof.
          </p>
          <ul className="mt-4 space-y-2">
            {findings.map((finding, i) => {
              const done = checked.has(i);
              return (
                <li key={`${finding}-${i}`}>
                  <button
                    type="button"
                    onClick={() =>
                      setChecked((current) => {
                        const next = new Set(current);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                    className={`flex w-full gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      done ? "border-[#41633a]/15 bg-[#e7efe3]/75" : "border-black/[0.07] bg-white/45 backdrop-blur-md hover:border-ember/25"
                    }`}
                  >
                    <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${done ? "border-[#41633a] bg-[#41633a] text-white" : "border-black/20 bg-white/55"}`}>
                      {done && <Check className="h-3 w-3" />}
                    </span>
                    <span className={`text-[11.5px] leading-relaxed ${done ? "text-[#41633a] line-through opacity-75" : "text-ink-soft"}`}>{finding}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="panel-warm-soft flex flex-wrap items-center justify-between gap-5 rounded-3xl p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8a4c14]">
            <Scale className="h-3.5 w-3.5" /> Compare & export
          </div>
          <h2 className="display-sm mt-2 text-[18px] text-[#3b2415]">Take this analysis into your workflow</h2>
          <p className="mt-1 text-[11.5px] text-[#6b4426]">Compare methods side by side or download the complete brief and your notes as Markdown.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href={`/compare?left=${paper.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#3b2415] px-4 py-2.5 text-[11.5px] font-semibold text-[#fdf3e3]">
            <Scale className="h-3.5 w-3.5" /> Compare paper <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button type="button" onClick={exportMarkdown} className="inline-flex items-center gap-1.5 rounded-full border border-[#3b2415]/20 px-4 py-2.5 text-[11.5px] font-semibold text-[#3b2415] hover:bg-white/50">
            <Download className="h-3.5 w-3.5" /> Export brief
          </button>
        </div>
      </section>
    </div>
  );
}
