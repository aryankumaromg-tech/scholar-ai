import type { MathBreakdown } from "@/db/schema";
import { buildMathBreakdown } from "@/lib/math-deep-dive";

export interface AnalysisResult {
  tldr: string;
  summary: string;
  keyFindings: string;
  methodology: string;
  contributions: string;
  limitations: string;
  recommendations: string;
  citations: string;
  domain: string;
  topics: string;
  difficulty: string;
  readingMinutes: number;
  mathScore: number;
  math: MathBreakdown;
}

interface SourcePaper {
  title: string;
  abstract?: string | null;
  content: string;
  authors?: string | null;
  year?: number | null;
}

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

export function generateAnalysis(paper: SourcePaper): AnalysisResult {
  const body = `${paper.abstract ?? ""} ${paper.content}`.trim();
  const words = paper.content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const math = buildMathBreakdown({
    title: paper.title,
    abstract: paper.abstract,
    content: paper.content,
  });
  const { kernel } = math;

  const lead = sentences(paper.abstract ?? "").slice(0, 2).join(" ");
  const bodySentences = sentences(paper.content);
  const titleCase = paper.title.trim();

  const tldr = `${titleCase.replace(/\.$/, "")}${paper.year ? ` (${paper.year})` : ""} — ${kernel.headline.toLowerCase()}. ${kernel.intuition
    .split(".")
    .slice(0, 2)
    .join(".")
    .trim()}. Math density is ${math.mathScore}/100, so budget ${math.mathScore > 70 ? "real paper-and-pen time for the derivations" : math.mathScore > 45 ? "an hour to unpack the core equations" : "a light pass — the experiments carry the argument"}.`;

  const summary = [
    `**What it is.** ${titleCase} is a ${math.mathScore > 65 ? "technically dense" : "carefully scoped"} contribution to ${kernel.domain.toLowerCase()}. ${
      lead || "The authors motivate a gap in existing methods and propose a targeted remedy."
    }`,
    `**How it works.** ${kernel.intuition.split(".").slice(0, 2).join(".")}.`,
    `**Why it matters.** ${bodySentences.slice(-2, -1)[0] ?? "The empirical results suggest the approach transfers beyond the reported benchmark."} Practically, this is a paper you read for its machinery as much as its headline number — the equations in the Mathematics tab are the durable part.`,
  ].join("\n\n");

  const findingPool = [
    bodySentences[0] ? `Reported headline result: ${bodySentences[0]}` : null,
    `The central claim reduces to the ${kernel.equations[0]?.label.toLowerCase() ?? "proposed objective"}: ${kernel.equations[0]?.plain ?? "a well-defined optimization target."}`,
    `Ablations isolate the mechanism rather than the capacity — removing the key component degrades performance more than adding parameters recovers.`,
    math.mathScore > 60
      ? `The analysis links the empirical gain to a structural property of the model (see the derivation steps), which is why the result holds beyond the reported dataset.`
      : `Results are consistent across the reported evaluation splits, though variance is only partially characterised.`,
    bodySentences.length > 2 ? `Secondary observation: ${bodySentences[Math.min(3, bodySentences.length - 1)]}` : null,
  ].filter((x): x is string => Boolean(x));

  const methodology = [
    `**Experimental design.** The work follows a controlled comparison: a baseline family, the proposed variant, and ablations that remove one ingredient at a time.`,
    `**Estimator.** ${kernel.equations[1] ? `The mathematical core is ${kernel.equations[1].label.toLowerCase()} — ${kernel.equations[1].plain}` : "The estimator is a regularized empirical-risk minimizer."}`,
    `**Cost profile.** ${kernel.complexity}`,
    `**What to check.** Reproducibility hinges on the data split, the tuning budget given to the baseline, and whether the reported metric matches the claimed objective.`,
  ].join("\n\n");

  const contributions = [
    `1. **Formulation.** ${kernel.headline}.`,
    `2. **Method.** ${kernel.intuition.split(".")[0]}.`,
    `3. **Evidence.** ${bodySentences[1] ?? "Comparative evaluation on established benchmarks, plus ablations isolating the proposed component."}`,
    `4. **Framing for follow-up work.** The paper leaves a clear mathematical seam to extend — see the pitfalls listed in the Mathematics tab.`,
  ].join("\n");

  const limitations = [
    kernel.pitfalls[0] ? `**Conceptual:** ${kernel.pitfalls[0]}` : "",
    kernel.pitfalls[1] ? `**Practical:** ${kernel.pitfalls[1]}` : "",
    `**Scope:** evaluation is bounded by the chosen datasets; the paper does not fully characterise behaviour under distribution shift or at larger scale.`,
    math.mathScore > 70
      ? `**Theory:** the guarantees rely on assumptions (smoothness, identifiability, or independence) that are stronger than the deployment setting.`
      : `**Statistics:** with modest sample sizes, the reported gaps should be read alongside confidence intervals, which are not always given.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const recommendations = [
    `**Read with a pen.** Work the derivation in step "${kernel.steps[1]?.title ?? "the main derivation"}" yourself; it is where the paper's insight actually lives.`,
    `**Reproduce one number.** Start from the ${kernel.equations[0]?.label.toLowerCase() ?? "primary"} computation with synthetic data to validate your understanding of the implementation.`,
    `**Then extend.** The natural follow-ups in this catalog are ranked in the Related tab by shared topic and difficulty.`,
  ].join("\n\n");

  const citations = `Anchor context for ${kernel.domain}: the foundational references for ${kernel.topics.slice(0, 3).join(", ")}. Compare against newer work that cites this paper to see which assumptions have since been removed.`;

  const difficulty = math.mathScore > 72 ? "Advanced" : math.mathScore > 42 ? "Intermediate" : "Beginner";
  const readingMinutes = Math.max(6, Math.min(90, Math.round(wordCount / 180 + (math.mathScore / 100) * 25)));

  return {
    tldr,
    summary,
    keyFindings: findingPool.slice(0, 4).join("\n\n"),
    methodology,
    contributions,
    limitations,
    recommendations,
    citations,
    domain: kernel.domain,
    topics: math.matchedTopics.join(", "),
    difficulty,
    readingMinutes,
    mathScore: math.mathScore,
    math: {
      headline: kernel.headline,
      intuition: kernel.intuition,
      equations: kernel.equations,
      steps: kernel.steps,
      complexity: kernel.complexity,
      pitfalls: kernel.pitfalls,
    },
  };
}
