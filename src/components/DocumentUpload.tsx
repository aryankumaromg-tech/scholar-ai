"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, Presentation, Upload, X } from "lucide-react";

export interface ParsedUpload {
  fileName: string;
  fileType: "pdf" | "ppt" | "pptx" | "txt";
  fileSize: number;
  title: string;
  authors: string;
  year: string;
  abstract: string;
  content: string;
  wordCount: number;
  warnings: string[];
}

export function DocumentUpload({
  onParsed,
  current,
  onClear,
}: {
  onParsed: (document: ParsedUpload) => void;
  current?: { fileName: string; fileType: string; fileSize: number } | null;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState<number | null>(null);

  async function process(file: File) {
    setError("");
    setWarnings([]);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "ppt", "pptx", "txt"].includes(ext)) {
      setError("Upload a PDF, PowerPoint (PPT/PPTX), or TXT file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("This file is over the 15 MB upload limit.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not read this document.");
      const document = body.document as ParsedUpload;
      setWarnings(document.warnings ?? []);
      setWordCount(document.wordCount);
      onParsed(document);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read this document.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (current) {
    const isPresentation = /ppt/i.test(current.fileType);
    return (
      <div className="rounded-2xl border border-[#41633a]/20 bg-[#e7efe3]/70 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70 text-[#41633a] ring-1 ring-inset ring-[#41633a]/10">
            {isPresentation ? <Presentation className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41633a]">
              <CheckCircle2 className="h-3 w-3" /> Text extracted
            </div>
            <p className="mt-1 truncate text-[13px] font-semibold text-ink">{current.fileName}</p>
            <p className="mt-0.5 text-[10.5px] text-[#54734d]">
              {current.fileType.toUpperCase()} · {(current.fileSize / 1024 / 1024).toFixed(2)} MB
              {wordCount !== null ? ` · ${wordCount.toLocaleString()} words` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClear();
              setWarnings([]);
              setWordCount(null);
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#54734d] transition-colors hover:bg-white/60 hover:text-ink"
            aria-label="Remove uploaded document"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {warnings.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-[#41633a]/10 pt-2.5">
            {warnings.map((warning) => (
              <li key={warning} className="flex gap-1.5 text-[10.5px] leading-relaxed text-[#6b5a32]">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {warning}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,.txt,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void process(file);
        }}
      />
      <button
        type="button"
        onClick={() => !loading && inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void process(file);
        }}
        disabled={loading}
        className={`group w-full rounded-2xl border border-dashed px-5 py-7 text-center transition-all ${
          dragging
            ? "border-ember bg-[#f7e7d3] shadow-[0_0_0_3px_rgba(194,95,33,0.08)]"
            : "border-black/15 bg-[#f8f5ee] hover:border-ember/40 hover:bg-[#fbf9f4]"
        } disabled:cursor-wait`}
      >
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f1e3d1] text-[#8a4c14] ring-1 ring-inset ring-[#8a4c14]/10 transition-transform group-hover:-translate-y-0.5">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        </span>
        <span className="mt-3 block text-[13px] font-semibold text-ink">
          {loading ? "Reading your document…" : dragging ? "Drop to extract the paper" : "Drop a paper here, or choose a file"}
        </span>
        <span className="mt-1 block text-[10.5px] text-muted">PDF · PPT · PPTX · TXT — up to 15 MB</span>
        <span className="mt-2 block text-[10px] text-muted/75">Your file is processed in memory; only extracted text is saved with the analysis.</span>
      </button>
      {error && (
        <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-[#f4ded6] px-3 py-2 text-[11px] leading-relaxed text-[#8f3a24]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
