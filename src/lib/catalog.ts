import { db } from "@/db";
import { catalogPapers } from "@/db/schema";

export interface CatalogSeed {
  slug: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  domain: string;
  topics: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  mathFocus: string;
  abstract: string;
  keyEquation: string;
  equationLabel: string;
  whyRead: string;
  citations: number;
  readingMinutes: number;
  url: string;
  featured?: boolean;
}

const raw = String.raw;

export const CATALOG: CatalogSeed[] = [
  {
    slug: "attention-is-all-you-need",
    title: "Attention Is All You Need",
    authors: "Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin",
    year: 2017,
    venue: "NeurIPS",
    domain: "Deep Learning",
    topics: ["Transformers", "Attention", "Sequence Modeling", "NLP"],
    difficulty: "Intermediate",
    mathFocus: "Attention as a differentiable soft dictionary lookup",
    abstract:
      "Introduces the Transformer, an architecture built entirely from attention mechanisms. Removing recurrence makes training massively parallel while improving translation quality.",
    keyEquation: raw`\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V`,
    equationLabel: "Scaled dot-product attention",
    whyRead: "The single most cited architecture paper of the decade — every modern LLM inherits its math.",
    citations: 128000,
    readingMinutes: 45,
    url: "https://arxiv.org/abs/1706.03762",
    featured: true,
  },
  {
    slug: "deep-residual-learning",
    title: "Deep Residual Learning for Image Recognition",
    authors: "He, Zhang, Ren, Sun",
    year: 2016,
    venue: "CVPR",
    domain: "Computer Vision",
    topics: ["Residual Networks", "Optimization", "Image Classification", "Deep Learning"],
    difficulty: "Beginner",
    mathFocus: "Identity shortcuts and gradient flow through depth",
    abstract:
      "Shows that reformulating layers as residual functions F(x)+x lets networks hundreds of layers deep train reliably, winning ILSVRC 2015.",
    keyEquation: raw`y=\mathcal{F}(x,\{W_i\})+x,\qquad \frac{\partial \mathcal{L}}{\partial x}=\frac{\partial \mathcal{L}}{\partial y}\left(1+\frac{\partial \mathcal{F}}{\partial x}\right)`,
    equationLabel: "Residual block and its gradient",
    whyRead: "Best first deep-learning paper: one equation explains why depth stopped breaking.",
    citations: 210000,
    readingMinutes: 35,
    url: "https://arxiv.org/abs/1512.03385",
    featured: true,
  },
  {
    slug: "backpropagation-1986",
    title: "Learning Representations by Back-Propagating Errors",
    authors: "Rumelhart, Hinton, Williams",
    year: 1986,
    venue: "Nature",
    domain: "Machine Learning",
    topics: ["Optimization", "Neural Networks", "Calculus", "Deep Learning"],
    difficulty: "Beginner",
    mathFocus: "Chain rule as computational efficiency",
    abstract:
      "The paper that made multi-layer networks trainable: errors are propagated backwards through the chain rule, giving exact gradients in one forward/backward sweep.",
    keyEquation: raw`\frac{\partial E}{\partial w_{ij}^{(l)}}=\delta_j^{(l)}\,a_i^{(l-1)},\qquad \delta_j^{(l)}=f'\!\left(z_j^{(l)}\right)\sum_k w_{jk}^{(l+1)}\delta_k^{(l+1)}`,
    equationLabel: "Backpropagation recursion",
    whyRead: "Gradients are the engine of all learning — read the derivation once, properly.",
    citations: 42000,
    readingMinutes: 30,
    url: "https://www.nature.com/articles/323533a0",
    featured: true,
  },
  {
    slug: "adam-optimizer",
    title: "Adam: A Method for Stochastic Optimization",
    authors: "Kingma, Ba",
    year: 2015,
    venue: "ICLR",
    domain: "Machine Learning",
    topics: ["Optimization", "Gradient Descent", "Deep Learning", "Adaptive Methods"],
    difficulty: "Intermediate",
    mathFocus: "Bias-corrected exponential moving averages",
    abstract:
      "Combines momentum with per-parameter scaling from second-moment estimates, giving a robust default optimizer with two cheap running averages.",
    keyEquation: raw`\theta_t=\theta_{t-1}-\alpha\,\frac{\hat{m}_t}{\sqrt{\hat{v}_t}+\epsilon},\quad \hat{m}_t=\frac{m_t}{1-\beta_1^t},\quad \hat{v}_t=\frac{v_t}{1-\beta_2^t}`,
    equationLabel: "Adam update rule",
    whyRead: "Learn why dividing by √v works, and when Adam silently fails to generalize.",
    citations: 190000,
    readingMinutes: 40,
    url: "https://arxiv.org/abs/1412.6980",
  },
  {
    slug: "vae-2014",
    title: "Auto-Encoding Variational Bayes",
    authors: "Kingma, Welling",
    year: 2014,
    venue: "ICLR",
    domain: "Generative Models",
    topics: ["Variational Inference", "Latent Variables", "Generative Models", "Probability"],
    difficulty: "Advanced",
    mathFocus: "Evidence lower bound and the reparameterization trick",
    abstract:
      "Makes variational inference differentiable by reparameterizing the sampling step, enabling backpropagation through latent-variable models.",
    keyEquation: raw`\log p(x)\ge \mathbb{E}_{q_\phi(z\mid x)}\!\left[\log p_\theta(x\mid z)\right]-D_{\mathrm{KL}}\!\left(q_\phi(z\mid x)\,\|\,p(z)\right)`,
    equationLabel: "ELBO",
    whyRead: "The bridge between probability theory and modern diffusion/latent generative models.",
    citations: 38000,
    readingMinutes: 50,
    url: "https://arxiv.org/abs/1312.6114",
    featured: true,
  },
  {
    slug: "gan-2014",
    title: "Generative Adversarial Nets",
    authors: "Goodfellow, Pouget-Abadie, Mirza, Xu, Warde-Farley, Ozair, Courville, Bengio",
    year: 2014,
    venue: "NeurIPS",
    domain: "Generative Models",
    topics: ["Generative Models", "Game Theory", "Probability", "Optimization"],
    difficulty: "Advanced",
    mathFocus: "Minimax game and Jensen–Shannon divergence",
    abstract:
      "Two networks play a minimax game: a generator learns to fool a discriminator, implicitly matching the data distribution.",
    keyEquation: raw`\min_G\max_D\;\mathbb{E}_{x\sim p_{\mathrm{data}}}\!\left[\log D(x)\right]+\mathbb{E}_{z\sim p_z}\!\left[\log\!\left(1-D(G(z))\right)\right]`,
    equationLabel: "Adversarial objective",
    whyRead: "A clean lesson in saddle-point optimization and divergence minimization.",
    citations: 62000,
    readingMinutes: 40,
    url: "https://arxiv.org/abs/1406.2661",
  },
  {
    slug: "ddpm-2020",
    title: "Denoising Diffusion Probabilistic Models",
    authors: "Ho, Jain, Abbeel",
    year: 2020,
    venue: "NeurIPS",
    domain: "Generative Models",
    topics: ["Diffusion Models", "Generative Models", "Variational Inference", "Probability"],
    difficulty: "Advanced",
    mathFocus: "Gaussian forward process and closed-form noising",
    abstract:
      "Learns to reverse a gradual noising process, turning generation into iterative denoising and matching GAN sample quality.",
    keyEquation: raw`q(x_t\mid x_0)=\mathcal{N}\!\left(x_t;\sqrt{\bar{\alpha}_t}\,x_0,(1-\bar{\alpha}_t)I\right)`,
    equationLabel: "Closed-form forward diffusion",
    whyRead: "The math behind Stable Diffusion and every modern image generator.",
    citations: 21000,
    readingMinutes: 55,
    url: "https://arxiv.org/abs/2006.11239",
    featured: true,
  },
  {
    slug: "batchnorm-2015",
    title: "Batch Normalization: Accelerating Deep Network Training",
    authors: "Ioffe, Szegedy",
    year: 2015,
    venue: "ICML",
    domain: "Deep Learning",
    topics: ["Normalization", "Optimization", "Deep Learning", "Statistics"],
    difficulty: "Intermediate",
    mathFocus: "Standardization with learned affine parameters",
    abstract:
      "Normalizing layer inputs per mini-batch stabilizes training and permits much higher learning rates.",
    keyEquation: raw`\hat{x}=\frac{x-\mu_{\mathcal{B}}}{\sqrt{\sigma_{\mathcal{B}}^2+\epsilon}},\qquad y=\gamma\hat{x}+\beta`,
    equationLabel: "Batch normalization",
    whyRead: "Tiny equation, huge effect — and a subtle train/test discrepancy to understand.",
    citations: 58000,
    readingMinutes: 30,
    url: "https://arxiv.org/abs/1502.03167",
  },
  {
    slug: "layernorm-2016",
    title: "Layer Normalization",
    authors: "Ba, Kiros, Hinton",
    year: 2016,
    venue: "arXiv",
    domain: "Deep Learning",
    topics: ["Normalization", "Transformers", "Deep Learning", "Statistics"],
    difficulty: "Beginner",
    mathFocus: "Normalizing across features instead of batches",
    abstract:
      "Normalizes each sample independently over its feature dimension, removing batch dependence and powering Transformers.",
    keyEquation: raw`\mathrm{LN}(x)=\gamma\odot\frac{x-\mu}{\sqrt{\sigma^2+\epsilon}}+\beta,\quad \mu=\frac{1}{H}\sum_{i=1}^{H}x_i`,
    equationLabel: "Layer normalization",
    whyRead: "Short paper, and required reading for understanding Transformer internals.",
    citations: 26000,
    readingMinutes: 20,
    url: "https://arxiv.org/abs/1607.06450",
  },
  {
    slug: "dropout-2014",
    title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting",
    authors: "Srivastava, Hinton, Krizhevsky, Sutskever, Salakhutdinov",
    year: 2014,
    venue: "JMLR",
    domain: "Deep Learning",
    topics: ["Regularization", "Optimization", "Deep Learning", "Probability"],
    difficulty: "Beginner",
    mathFocus: "Model averaging over exponentially many sub-networks",
    abstract:
      "Randomly dropping units during training approximates an ensemble, sharply reducing overfitting.",
    keyEquation: raw`\mathbb{E}_{\mathcal{M}}\!\left[y\right]=\sum_{m=1}^{2^{n}}p(m)\,y_m \;\approx\; y_{\text{test}}\cdot p`,
    equationLabel: "Implicit model averaging",
    whyRead: "A rare case where a simple stochastic trick has a satisfying Bayesian story.",
    citations: 48000,
    readingMinutes: 25,
    url: "https://jmlr.org/papers/v15/srivastava14a.html",
  },
  {
    slug: "lstm-1997",
    title: "Long Short-Term Memory",
    authors: "Hochreiter, Schmidhuber",
    year: 1997,
    venue: "Neural Computation",
    domain: "Deep Learning",
    topics: ["Recurrent Networks", "Sequence Modeling", "Optimization", "Deep Learning"],
    difficulty: "Intermediate",
    mathFocus: "Constant error carousel and gated memory",
    abstract:
      "Introduces gated memory cells that preserve error signals across long sequences, solving vanishing gradients in RNNs.",
    keyEquation: raw`c_t=f_t\odot c_{t-1}+i_t\odot\tanh\!\left(W_c x_t+U_c h_{t-1}+b_c\right),\quad f_t=\sigma\!\left(W_f x_t+U_f h_{t-1}+b_f\right)`,
    equationLabel: "LSTM cell state update",
    whyRead: "The clearest example of designing an architecture around a gradient pathology.",
    citations: 70000,
    readingMinutes: 45,
    url: "https://www.bioinf.jku.at/publications/older/2604.pdf",
  },
  {
    slug: "neural-ode-2018",
    title: "Neural Ordinary Differential Equations",
    authors: "Chen, Rubanova, Bettencourt, Duvenaud",
    year: 2018,
    venue: "NeurIPS",
    domain: "Deep Learning",
    topics: ["Continuous Depth", "Numerical Methods", "Calculus", "Generative Models"],
    difficulty: "Advanced",
    mathFocus: "Continuous-depth limits and the adjoint method",
    abstract:
      "Replaces discrete layers with an ODE solver, sharing parameters across 'depth' and enabling continuous-time generative models.",
    keyEquation: raw`\frac{dh(t)}{dt}=f(h(t),t,\theta),\qquad h(T)=h(0)+\int_{0}^{T}f(h(t),t,\theta)\,dt`,
    equationLabel: "Neural ODE",
    whyRead: "Where numerical analysis meets deep learning — beautiful and practical.",
    citations: 7200,
    readingMinutes: 50,
    url: "https://arxiv.org/abs/1806.07366",
  },
  {
    slug: "svm-1995",
    title: "Support-Vector Networks",
    authors: "Cortes, Vapnik",
    year: 1995,
    venue: "Machine Learning",
    domain: "Machine Learning",
    topics: ["Kernels", "Convex Optimization", "Classification", "Statistics"],
    difficulty: "Intermediate",
    mathFocus: "Maximum-margin dual via Lagrangian duality",
    abstract:
      "Constructs the maximum-margin separating hyperplane and extends it to nonlinear boundaries with kernel functions.",
    keyEquation: raw`\min_{w,b}\tfrac{1}{2}\|w\|^2 \;\;\text{s.t.}\;\; y_i\!\left(w^{\top}\phi(x_i)+b\right)\ge 1,\qquad f(x)=\sum_i \alpha_i y_i K(x_i,x)+b`,
    equationLabel: "Soft-margin primal and kernel expansion",
    whyRead: "The canonical case study in duality, sparsity, and the kernel trick.",
    citations: 36000,
    readingMinutes: 40,
    url: "https://link.springer.com/article/10.1007/BF00994018",
  },
  {
    slug: "lasso-1996",
    title: "Regression Shrinkage and Selection via the Lasso",
    authors: "Tibshirani",
    year: 1996,
    venue: "JRSS-B",
    domain: "Statistics",
    topics: ["Regularization", "Convex Optimization", "Statistics", "Regression"],
    difficulty: "Intermediate",
    mathFocus: "L1 geometry and sparse solutions",
    abstract:
      "An L1 penalty simultaneously shrinks coefficients and performs variable selection, with a convex, efficiently solvable objective.",
    keyEquation: raw`\hat{\beta}=\arg\min_{\beta}\left\{\frac{1}{2}\|y-X\beta\|_2^2+\lambda\|\beta\|_1\right\}`,
    equationLabel: "Lasso objective",
    whyRead: "Understand why the diamond ball creates exact zeros — geometric intuition at its best.",
    citations: 45000,
    readingMinutes: 35,
    url: "https://www.jstor.org/stable/2346178",
  },
  {
    slug: "shannon-1948",
    title: "A Mathematical Theory of Communication",
    authors: "Shannon",
    year: 1948,
    venue: "Bell System Technical Journal",
    domain: "Information Theory",
    topics: ["Entropy", "Probability", "Information Theory", "Foundations of ML"],
    difficulty: "Intermediate",
    mathFocus: "Entropy, mutual information, and coding limits",
    abstract:
      "Defines information in bits, introduces entropy and channel capacity, and establishes the limits of compression and reliable transmission.",
    keyEquation: raw`H(X)=-\sum_{x\in\mathcal{X}}p(x)\log_2 p(x),\qquad C=\max_{p(x)}I(X;Y)`,
    equationLabel: "Entropy and channel capacity",
    whyRead: "Entropy appears in every loss function you use. Read the source.",
    citations: 55000,
    readingMinutes: 60,
    url: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf",
    featured: true,
  },
  {
    slug: "pagerank-1999",
    title: "The PageRank Citation Ranking",
    authors: "Brin, Page",
    year: 1999,
    venue: "Stanford Technical Report",
    domain: "Graph Learning",
    topics: ["Graph Algorithms", "Linear Algebra", "Spectral Methods", "Foundations of ML"],
    difficulty: "Beginner",
    mathFocus: "Stationary distribution and power iteration",
    abstract:
      "Ranks web pages by the stationary distribution of a random-surfer Markov chain, solved with power iteration and a damping factor.",
    keyEquation: raw`\pi = d\,P^{\top}\pi+\frac{1-d}{N}\mathbf{1},\qquad \pi^{(k+1)}=d\,P^{\top}\pi^{(k)}+\frac{1-d}{N}\mathbf{1}`,
    equationLabel: "PageRank fixed point",
    whyRead: "Eigenvectors you can compute — the cleanest introduction to spectral methods.",
    citations: 16000,
    readingMinutes: 30,
    url: "http://ilpubs.stanford.edu:8090/422/",
  },
  {
    slug: "grover-1996",
    title: "A Fast Quantum Mechanical Algorithm for Database Search",
    authors: "Grover",
    year: 1996,
    venue: "STOC",
    domain: "Quantum Computing",
    topics: ["Quantum Algorithms", "Linear Algebra", "Complexity Theory", "Amplitude Amplification"],
    difficulty: "Advanced",
    mathFocus: "Rotations in a two-dimensional amplitude subspace",
    abstract:
      "Searches an unstructured space of N items in O(√N) queries by rotating amplitude toward the marked state.",
    keyEquation: raw`G=(2|\psi\rangle\langle\psi|-I)\,O,\qquad \theta=2\arcsin\!\left(\sqrt{1/N}\right),\qquad k\approx\frac{\pi}{4\theta}`,
    equationLabel: "Grover iterate and optimal rotation count",
    whyRead: "Quantum speedup that reduces to plane geometry — genuinely fun math.",
    citations: 14000,
    readingMinutes: 45,
    url: "https://arxiv.org/abs/quant-ph/9605043",
  },
  {
    slug: "pinn-2019",
    title: "Physics-Informed Neural Networks",
    authors: "Raissi, Perdikaris, Karniadakis",
    year: 2019,
    venue: "Journal of Computational Physics",
    domain: "AI for Science",
    topics: ["Scientific Computing", "PDEs", "Automatic Differentiation", "Optimization"],
    difficulty: "Advanced",
    mathFocus: "Embedding PDE residuals in the loss",
    abstract:
      "Trains networks to satisfy differential equations by penalizing residuals computed with automatic differentiation, solving forward and inverse problems.",
    keyEquation: raw`\mathcal{L}=\underbrace{\frac{1}{N_u}\sum_i\|u(t_i,x_i)-u_i\|^2}_{\text{data}}+\underbrace{\frac{1}{N_f}\sum_j\left\|\mathcal{N}\!\left[u\right](t_j,x_j)\right\|^2}_{\text{PDE residual}}`,
    equationLabel: "Physics-informed loss",
    whyRead: "The template for scientific machine learning — where calculus earns its keep.",
    citations: 9000,
    readingMinutes: 50,
    url: "https://arxiv.org/abs/1711.10561",
    featured: true,
  },
  {
    slug: "alphafold2-2021",
    title: "Highly Accurate Protein Structure Prediction with AlphaFold",
    authors: "Jumper, Evans, Pritzel, Green, ... Hassabis",
    year: 2021,
    venue: "Nature",
    domain: "AI for Science",
    topics: ["Attention", "Structure Prediction", "Biology", "Deep Learning"],
    difficulty: "Advanced",
    mathFocus: "Attention with pair-biased geometry",
    abstract:
      "Combines sequence attention with explicit pairwise residue geometry to predict protein structures at near-experimental accuracy.",
    keyEquation: raw`A_{ij}=\mathrm{softmax}\!\left(\frac{q_i^{\top}k_j}{\sqrt{c}}+b_{ij}\right),\qquad \text{pair}_{ij}\leftarrow \text{pair}_{ij}+\phi\!\left(A_{ij}\right)`,
    equationLabel: "Pair-biased attention",
    whyRead: "A masterpiece of architecture engineering with a strong geometric core.",
    citations: 25000,
    readingMinutes: 70,
    url: "https://www.nature.com/articles/s41586-021-03819-2",
  },
];

