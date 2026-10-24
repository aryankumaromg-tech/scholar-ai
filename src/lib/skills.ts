/**
 * Curated index of the AI Research Skills Library maintained by Orchestra Research:
 * https://github.com/Orchestra-Research/AI-research-SKILLs (MIT).
 *
 * Category directories and skill folder names are taken from the repository index;
 * `note` is the repository's own one-line description where available.
 */

export const SKILLS_REPO = "https://github.com/Orchestra-Research/AI-research-SKILLs";
export const SKILLS_REPO_RAW = `${SKILLS_REPO}/blob/main`;
export const SKILLS_NPM = "@orchestra-research/ai-research-skills";
export const SKILLS_WELCOME = "https://www.orchestra-research.com/ai-research-skills/welcome.md";

export interface Skill {
  name: string;
  /** Skill folder inside the category directory, when known from the repo index. */
  folder?: string;
  note?: string;
}

export interface SkillCategory {
  name: string;
  /** Category directory in the repository. */
  dir: string;
  skills: Skill[];
}

const link = (dir: string, folder?: string) => `${SKILLS_REPO_RAW}/${dir}${folder ? `/${folder}` : ""}`;

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Autoresearch",
    dir: "0-autoresearch-skill",
    skills: [
      {
        name: "Autoresearch",
        folder: undefined,
        note: "Autonomous research orchestration using a two-loop architecture (inner optimization + outer synthesis) — manages the full lifecycle from literature survey to paper writing and routes to every domain skill.",
      },
    ],
  },
  {
    name: "Ideation",
    dir: "21-research-ideation",
    skills: [
      { name: "Research Brainstorming", note: "Structured idea generation for literature gaps and experiment hypotheses." },
      { name: "Creative Thinking", note: "Divergent thinking techniques applied to research problem discovery." },
    ],
  },
  {
    name: "ML Paper Writing",
    dir: "20-ml-paper-writing",
    skills: [
      { name: "ML Paper Writing", note: "Publication-ready papers for NeurIPS, ICML, ICLR, ACL, AAAI, COLM — LaTeX templates plus a citation-verification workflow." },
      { name: "Academic Plotting", note: "Figures and charts formatted to publication standards." },
    ],
  },
  {
    name: "Model Architecture",
    dir: "01-model-architecture",
    skills: [
      { name: "LitGPT", folder: "litgpt", note: "Lightning AI's 20+ clean LLM implementations with production training recipes." },
      { name: "Mamba", folder: "mamba", note: "State-space models with O(n) complexity, 5× faster than Transformers." },
      { name: "NanoGPT", folder: "nanogpt", note: "Educational GPT in ~300 lines by Karpathy." },
      { name: "RWKV", folder: "rwkv", note: "RNN+Transformer hybrid with infinite context; a Linux Foundation project." },
      { name: "TorchTitan", folder: "torchtitan", note: "PyTorch-native distributed training for Llama 3.1 with 4D parallelism." },
    ],
  },
  {
    name: "Fine-Tuning",
    dir: "03-fine-tuning",
    skills: [
      { name: "Axolotl", folder: "axolotl", note: "YAML-based fine-tuning supporting 100+ models." },
      { name: "LLaMA-Factory", folder: "llama-factory", note: "WebUI no-code fine-tuning." },
      { name: "PEFT", folder: "peft", note: "Parameter-efficient fine-tuning: LoRA, QLoRA, DoRA and 25+ methods." },
      { name: "Unsloth", folder: "unsloth", note: "2× faster QLoRA fine-tuning." },
    ],
  },
  {
    name: "Post-Training",
    dir: "06-post-training",
    skills: [
      { name: "TRL Fine-Tuning", folder: "trl-fine-tuning", note: "Transformer Reinforcement Learning pipelines." },
      { name: "GRPO-RL-Training", folder: "grpo-rl-training", note: "Group Relative Policy Optimization with TRL — the repository's gold-standard skill." },
      { name: "OpenRLHF", folder: "openrlhf", note: "Full RLHF pipeline with Ray + vLLM." },
      { name: "SimPO", folder: "simpo", note: "Simple Preference Optimization — no reference model needed." },
      { name: "verl", folder: "verl", note: "ByteDance's HybridFlow RL framework with FSDP/Megatron + vLLM/SGLang backends." },
      { name: "slime", folder: "slime", note: "THUDM's Megatron+SGLang framework powering GLM-4.x models." },
      { name: "miles", folder: "miles", note: "Enterprise fork of slime with FP8, INT4 and speculative RL for MoE training." },
      { name: "torchforge", folder: "torchforge", note: "Meta's PyTorch-native RL with Monarch + TorchTitan + vLLM." },
    ],
  },
  {
    name: "Mechanistic Interpretability",
    dir: "04-mechanistic-interpretability",
    skills: [
      { name: "TransformerLens", folder: "transformer-lens", note: "Neel Nanda's library with HookPoints and activation caching for circuit analysis." },
      { name: "SAELens", folder: "saelens", note: "Sparse Autoencoder training and analysis for feature discovery." },
      { name: "pyvene", folder: "pyvene", note: "Stanford's causal intervention library with declarative configs." },
      { name: "nnsight", folder: "nnsight", note: "Remote interpretability via NDIF — experiments on 70B+ models without local GPUs." },
    ],
  },
  {
    name: "Data Processing",
    dir: "05-data-processing",
    skills: [
      { name: "Ray Data", folder: "ray-data", note: "Distributed ML data processing with streaming execution and GPU support." },
      { name: "NeMo Curator", folder: "nemo-curator", note: "GPU-accelerated data curation, 16× faster deduplication." },
    ],
  },
  {
    name: "Distributed Training",
    dir: "08-distributed-training",
    skills: [
      { name: "Megatron-Core", folder: "megatron-core", note: "NVIDIA's framework for 2B–462B parameter models at 47% MFU on H100." },
      { name: "DeepSpeed", folder: "deepspeed", note: "Microsoft's ZeRO optimization." },
      { name: "PyTorch FSDP2", folder: "pytorch-fsdp2", note: "Fully Sharded Data Parallel v2 with fully_shard and DTensor." },
      { name: "Accelerate", folder: "accelerate", note: "HuggingFace's 4-line distributed training API." },
      { name: "PyTorch Lightning", folder: "pytorch-lightning", note: "High-level training framework built around the Trainer class." },
      { name: "Ray Train", folder: "ray-train", note: "Multi-node orchestration and hyperparameter tuning." },
    ],
  },
  {
    name: "Optimization",
    dir: "10-optimization",
    skills: [
      { name: "Flash Attention", folder: "flash-attention", note: "2–4× faster attention with memory efficiency." },
      { name: "bitsandbytes", folder: "bitsandbytes", note: "8-bit/4-bit quantization for 50–75% memory reduction." },
      { name: "GPTQ", folder: "gptq", note: "4-bit post-training quantization: 4× memory reduction, <2% accuracy loss." },
      { name: "AWQ", folder: "awq", note: "Activation-aware weight quantization, 4-bit with minimal accuracy loss." },
      { name: "HQQ", folder: "hqq", note: "Half-Quadratic Quantization — no calibration data needed, multi-backend." },
      { name: "GGUF", note: "llama.cpp quantization format with K-quant methods for CPU/Metal inference." },
    ],
  },
  {
    name: "Inference",
    dir: "12-inference-serving",
    skills: [
      { name: "vLLM", note: "PagedAttention and continuous batching for high-throughput serving." },
      { name: "TensorRT-LLM", note: "NVIDIA's optimized LLM inference runtime." },
      { name: "llama.cpp", note: "CPU-friendly LLM inference and quantized deployments." },
      { name: "SGLang", note: "Fast serving engine with RadixAttention for structured generation." },
    ],
  },
  {
    name: "Evaluation",
    dir: "11-evaluation",
    skills: [
      { name: "lm-eval-harness", note: "The community standard harness for LLM benchmarking." },
      { name: "BigCode", note: "Code model evaluation and generation benchmarks." },
      { name: "NeMo Evaluator", note: "NVIDIA's evaluation platform: 100+ benchmarks from 18+ harnesses, container-first for reproducibility." },
    ],
  },
  {
    name: "Safety & Alignment",
    dir: "07-safety-alignment",
    skills: [
      { name: "Constitutional AI", folder: "constitutional-ai", note: "AI-driven self-improvement guided by explicit principles." },
      { name: "LlamaGuard", folder: "llamaguard", note: "Safety classifier for LLM inputs and outputs." },
      { name: "NeMo Guardrails", folder: "nemo-guardrails", note: "Programmable guardrails with Colang." },
      { name: "Prompt Guard", folder: "prompt-guard", note: "Meta's 86M prompt injection and jailbreak detector — 99%+ TPR, <2ms GPU latency." },
    ],
  },
  {
    name: "Infrastructure",
    dir: "09-infrastructure",
    skills: [
      { name: "Modal", note: "Serverless GPU cloud with a Python-native API, T4–H200 on demand." },
      { name: "Lambda Labs", note: "Reserved/on-demand GPU cloud with H100/A100, persistent filesystems and 1-Click Clusters." },
      { name: "SkyPilot", note: "Multi-cloud orchestration across 20+ providers with spot recovery." },
    ],
  },
  {
    name: "Tokenization",
    dir: "02-tokenization",
    skills: [
      { name: "HuggingFace Tokenizers", folder: "huggingface-tokenizers", note: "Rust-based, <20s/GB, BPE/WordPiece/Unigram algorithms." },
      { name: "SentencePiece", folder: "sentencepiece", note: "Language-independent tokenizer at 50k sentences/sec; used by T5/ALBERT." },
    ],
  },
  {
    name: "Agents",
    dir: "14-agents",
    skills: [
      { name: "LangChain", note: "Composable chains and agent tooling." },
      { name: "LlamaIndex", note: "Data framework for LLMs with retrieval abstractions." },
      { name: "CrewAI", note: "Multi-agent orchestration with role-based collaboration." },
      { name: "AutoGPT", note: "Autonomous agent platform with a visual workflow builder." },
    ],
  },
  {
    name: "RAG",
    dir: "15-rag",
    skills: [
      { name: "Chroma", note: "Embedding database with a developer-friendly API." },
      { name: "FAISS", note: "Facebook's similarity search library for large vector collections." },
      { name: "Pinecone", note: "Managed vector database for production retrieval." },
      { name: "Qdrant", note: "High-performance Rust vector search with hybrid filtering." },
      { name: "Sentence Transformers", note: "Transformer embeddings tuned for semantic similarity." },
    ],
  },
  {
    name: "Prompt Engineering",
    dir: "16-prompt-engineering",
    skills: [
      { name: "DSPy", note: "Declarative programming for language models." },
      { name: "Instructor", note: "Structured, schema-validated outputs from LLMs." },
      { name: "Guidance", note: "Constrained generation over templates." },
      { name: "Outlines", note: "FSM-based constrained generation." },
    ],
  },
  {
    name: "MLOps",
    dir: "13-mlops",
    skills: [
      { name: "Weights & Biases", note: "Experiment tracking, sweeps, model registry and profiling." },
      { name: "MLflow", note: "Open-source experiment tracking and model lifecycle management." },
      { name: "TensorBoard", note: "TensorFlow/PyTorch training visualization." },
    ],
  },
  {
    name: "Observability",
    dir: "17-observability",
    skills: [
      { name: "LangSmith", note: "Tracing, evaluation and debugging for LLM applications." },
      { name: "Phoenix", note: "Open-source AI observability with OpenTelemetry tracing and LLM evaluation." },
    ],
  },
  {
    name: "Multimodal",
    dir: "18-multimodal",
    skills: [
      { name: "CLIP", note: "Contrastive vision-language pretraining." },
      { name: "Whisper", note: "OpenAI's speech recognition and transcription model." },
      { name: "LLaVA", note: "Large language-and-vision assistant." },
      { name: "BLIP-2", note: "Vision-language pretraining with Q-Former: captioning, VQA." },
      { name: "SAM", note: "Meta's Segment Anything for zero-shot image segmentation." },
      { name: "Stable Diffusion", note: "Text-to-image generation via Diffusers: SDXL, ControlNet, LoRA." },
      { name: "AudioCraft", note: "Meta's MusicGen/AudioGen for text-to-music and text-to-sound." },
    ],
  },
  {
    name: "Emerging Techniques",
    dir: "19-emerging-techniques",
    skills: [
      { name: "MoE", note: "Mixture-of-Experts architectures." },
      { name: "Model Merging", note: "Combining checkpoints without retraining." },
      { name: "Long Context", note: "Techniques for extending context windows." },
      { name: "Speculative Decoding", note: "Draft-then-verify decoding for faster inference." },
      { name: "Distillation", note: "Transferring capability from large to small models." },
      { name: "Pruning", note: "Removing redundant weights and structure for efficiency." },
    ],
  },
  {
    name: "Agent-Native Research Artifact",
    dir: "22-agent-native-research-artifact",
    skills: [
      { name: "ARA Compiler", folder: "compiler", note: "Compiles papers, repos, experiment logs or notes into a structured, falsifiable research artifact with an exploration graph." },
      { name: "ARA Research Manager", folder: "research-manager", note: "Post-task epilogue writing decisions, experiments, dead ends and claims with provenance tags." },
      { name: "ARA Rigor Reviewer", folder: "rigor-reviewer", note: "Semantic epistemic review scoring six dimensions of research rigor, with a severity-ranked report." },
    ],
  },
];

export function skillUrl(category: SkillCategory, skill: Skill): string {
  return link(category.dir, skill.folder);
}

export function categoryUrl(category: SkillCategory): string {
  return link(category.dir);
}

export const SUPPORTED_AGENTS = [
  "Claude Code",
  "Hermes Agent",
  "OpenCode",
  "OpenClaw",
  "Qoder",
  "Cursor",
  "Codex",
  "Gemini CLI",
  "Qwen Code",
];

export const SKILL_STATS = {
  skills: 98,
  categories: 23,
  license: "MIT",
};
