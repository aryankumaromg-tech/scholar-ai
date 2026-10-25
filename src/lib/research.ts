import { buildMathBreakdown } from "@/lib/math-deep-dive";
import { rankRelated, type CatalogItem } from "@/lib/catalog";

export interface ResearchClaim {
  claim: string;
  evidence: string;
  strength: "Strong" | "Moderate" | "Weak";
  howToVerify: string;
}

export interface ExperimentIdea {
  title: string;
  hypothesis: string;
  design: string;
  metric: string;
  baseline: string;
  effort: "S" | "M" | "L";
}

export interface ResearchBrief {
  questions: string[];
  experiments: ExperimentIdea[];
  openProblems: string[];
  reproducibility: { item: string; status: "documented" | "partial" | "missing"; note: string }[];
  claims: ResearchClaim[];
  glossary: { term: string; definition: string }[];
  external: { label: string; href: string; hint: string }[];
  followUps: { title: string; why: string }[];
}

interface PaperInput {
  title: string;
  abstract?: string | null;
  content: string;
  authors?: string | null;
  year?: number | null;
}

interface AnalysisInput {
  keyFindings?: string | null;
  methodology?: string | null;
  limitations?: string | null;
  recommendations?: string | null;
  contributions?: string | null;
  topics?: string | null;
  domain?: string | null;
  difficulty?: string | null;
  mathScore?: number | null;
}

const GLOSSARY_BANK: { test: RegExp; term: string; definition: string }[] = [
  { test: /attention|transformer|softmax/i, term: "Softmax attention", definition: "A convex weighting of values where weights come from exp(score) normalized across the context." },
  { test: /diffusion|denois|noise schedule/i, term: "Forward diffusion", definition: "A fixed Markov chain that gradually adds Gaussian noise; generation learns to invert it." },
  { test: /variational|elbo|posterior/i, term: "ELBO", definition: "A tractable lower bound on log-evidence, equal to reconstruction quality minus KL to the prior." },
  { test: /residual|shortcut/i, term: "Residual connection", definition: "Adds a block's input to its output so gradients have an uninterrupted path." },
  { test: /adversarial|discriminator|minimax/i, term: "Minimax objective", definition: "A two-player game: one network maximizes a classification score, the other minimizes it." },
  { test: /optimiz|gradient|adam|sgd/i, term: "Adaptive step size", definition: "Per-parameter scaling from running moments of the gradient, normalized for scale differences." },
  { test: /kernel|svm|margin|dual/i, term: "Dual formulation", definition: "Rewriting a constrained problem so data enter only through inner products, enabling kernels." },
  { test: /entropy|information|mutual/i, term: "Cross-entropy", definition: "Expected surprise of the labels under the model; equals entropy plus KL divergence." },
  { test: /graph|node|message passing/i, term: "Message passing", definition: "Nodes update by aggregating transformed features from their neighbours." },
  { test: /quantum|qubit|amplitude/i, term: "Amplitude amplification", definition: "Rotation in a two-dimensional amplitude subspace that concentrates probability on solutions." },
  { test: /quantization|int4|int8|bitsandbytes/i, term: "Post-training quantization", definition: "Mapping weights to low-precision integers with a per-group scale, cutting memory at small accuracy cost." },
  { test: /clinical|patient|cohort|trial/i, term: "Confidence interval", definition: "A procedure that covers the true effect at a stated rate across repeated studies." },
  { test: /pde|physics|simulation/i, term: "Physics-informed loss", definition: "Penalizes the residual of a governing differential equation evaluated by automatic differentiation." },
  { test: /retrieval|rag|vector|embedding/i, term: "Embedding index", definition: "A nearest-neighbour structure over dense vectors used to retrieve context at inference time." },
];

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);
}