export interface CatalogItem extends CatalogSeed {
  id: number;
  featured: boolean;
}

let seedPromise: Promise<void> | null = null;

export async function ensureCatalog(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      await db
        .insert(catalogPapers)
        .values(
          CATALOG.map((item) => ({
            slug: item.slug,
            title: item.title,
            authors: item.authors,
            year: item.year,
            venue: item.venue,
            domain: item.domain,
            topics: item.topics.join(", "),
            difficulty: item.difficulty,
            mathFocus: item.mathFocus,
            abstract: item.abstract,
            keyEquation: item.keyEquation,
            equationLabel: item.equationLabel,
            whyRead: item.whyRead,
            citations: item.citations,
            readingMinutes: item.readingMinutes,
            url: item.url,
            featured: item.featured ?? false,
          })),
        )
        .onConflictDoNothing({ target: catalogPapers.slug });
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

export function toCatalogItem(row: typeof catalogPapers.$inferSelect): CatalogItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    authors: row.authors,
    year: row.year,
    venue: row.venue ?? "",
    domain: row.domain,
    topics: row.topics.split(",").map((t) => t.trim()).filter(Boolean),
    difficulty: (row.difficulty as CatalogSeed["difficulty"]) ?? "Intermediate",
    mathFocus: row.mathFocus,
    abstract: row.abstract,
    keyEquation: row.keyEquation,
    equationLabel: row.equationLabel,
    whyRead: row.whyRead,
    citations: row.citations,
    readingMinutes: row.readingMinutes,
    url: row.url ?? "#",
    featured: row.featured,
  };
}

