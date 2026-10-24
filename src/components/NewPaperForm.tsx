"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentUpload, type ParsedUpload } from "@/components/DocumentUpload";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  FunctionSquare,
  Loader2,
  Quote,
  Sigma,
  Sparkles,
  Wand2,
} from "lucide-react";

export interface Prefill {
  title: string;
  authors: string;
  year: string;
  source: string;
  abstract: string;
  content: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

const SAMPLE: Prefill = {
  title: "Attention Is All You Need",
  authors: "Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin",
  year: "2017",
  source: "NeurIPS",
  abstract:
    "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
  content:
    "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results by over 2 BLEU. The encoder is composed of a stack of six identical layers. Each layer has two sub-layers: a multi-head self-attention mechanism and a position-wise fully connected feed-forward network. We employ a residual connection around each of the two sub-layers, followed by layer normalization. We scale the dot products by 1/sqrt(d_k) because for large d_k the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients.",
};

const OUTPUTS = [
  { icon: Sparkles, label: "Executive TL;DR" },
  { icon: BookOpen, label: "Structured summary" },
  { icon: CheckCircle2, label: "Key findings" },
  { icon: Sigma, label: "Math deep dive + equations" },
  { icon: Quote, label: "Notation & derivation steps" },
  { icon: FlaskConical, label: "Limitations & next reads" },
];

export function NewPaperForm({ initial }: { initial: Prefill }) {
  const router = useRouter();
  const [form, setForm] = useState<Prefill>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = form.title.trim().length > 2 && (form.content.trim().length > 40 || form.abstract.trim().length > 40);

  function set<K extends keyof Prefill>(key: K, value: Prefill[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setError("Add a title plus at least an abstract or some full text.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }
      router.push(`/papers/${data.paper.id}`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-black/[0.1] bg-[#fbf9f4] px-3.5 py-2.5 text-[13px] text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-ember/45 focus:bg-white focus:ring-2 focus:ring-ember/10";

  const uploaded = form.fileName
    ? { fileName: form.fileName, fileType: form.fileType ?? "document", fileSize: form.fileSize ?? 0 }
    : null;

  function applyUpload(document: ParsedUpload) {
    setForm((current) => ({
      ...current,
      title: document.title || current.title,
      authors: document.authors || current.authors,
      year: document.year || current.year,
      source: current.source || `Uploaded ${document.fileType.toUpperCase()}`,
      abstract: document.abstract || current.abstract,
      content: document.content,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
    }));
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
      <div className="space-y-4">
        <div className="panel p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="eyebrow">01 · Import a document</h2>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
              Upload a paper or presentation and we’ll extract its text and prefill the fields below.
            </p>
          </div>
          <DocumentUpload
            current={uploaded}
            onParsed={applyUpload}
            onClear={() =>
              setForm((current) => ({ ...current, fileName: undefined, fileType: undefined, fileSize: undefined }))
            }
          />
        </div>

        <div className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="eyebrow">02 · Paper identity</h2>
            <button
              type="button"
              onClick={() => {
                setForm(SAMPLE);
                setError("");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-ember/20 bg-[#f7e7d3] px-2.5 py-1.5 text-[10.5px] font-semibold text-[#8a4c14] transition-colors hover:bg-[#f3ddc3]"
            >
              <Wand2 className="h-3 w-3" /> Fill a sample
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-[11.5px] font-semibold text-ink-soft">
                Paper title <span className="text-ember">*</span>
              </label>
              <input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Attention Is All You Need" className={inputClass} />
            </div>
            <div>
              <label htmlFor="authors" className="mb-1.5 block text-[11.5px] font-semibold text-ink-soft">
                Authors
              </label>
              <input id="authors" value={form.authors} onChange={(e) => set("authors", e.target.value)} placeholder="Vaswani et al." className={inputClass} />
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label htmlFor="year" className="mb-1.5 block text-[11.5px] font-semibold text-ink-soft">
                  Year
                </label>
                <input id="year" inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="2017" className={inputClass} />
              </div>
              <div>
                <label htmlFor="source" className="mb-1.5 block text-[11.5px] font-semibold text-ink-soft">
                  Venue / source
                </label>
                <input id="source" value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="NeurIPS, arXiv, Nature…" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <h2 className="eyebrow mb-4">03 · Content to analyze</h2>
          <div className="space-y-3.5">
            <div>
              <label htmlFor="abstract" className="mb-1.5 block text-[11.5px] font-semibold text-ink-soft">
                Abstract
              </label>
              <textarea
                id="abstract"
                rows={4}
                value={form.abstract}
                onChange={(e) => set("abstract", e.target.value)}
                placeholder="Paste the abstract. Even a few sentences is enough for a first pass."
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="content" className="text-[11.5px] font-semibold text-ink-soft">
                  Full text
                </label>
                <span className="text-[10px] text-muted">Optional if an abstract is provided</span>
              </div>
              <textarea
                id="content"
                rows={11}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Paste the body of the paper. More text gives better math detection and richer derivation steps."
                className={`${inputClass} resize-y leading-relaxed`}
              />
              <p className="mt-1.5 text-[10px] text-muted">
                {form.content.trim() ? `${form.content.trim().split(/\s+/).length} words · ${form.content.length} chars` : "No full text yet"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#9c2f18]/20 bg-[#f4ded6] px-4 py-3 text-[12.5px] text-[#8f3a24]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || !canSubmit} className="btn-warm w-full !py-3.5 !text-[13.5px] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:!px-7">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing maths & prose…" : "Generate analysis"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>

      <aside className="space-y-4">
        <div className="panel p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ember">
            <FunctionSquare className="h-3.5 w-3.5" /> What you get
          </div>
          <ul className="mt-3.5 space-y-2.5">
            {OUTPUTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-[12px] text-ink-soft">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f1e3d1] text-[#8a4c14]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-warm-soft rounded-3xl p-5">
          <h3 className="text-[12.5px] font-semibold text-[#3b2415]">Make the math dive deeper</h3>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#6b4426]">
            Paste sections with equations, derivations or complexity analysis. Keyword detection routes the paper to the right
            mathematical kernel — attention, diffusion, variational, duality, information theory and more.
          </p>
        </div>

        <div className="panel-flat p-5">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Not sure what to add?</h3>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
            Browse the catalog for landmark papers with pre-filled details and one-click analysis.
          </p>
          <a href="/discover" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ember hover:text-ember-deep">
            Open discover <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </aside>
    </form>
  );
}