function has(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

export function generateResearchBrief(paper: PaperInput, analysis: AnalysisInput): ResearchBrief {
  const corpus = `${paper.title} ${paper.abstract ?? ""} ${paper.content}`;
  const math = buildMathBreakdown({ title: paper.title, abstract: paper.abstract, content: paper.content });
  const kernel = math.kernel;
  const bodySentences = sentences(`${paper.abstract ?? ""} ${paper.content}`);
  const findings = (analysis.keyFindings ?? "").split("\n\n").map((f) => f.trim()).filter(Boolean);
  const limitations = (analysis.limitations ?? "").split(/\n{2,}/).map((l) => l.trim()).filter(Boolean);
  const topics = (analysis.topics ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const domain = analysis.domain ?? kernel.domain;

  const isEmpirical = has(corpus, /experiment|dataset|benchmark|evaluat|ablation|baseline/i);
  const isTheoretical = has(corpus, /theorem|proof|lemma|bound|convergence|guarantee/i);
  const isSystems = has(corpus, /throughput|latency|memory|gpu|training time|cluster|inference cost/i);

  // ── Research questions ────────────────────────────────────────────────
  const questions = [
    `What is the minimal change to the ${kernel.equations[0]?.label.toLowerCase() ?? "core objective"} that would break the reported gain, and does the paper's own ablation cover it?`,
    isEmpirical
      ? `Do the reported improvements survive when baselines receive the same tuning budget and compute as the proposed method?`
      : `Which assumption in the derivation is doing the most work — and what happens to the result when it is relaxed?`,
    isTheoretical
      ? `Is the bound tight, and for which distribution of inputs is it loose?`
      : `How does performance degrade under distribution shift, longer inputs, or a smaller labelled set?`,
    isSystems
      ? `Where does the runtime actually go: the ${kernel.equations.length} core equations, or the surrounding data movement?`
      : `What is the dominant cost term as data size n and model size d grow, and at what scale does it bind?`,
    `Which of the paper's claims is the most fragile, and what single experiment would falsify it fastest?`,
  ];

  // ── Experiment plan ───────────────────────────────────────────────────
  const primaryMetric = has(corpus, /bleu/i)
    ? "BLEU / chrF"
    : has(corpus, /accuracy|top-1|f1/i)
      ? "Task accuracy and macro-F1"
      : has(corpus, /perplexity|loss/i)
        ? "Held-out loss and perplexity"
        : has(corpus, /throughput|latency/i)
          ? "Throughput at fixed latency budget"
          : "Task metric on a held-out split";

  const experiments: ExperimentIdea[] = [
    {
      title: "Budget-matched baseline",
      hypothesis: "The reported gain shrinks once the baseline gets the same hyperparameter and compute budget.",
      design: "Re-run the strongest baseline with identical search budget, seed count, and data order; report the delta with confidence intervals.",
      metric: primaryMetric,
      baseline: "Best prior method, tuned to equal compute",
      effort: "M",
    },
    {
      title: "Component knockout",
      hypothesis: `Removing ${kernel.equations[0]?.label.toLowerCase() ?? "the central component"} costs more than any other ablation the paper reports.`,
      design: "Remove one ingredient at a time; keep parameter count roughly constant by widening the remaining path.",
      metric: primaryMetric,
      baseline: "Full proposed model",
      effort: "S",
    },
    {
      title: isEmpirical ? "Distribution-shift stress test" : "Assumption relaxation probe",
      hypothesis: isEmpirical
        ? "Accuracy degrades gracefully but calibration does not."
        : "The guarantee survives with a weaker smoothness/independence assumption, at a cost in the constant.",
      design: isEmpirical
        ? "Evaluate on a shifted split (new domain, longer sequences, lower-resource regime) without retuning."
        : "Re-derive with the assumption dropped and construct a counterexample if it fails.",
      metric: isEmpirical ? `${primaryMetric} + calibration error` : "Bound tightness vs empirical gap",
      baseline: "In-distribution result",
      effort: isTheoretical ? "L" : "M",
    },
    {
      title: "Scale sensitivity",
      hypothesis: `The advantage grows (or collapses) with scale; the ${math.mathScore > 70 ? "theoretical" : "empirical"} claim is only valid in a narrow band.`,
      design: "Sweep model width and data size on a log grid; fit a power law to the metric rather than reporting two points.",
      metric: "Metric vs compute (scaling slope)",
      baseline: "Reported single-scale number",
      effort: "L",
    },
  ];

  // ── Open problems ─────────────────────────────────────────────────────
  const openProblems = [
    ...limitations.slice(0, 2).map((l) => l.replace(/^\*\*[^*]+\*\*:?\s*/, "")),
    kernel.pitfalls[0] ? `Implementation hazard: ${kernel.pitfalls[0]}` : "",
    `No controlled study yet isolates ${topics[0]?.toLowerCase() ?? domain.toLowerCase()} effects from confounding capacity changes.`,
    `Whether the result transfers to ${topics[1]?.toLowerCase() ?? "adjacent settings"} at equal cost is untested.`,
  ]
    .filter(Boolean)
    .slice(0, 5);

  // ── Reproducibility ───────────────────────────────────────────────────
  const hasData = has(corpus, /dataset|corpus|split|benchmark/i);
  const hasHyper = has(corpus, /learning rate|hyperparameter|batch size|epoch|optimizer/i);
  const hasCode = has(corpus, /github|code|open[- ]source|implementation|repository/i);
  const hasSeeds = has(corpus, /seed|variance|standard deviation|confidence interval|error bar/i);
  const hasCompute = has(corpus, /gpu|tpu|a100|h100|v100|hours|flops/i);
  const hasStats = has(corpus, /significan|p-value|bootstrap|wilcoxon|t-test/i);

  const reproducibility: ResearchBrief["reproducibility"] = [
    { item: "Dataset and splits specified", status: hasData ? "documented" : "missing", note: hasData ? "Named in the text; confirm exact versions before comparing." : "No named corpora or split protocol found." },
    { item: "Hyperparameters reported", status: hasHyper ? "documented" : "partial", note: hasHyper ? "Search space still matters — check the appendix." : "Key optimiser settings are not stated." },
    { item: "Code or artefacts released", status: hasCode ? "documented" : "missing", note: hasCode ? "Link appears in the text; check licence and pinned dependencies." : "No repository referenced in the extracted text." },
    { item: "Seeds, variance, or error bars", status: hasSeeds ? "documented" : "missing", note: hasSeeds ? "Look for the number of runs behind each number." : "Single-run results are hard to trust at small deltas." },
    { item: "Compute budget disclosed", status: hasCompute ? "documented" : "partial", note: hasCompute ? "Translate to cost per experiment before reproducing." : "Hardware and wall-clock are unclear." },
    { item: "Statistical significance testing", status: hasStats ? "documented" : "missing", note: hasStats ? "Check the correction used for multiple comparisons." : "Deltas are reported without significance testing." },
  ];

  // ── Claims ────────────────────────────────────────────────────────────
  const strengths: ResearchClaim["strength"][] = isTheoretical ? ["Strong", "Strong", "Moderate", "Weak"] : ["Moderate", "Moderate", "Strong", "Weak"];
  const claims: ResearchClaim[] = (findings.length > 0 ? findings : bodySentences.slice(0, 4)).slice(0, 4).map((claim, i) => ({
    claim: claim.length > 300 ? `${claim.slice(0, 297)}…` : claim,
    evidence: i === 0 ? "Primary benchmark comparison (Table/Figure in main text)" : i === 1 ? "Ablation isolating the component" : i === 2 ? "Secondary task or dataset" : "Qualitative or appendix evidence",
    strength: strengths[i] ?? "Moderate",
    howToVerify: i === 0 ? "Re-run the baseline at matched budget and recompute the delta." : i === 1 ? "Check that parameter count was held constant in the ablation." : i === 2 ? "Confirm the secondary task used the same preprocessing." : "Look for variance across seeds before trusting the direction.",
  }));

  // ── Glossary ──────────────────────────────────────────────────────────
  const glossary = GLOSSARY_BANK.filter((entry) => entry.test.test(corpus))
    .slice(0, 6)
    .map(({ term, definition }) => ({ term, definition }));
  for (const equation of kernel.equations.slice(0, 3)) {
    if (glossary.length >= 7) break;
    glossary.push({ term: equation.label, definition: equation.plain });
  }

  // ── External discovery links ──────────────────────────────────────────
  const q = encodeURIComponent(paper.title);
  const external = [
    { label: "Semantic Scholar", href: `https://www.semanticscholar.org/search?q=${q}&sort=relevance`, hint: "Citations, references and influential follow-ups" },
    { label: "Google Scholar", href: `https://scholar.google.com/scholar?q=${q}`, hint: "Cited-by list and versions" },
    { label: "Connected Papers", href: `https://www.connectedpapers.com/search?q=${q}`, hint: "Visual graph of related work" },
    { label: "arXiv", href: `https://arxiv.org/a/search?query=${q}&searchtype=all`, hint: "Preprints that extend this line" },
  ];

  // ── Follow-ups (catalog-agnostic, uses kernel) ────────────────────────
  const followUps = [
    { title: `Reproduce the ${kernel.equations[0]?.label.toLowerCase() ?? "core result"} on synthetic data`, why: "Cheapest way to confirm you understand the machinery before touching real data." },
    { title: `Compare against the ${kernel.equations[1]?.label.toLowerCase() ?? "main baseline"} at equal budget`, why: "The most common reason a reported gain disappears." },
    { title: `Write the one-page derivation yourself`, why: "Surfaces the assumption the paper glosses over." },
  ];

  return { questions, experiments, openProblems, reproducibility, claims, glossary, external, followUps };
}

// ── Comparison synthesis ────────────────────────────────────────────────

export interface ComparisonSide {
  title: string;
  year?: number | null;
  authors?: string | null;
  domain?: string | null;
  difficulty?: string | null;
  mathScore?: number | null;
  readingMinutes?: number | null;
  topics?: string | null;
  abstract?: string | null;
  keyFindings?: string | null;
  limitations?: string | null;
  methodology?: string | null;
}

export interface ComparisonSynthesis {
  sharedTopics: string[];
  contrasts: { dimension: string; left: string; right: string }[];
  verdict: string;
  readingOrder: { first: "left" | "right"; reason: string };
  combinedGaps: string[];
  overlapScore: number;
}

export function buildComparison(left: ComparisonSide, right: ComparisonSide): ComparisonSynthesis {
  const parseTopics = (value?: string | null) =>
    (value ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

  const lt = parseTopics(left.topics);
  const rt = parseTopics(right.topics);
  const sharedTopics = [...new Set(lt.filter((t) => rt.includes(t)))];
  const overlapScore = Math.round((sharedTopics.length / Math.max(1, new Set([...lt, ...rt]).size)) * 100);

  const mathGap = (left.mathScore ?? 50) - (right.mathScore ?? 50);
  const yearGap = (left.year ?? 0) - (right.year ?? 0);

  const contrasts = [
    {
      dimension: "Mathematical load",
      left: `${left.mathScore ?? "—"}/100 · ${left.difficulty ?? "Unknown"}`,
      right: `${right.mathScore ?? "—"}/100 · ${right.difficulty ?? "Unknown"}`,
    },
    {
      dimension: "Reading cost",
      left: `${left.readingMinutes ?? "—"} min`,
      right: `${right.readingMinutes ?? "—"} min`,
    },
    {
      dimension: "Field",
      left: left.domain ?? "Unclassified",
      right: right.domain ?? "Unclassified",
    },
    {
      dimension: "Publication",
      left: `${left.year ?? "n.d."}`,
      right: `${right.year ?? "n.d."}`,
    },
    {
      dimension: "Shared topics",
      left: sharedTopics.length ? sharedTopics.join(", ") : "none detected",
      right: sharedTopics.length ? sharedTopics.join(", ") : "none detected",
    },
    {
      dimension: "Evidence style",
      left: styleOf(left.methodology, left.keyFindings),
      right: styleOf(right.methodology, right.keyFindings),
    },
  ];

  const older = yearGap <= 0 ? "left" : "right";
  const olderTitle = older === "left" ? left.title : right.title;
  const newerTitle = older === "left" ? right.title : left.title;

  const verdictParts = [
    sharedTopics.length
      ? `They overlap on ${sharedTopics.slice(0, 3).join(", ")} but differ in emphasis.`
      : `They sit in different sub-fields (${left.domain ?? "?"} vs ${right.domain ?? "?"}), so treat them as complementary rather than competing.`,
    Math.abs(mathGap) >= 12
      ? `${mathGap > 0 ? left.title : right.title} is the heavier mathematical read (${Math.abs(mathGap)} points denser); skim the equations first if you are new to the area.`
      : `Both sit at a similar mathematical depth (${left.mathScore ?? "—"} vs ${right.mathScore ?? "—"}), so neither acts as a gentler entry point.`,
    `Read ${olderTitle} before ${newerTitle} to see which problems are genuinely new.`,
  ];

  const combinedGaps = [
    "Neither paper isolates the effect of compute from the effect of architecture — a matched-budget ablation is still missing.",
    ...(sharedTopics.length
      ? [`No shared evaluation protocol across ${sharedTopics[0]}: results are not directly comparable without re-running.`]
      : [`No common benchmark connects these two lines of work, so any comparison here is conceptual.`]),
    `Reproduction risk is shared: check seeds, splits and tuning budgets in both before citing either number.`,
  ];

  return {
    sharedTopics,
    contrasts,
    verdict: verdictParts.join(" "),
    readingOrder: { first: older, reason: `Published earlier (${older === "left" ? left.year ?? "n.d." : right.year ?? "n.d."}); reading it first makes the second paper's delta legible.` },
    combinedGaps,
    overlapScore,
  };
}

function styleOf(methodology?: string | null, findings?: string | null): string {
  const text = `${methodology ?? ""} ${findings ?? ""}`.toLowerCase();
  if (/theorem|proof|bound|lemma/.test(text)) return "Theoretical / proof-driven";
  if (/ablation|benchmark|dataset|experiment/.test(text)) return "Empirical / benchmark-driven";
  if (/system|throughput|latency|deploy/.test(text)) return "Systems / performance-driven";
  return "Mixed or unclear";
}

export function relatedFromCatalog(topics: string[], domain: string | null | undefined, difficulty: string | null | undefined, catalog: CatalogItem[], limit = 4) {
  return rankRelated({ topics, domain, difficulty }, catalog, limit);
}