const topicAliases: Record<string, string[]> = {
  transformers: ["transformers", "attention", "sequence modeling"],
  "deep learning": ["deep learning", "neural networks", "optimization"],
  "computer vision": ["computer vision", "image classification", "deep learning"],
  "generative models": ["generative models", "probability", "variational inference", "diffusion models"],
  "medical and health informatics": ["statistics", "classification", "regularization"],
  "climate science and environmental modeling": ["scientific computing", "pdes", "statistics"],
  "quantum computing": ["quantum algorithms", "linear algebra", "complexity theory"],
  "robotics and autonomous systems": ["optimization", "graph algorithms", "continuous depth"],
  "natural language processing and deep learning": ["transformers", "attention", "nlp", "sequence modeling"],
  "machine learning": ["optimization", "regularization", "statistics", "gradient descent"],
};

export interface RelationInput {
  topics: string[];
  domain?: string | null;
  difficulty?: string | null;
}

export function rankRelated(input: RelationInput, pool: CatalogItem[], limit = 4): { item: CatalogItem; score: number; reason: string }[] {
  const explicit = new Set(input.topics.map((t) => t.toLowerCase()));
  const aliases = new Set((topicAliases[(input.domain ?? "").toLowerCase()] ?? []).map((t) => t.toLowerCase()));
  const difficultyOrder = ["Beginner", "Intermediate", "Advanced"];
  const targetDifficulty = difficultyOrder.indexOf(input.difficulty ?? "Intermediate");

  return pool
    .map((item) => {
      const itemTopics = item.topics.map((t) => t.toLowerCase());
      const exact = itemTopics.filter((t) => explicit.has(t));
      const aliasHits = itemTopics.filter((t) => aliases.has(t) && !explicit.has(t));
      const overlap = exact.length + aliasHits.length * 0.5;
      const union = new Set([...itemTopics, ...explicit, ...aliases]).size;
      const jaccard = overlap / Math.max(1, union);
      const domainBonus = input.domain && item.domain.toLowerCase() === input.domain.toLowerCase() ? 0.4 : 0;
      const difficultyGap = Math.abs(difficultyOrder.indexOf(item.difficulty) - Math.max(0, targetDifficulty));
      const difficultyBonus = difficultyGap === 0 ? 0.15 : difficultyGap === 1 ? 0.08 : 0;
      const citationBonus = Math.min(item.citations / 1_000_000, 0.08);
      const score = jaccard * 3.2 + domainBonus + difficultyBonus + citationBonus;
      const reason =
        exact.length > 0
          ? `Shares ${exact.slice(0, 2).join(" + ")}`
          : aliasHits.length > 0
            ? `Related ${aliasHits.slice(0, 2).join(" + ")}`
            : domainBonus > 0
              ? `Same field: ${item.domain}`
              : `Good next step for ${item.domain.toLowerCase()}`;
      return { item, score, reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const LEARNING_PATHS: {
  slug: string;
  title: string;
  description: string;
  accent: string;
  steps: string[];
}[] = [
  {
    slug: "math-foundations",
    title: "Mathematical Foundations",
    description: "The six papers that give you the language: information, linear algebra, gradients, optimization, duality, sparsity.",
    accent: "amber",
    steps: ["shannon-1948", "pagerank-1999", "backpropagation-1986", "lasso-1996", "svm-1995", "adam-optimizer"],
  },
  {
    slug: "deep-learning-core",
    title: "Deep Learning Core",
    description: "From the chain rule to Transformers, in the order the ideas actually build on each other.",
    accent: "emerald",
    steps: ["backpropagation-1986", "dropout-2014", "batchnorm-2015", "deep-residual-learning", "attention-is-all-you-need", "layernorm-2016"],
  },
  {
    slug: "generative-models",
    title: "Generative Models",
    description: "Latent variables, adversarial games, and diffusion — the probabilistic toolkit behind modern generation.",
    accent: "violet",
    steps: ["vae-2014", "gan-2014", "neural-ode-2018", "ddpm-2020"],
  },
  {
    slug: "ai-for-science",
    title: "AI for Science",
    description: "Where machine learning meets differential equations, quantum mechanics, and structural biology.",
    accent: "sky",
    steps: ["pinn-2019", "alphafold2-2021", "grover-1996"],
  },
];
