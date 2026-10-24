import type { MathBreakdown, MathEquation, MathStep } from "@/db/schema";

const raw = String.raw;

interface Kernel extends MathBreakdown {
  id: string;
  test: RegExp;
  topics: string[];
  domain: string;
}

const SOFTMAX: MathEquation = {
  latex: raw`\mathrm{softmax}(z)_i=\frac{e^{z_i}}{\sum_{j=1}^{n}e^{z_j}}`,
  label: "Softmax normalizer",
  plain: "Turns a vector of arbitrary scores into a probability distribution; the exponential makes differences in score explode into differences in weight.",
  symbols: [
    { symbol: "z_i", meaning: "score (logit) for item i" },
    { symbol: "n", meaning: "number of items being compared" },
  ],
};

const GRADIENT_STEP: MathEquation = {
  latex: raw`\theta_{t+1}=\theta_{t}-\eta\,\nabla_{\theta}\mathcal{L}(\theta_t;\mathcal{D})`,
  label: "Gradient descent update",
  plain: "Move every parameter a small step against the gradient of the loss. The step size η controls how far you trust the local slope.",
  symbols: [
    { symbol: "\\theta", meaning: "the full parameter vector" },
    { symbol: "\\eta", meaning: "learning rate, the step size" },
    { symbol: "\\nabla_\\theta\\mathcal{L}", meaning: "gradient of the loss with respect to parameters" },
  ],
};

const KERNELS: Kernel[] = [
  {
    id: "attention",
    test: /attention|transformer|self-attention|query.{0,20}key|softmax|multi-head/i,
    domain: "Deep Learning",
    topics: ["Transformers", "Attention", "Optimization"],
    headline: "Attention is a soft, differentiable dictionary lookup",
    intuition:
      "Each token asks a question (query), every token advertises what it contains (key), and the answer returned is a weighted average of contents (values). The softmax turns similarity scores into mixing weights, and the 1/√dₖ factor keeps those weights from saturating when the dimension is large.",
    equations: [
      {
        latex: raw`\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V`,
        label: "Scaled dot-product attention",
        plain: "Similarity between queries and keys chooses how much of each value to blend into the output.",
        symbols: [
          { symbol: "Q\\in\\mathbb{R}^{n\\times d_k}", meaning: "query matrix, one row per token" },
          { symbol: "K\\in\\mathbb{R}^{m\\times d_k}", meaning: "key matrix of the context" },
          { symbol: "V\\in\\mathbb{R}^{m\\times d_v}", meaning: "value matrix that is averaged" },
          { symbol: "\\sqrt{d_k}", meaning: "temperature that prevents huge dot products" },
        ],
      },
      SOFTMAX,
      {
        latex: raw`\mathrm{MultiHead}(Q,K,V)=\mathrm{Concat}(\mathrm{head}_1,\dots,\mathrm{head}_h)W^{O}`,
        label: "Multi-head concatenation",
        plain: "Run h independent attention problems in parallel, then project the concatenated results back to model width.",
        symbols: [
          { symbol: "h", meaning: "number of parallel heads" },
          { symbol: "W^{O}", meaning: "output projection matrix" },
        ],
      },
    ],
    steps: [
      {
        title: "Score every query against every key",
        latex: raw`S=QK^{\top}\in\mathbb{R}^{n\times m}`,
        explanation: "One matrix multiply produces all n·m similarity scores at once — this is why attention parallelizes so well on GPUs.",
      },
      {
        title: "Rescale to control variance",
        latex: raw`\mathrm{Var}\!\left(q\cdot k\right)=\sum_{i=1}^{d_k}\mathrm{Var}(q_i k_i)\approx d_k`,
        explanation: "If q and k have roughly unit variance, their dot product has variance dₖ. Dividing by √dₖ restores unit variance, keeping softmax in a regime with useful gradients instead of near-one-hot saturation.",
      },
      {
        title: "Normalize into mixing weights",
        latex: raw`\alpha_{ij}=\frac{\exp(s_{ij})}{\sum_{j'}\exp(s_{ij'})},\qquad \sum_j \alpha_{ij}=1`,
        explanation: "Rows of the attention matrix become distributions over the context, so the output is a convex combination of value vectors.",
      },
      {
        title: "Mix the values",
        latex: raw`o_i=\sum_j \alpha_{ij} v_j, \qquad \frac{\partial o_i}{\partial v_j}=\alpha_{ij}`,
        explanation: "The gradient with respect to a value vector is literally its attention weight — a clean, interpretable credit assignment.",
      },
    ],
    complexity:
      "Score matrix construction is O(n²·dₖ) time and O(n²) memory in sequence length, which is why long-context methods fall into sparse, linear, or recurrent approximations. Projections add O(n·d²).",
    pitfalls: [
      "Confusing attention weights with explanation: high α does not always mean causal importance.",
      "Forgetting the causal mask — without it the model can read the future and report fake accuracy.",
    ],
  },
  {
    id: "diffusion",
    test: /diffusion|denois|noise schedule|forward process|ddpm|score matching/i,
    domain: "Generative Models",
    topics: ["Diffusion Models", "Generative Models", "Probability"],
    headline: "Generation is the reverse of a controlled noising process",
    intuition:
      "Add a little Gaussian noise many times and the data becomes pure noise. Learn to undo one tiny step, compose those steps, and you can start from noise and walk back to a sample. The math is mostly Gaussian algebra: sums of independent normals stay normal.",
    equations: [
      {
        latex: raw`q(x_t\mid x_{t-1})=\mathcal{N}\!\left(x_t;\sqrt{1-\beta_t}\,x_{t-1},\beta_t I\right)`,
        label: "One forward noising step",
        plain: "Shrink the signal slightly and add variance βₜ of noise, so overall variance stays roughly constant.",
        symbols: [
          { symbol: "\\beta_t", meaning: "noise schedule for step t" },
          { symbol: "\\sqrt{1-\\beta_t}", meaning: "signal retention factor" },
        ],
      },
      {
        latex: raw`q(x_t\mid x_0)=\mathcal{N}\!\left(x_t;\sqrt{\bar{\alpha}_t}\,x_0,(1-\bar{\alpha}_t)I\right),\quad \bar{\alpha}_t=\prod_{s=1}^{t}\alpha_s`,
        label: "Closed-form jump to step t",
        plain: "Composing Gaussian steps means you can sample any noise level directly — no loop needed during training.",
        symbols: [
          { symbol: "\\alpha_t=1-\\beta_t", meaning: "per-step retention" },
          { symbol: "\\bar{\\alpha}_t", meaning: "cumulative retention (signal-to-noise schedule)" },
        ],
      },
      {
        latex: raw`\mathcal{L}_{\text{simple}}=\mathbb{E}_{t,x_0,\epsilon}\!\left[\left\|\epsilon-\epsilon_\theta\!\left(\sqrt{\bar{\alpha}_t}x_0+\sqrt{1-\bar{\alpha}_t}\,\epsilon,\,t\right)\right\|_2^2\right]`,
        label: "Simplified denoising objective",
        plain: "Train a network to guess which noise was added; predicting noise is an algebraically reweighted prediction of the mean.",
        symbols: [
          { symbol: "\\epsilon", meaning: "the sampled standard normal noise" },
          { symbol: "\\epsilon_\\theta", meaning: "the denoiser network" },
        ],
      },
    ],
    steps: [
      {
        title: "Derive the jump distribution by induction",
        latex: raw`x_t=\sqrt{\alpha_t}\,x_{t-1}+\sqrt{1-\alpha_t}\,\epsilon_t \;\Longrightarrow\; x_t=\sqrt{\bar{\alpha}_t}\,x_0+\sqrt{1-\bar{\alpha}_t}\,\bar{\epsilon}`,
        explanation: "Independent normals add in variance, so all intermediate steps collapse into one closed-form sample.",
      },
      {
        title: "Bound the log-likelihood",
        latex: raw`-\log p_\theta(x_0)\le \mathbb{E}_q\!\left[-\log p(x_T)-\sum_t \log\frac{p_\theta(x_{t-1}\mid x_t)}{q(x_t\mid x_{t-1})}\right]`,
        explanation: "Jensen's inequality gives a variational bound; when the forwards and reverse conditionals are Gaussian, the KL terms are closed-form.",
      },
      {
        title: "Reduce KL terms to denoising",
        latex: raw`D_{\mathrm{KL}}\!\left(q(x_{t-1}\mid x_t,x_0)\,\|\,p_\theta(x_{t-1}\mid x_t)\right)\;\propto\;\left\|\epsilon-\epsilon_\theta(x_t,t)\right\|^2`,
        explanation: "The posterior mean is a linear function of the noise, so matching means is equivalent to matching noise — hence the simple loss.",
      },
      {
        title: "Classify-free guidance in one line",
        latex: raw`\hat{\epsilon}=\epsilon_\theta(x_t,\varnothing)+s\left(\epsilon_\theta(x_t,c)-\epsilon_\theta(x_t,\varnothing)\right)`,
        explanation: "Extrapolate away from the unconditional prediction to sharpen conditioning; s controls the fidelity/diversity trade-off.",
      },
    ],
    complexity:
      "Sampling is O(T·C) for T denoising steps of network cost C; training is a single step per sample (O(C)) because the jump distribution is closed form. Fast samplers trade steps for quality.",
    pitfalls: [
      "Confusing x_t variance conventions between papers — some use σ²=1-ᾱ, others rescale.",
      "Treating the simple loss as exact likelihood; it is a reweighted variational bound.",
    ],
  },
  {
    id: "variational",
    test: /variational|elbo|latent variable|autoencoder|posterior|kl divergence/i,
    domain: "Generative Models",
    topics: ["Variational Inference", "Latent Variables", "Probability"],
    headline: "Optimize a tractable lower bound instead of an intractable integral",
    intuition:
      "The likelihood p(x) requires integrating over all hidden explanations z. Instead, guess a distribution q(z|x) and measure two things: how well it explains the data, and how far it drifts from the prior. That trade-off is the ELBO.",
    equations: [
      {
        latex: raw`\log p_\theta(x)=\underbrace{\mathbb{E}_{q_\phi(z\mid x)}\!\left[\log\frac{p_\theta(x,z)}{q_\phi(z\mid x)}\right]}_{\text{ELBO }\mathcal{L}}+D_{\mathrm{KL}}\!\left(q_\phi(z\mid x)\,\|\,p_\theta(z\mid x)\right)`,
        label: "ELBO decomposition",
        plain: "The log-evidence equals a bound plus a non-negative gap, so maximizing the bound pushes the true likelihood up.",
        symbols: [
          { symbol: "q_\\phi(z\\mid x)", meaning: "encoder approximation to the posterior" },
          { symbol: "\\theta", meaning: "generator/decoder parameters" },
          { symbol: "D_{\\mathrm{KL}}", meaning: "asymmetric divergence between distributions" },
        ],
      },
      {
        latex: raw`\mathcal{L}=\mathbb{E}_{q_\phi}\!\left[\log p_\theta(x\mid z)\right]-D_{\mathrm{KL}}\!\left(q_\phi(z\mid x)\,\|\,p(z)\right)`,
        label: "Reconstruction minus regularizer",
        plain: "The first term rewards good reconstructions; the second keeps the latent code near the prior so you can sample from it.",
        symbols: [
          { symbol: "p_\\theta(x\\mid z)", meaning: "decoder likelihood" },
          { symbol: "p(z)", meaning: "chosen prior, usually standard normal" },
        ],
      },
      {
        latex: raw`z=\mu_\phi(x)+\sigma_\phi(x)\odot\epsilon,\qquad \epsilon\sim\mathcal{N}(0,I)`,
        label: "Reparameterization trick",
        plain: "Move randomness into an external noise variable, so gradients flow through μ and σ instead of being blocked by sampling.",
        symbols: [
          { symbol: "\\mu_\\phi,\\sigma_\\phi", meaning: "encoder outputs for posterior mean and scale" },
          { symbol: "\\epsilon", meaning: "fixed-shape standard normal noise" },
        ],
      },
    ],
    steps: [
      {
        title: "Start from the evidence identity",
        latex: raw`\log p_\theta(x)=\log\mathbb{E}_{q_\phi}\!\left[\frac{p_\theta(x,z)}{q_\phi(z\mid x)}\right]`,
        explanation: "Multiply and divide by the proposal distribution — the integral is unchanged.",
      },
      {
        title: "Apply Jensen's inequality",
        latex: raw`\log\mathbb{E}[Y]\ge\mathbb{E}[\log Y]`,
        explanation: "Because log is concave, moving it inside the expectation can only lower the value. The bound is tight when q matches the posterior.",
      },
      {
        title: "Read the gradient",
        latex: raw`\nabla_\phi\mathcal{L}=\mathbb{E}_{\epsilon}\!\left[\nabla_\phi\log p_\theta\!\left(x\mid z_\phi(\epsilon)\right)-\nabla_\phi D_{\mathrm{KL}}\right]`,
        explanation: "With reparameterization the expectation no longer depends on φ through its measure, so a plain Monte Carlo estimate is unbiased.",
      },
    ],
    complexity:
      "Per-example cost is O(E + D) for encoder and decoder, independent of latent dimension; the price is a Monte Carlo gradient whose variance grows as the bound loosens.",
    pitfalls: [
      "Posterior collapse: the KL term wins and the decoder ignores z.",
      "Treating the ELBO gap as negligible when comparing very different model classes.",
    ],
  },
  {
    id: "adversarial",
    test: /adversarial|discriminator|generator|minimax|game theor/i,
    domain: "Generative Models",
    topics: ["Generative Models", "Game Theory", "Optimization"],
    headline: "Generation as a two-player zero-sum game",
    intuition:
      "A discriminator learns to separate real from fake; the generator is rewarded for fooling it. At equilibrium the generator's distribution matches the data and the discriminator can only guess 50/50.",
    equations: [
      {
        latex: raw`\min_G\max_D\;\mathbb{E}_{x\sim p_{\mathrm{data}}}\!\left[\log D(x)\right]+\mathbb{E}_{z\sim p_z}\!\left[\log\!\left(1-D(G(z))\right)\right]`,
        label: "Adversarial minimax objective",
        plain: "D maximizes correct classification; G minimizes it — a saddle-point problem, not a plain minimization.",
        symbols: [
          { symbol: "D(x)", meaning: "probability the discriminator assigns to 'real'" },
          { symbol: "G(z)", meaning: "generated sample from noise z" },
        ],
      },
      {
        latex: raw`\max_D V(D,G)=\mathbb{E}_{p_{\mathrm{data}}}\!\left[\log D\right]+\mathbb{E}_{p_g}\!\left[\log(1-D)\right],
        \quad D^{*}(x)=\frac{p_{\mathrm{data}}(x)}{p_{\mathrm{data}}(x)+p_g(x)}`,
        label: "Optimal discriminator",
        plain: "For fixed G, pointwise calculus gives the Bayes-optimal classifier as a likelihood ratio.",
        symbols: [
          { symbol: "p_g", meaning: "the generator's implicit density" },
          { symbol: "D^{*}", meaning: "optimal discriminator" },
        ],
      },
      {
        latex: raw`V(D^{*},G)=2\,D_{\mathrm{JS}}\!\left(p_{\mathrm{data}}\,\|\,p_g\right)-\log 4`,
        label: "Reduction to Jensen–Shannon",
        plain: "Plugging in D* shows the generator minimizes a JS divergence, which flattens when the supports are disjoint.",
        symbols: [{ symbol: "D_{\\mathrm{JS}}", meaning: "Jensen–Shannon divergence, bounded in [0, log 2]" }],
      },
    ],
    steps: [
      {
        title: "Fix G and maximize pointwise",
        latex: raw`\frac{\partial}{\partial D}\!\left[a\log D+b\log(1-D)\right]=0\Rightarrow D=\frac{a}{a+b}`,
        explanation: "Each x can be optimized independently, giving the density ratio form.",
      },
      {
        title: "Substitute D* back into the value function",
        latex: raw`V(D^*,G)=-\log 4+2D_{\mathrm{JS}}\!\left(p_{\mathrm{data}}\|p_g\right)`,
        explanation: "The game value is now purely a divergence between distributions, so equilibrium means p_g = p_data.",
      },
      {
        title: "Diagnose the vanishing-gradient regime",
        latex: raw`\nabla_\theta\log\!\left(1-D(G(z))\right)\approx 0 \;\text{when } D(G(z))\to 0`,
        explanation: "Early in training the generator's gradient saturates; the standard fix is the non-saturating loss −log D(G(z)).",
      },
    ],
    complexity:
      "Each update costs one discriminator pass and one generator pass, O(C) per iteration. Stability, not asymptotics, is the binding constraint.",
    pitfalls: [
      "Minimax ≠ simultaneous gradient descent; oscillations are mathematical, not a bug.",
      "JS divergence saturates when distributions have disjoint support — the Wasserstein formulation exists for this reason.",
    ],
  },
  {
    id: "residual",
    test: /residual|skip connection|shortcut|identity mapping|depth/i,
    domain: "Computer Vision",
    topics: ["Residual Networks", "Optimization", "Computer Vision"],
    headline: "Learn a correction, not the whole mapping",
    intuition:
      "If the useful transformation is close to identity, forcing a stack of layers to re-learn identity is hard. Adding the input back means the network only has to model the residual — and gradients get an uninterrupted path to earlier layers.",
    equations: [
      {
        latex: raw`y=\mathcal{F}(x,\{W_i\})+x`,
        label: "Residual block",
        plain: "Add the block input to its transformation. The identity term requires no parameters.",
        symbols: [
          { symbol: "\\mathcal{F}", meaning: "learned residual branch" },
          { symbol: "x,y", meaning: "block input and output" },
        ],
      },
      {
        latex: raw`\frac{\partial \mathcal{L}}{\partial x}=\frac{\partial \mathcal{L}}{\partial y}\left(1+\frac{\partial \mathcal{F}}{\partial x}\right)`,
        label: "Gradient with shortcut",
        plain: "The '1 +' term is a direct gradient highway; it cannot be shrunk by small weights in the branch.",
        symbols: [
          { symbol: "\\frac{\\partial \\mathcal{L}}{\\partial y}", meaning: "backpropagated error arriving at the block output" },
        ],
      },
      {
        latex: raw`h_{l+1}=h_l+\mathcal{F}(h_l),\qquad h_{L}=h_l+\sum_{i=l}^{L-1}\mathcal{F}(h_i)`,
        label: "Unrolled deep residual sum",
        plain: "Unrolling shows depth behaves like an ensemble of shallow paths with additive contributions.",
        symbols: [{ symbol: "h_l", meaning: "features at depth l" }],
      },
    ],
    steps: [
      {
        title: "Write the gradient through L-l blocks",
        latex: raw`\frac{\partial \mathcal{L}}{\partial h_l}=\frac{\partial \mathcal{L}}{\partial h_L}\prod_{i=l}^{L-1}\left(1+\frac{\partial \mathcal{F}(h_i)}{\partial h_i}\right)`,
        explanation: "Repeated multiplication is where vanishing gradients come from — but each factor now contains a constant 1.",
      },
      {
        title: "See why the product cannot vanish",
        explanation: "Unless every branch derivative is exactly −1, the product retains a term of magnitude 1, so error reaches shallow layers without exponential decay.",
      },
      {
        title: "Connect to pre-activation ordering",
        latex: raw`x_{l+1}=x_l+\mathcal{F}\!\left(\mathrm{BN}(x_l)\right)`,
        explanation: "Keeping the shortcut free of normalization and activation preserves the clean identity path.",
      },
    ],
    complexity:
      "Parameter cost is +0 and FLOP cost is +1 addition per channel; the benefit is optimization conditioning, not raw capacity.",
    pitfalls: [
      "Dimension mismatch on the shortcut requires a projection 1×1 conv — that is no longer a pure identity.",
      "Adding activations on the shortcut (post-activation variants) erodes the gradient highway.",
    ],
  },
  {
    id: "optimization",
    test: /adam|optimizer|learning rate|momentum|gradient descent|convergence|sgd/i,
    domain: "Machine Learning",
    topics: ["Optimization", "Gradient Descent", "Deep Learning"],
    headline: "Adaptive steps from running moments of the gradient",
    intuition:
      "Track a smoothed gradient (momentum) and a smoothed squared gradient (scale). Divide one by the root of the other and every parameter gets an effective step size normalized by its own gradient history.",
    equations: [
      GRADIENT_STEP,
      {
        latex: raw`m_t=\beta_1 m_{t-1}+(1-\beta_1)g_t,\qquad v_t=\beta_2 v_{t-1}+(1-\beta_2)g_t^{2}`,
        label: "First and second moment estimates",
        plain: "Exponential moving averages with decay β: the effective window is roughly 1/(1−β) recent steps.",
        symbols: [
          { symbol: "g_t", meaning: "mini-batch gradient at step t" },
          { symbol: "\\beta_1,\\beta_2", meaning: "momentum decay rates (0.9 and 0.999 typically)" },
        ],
      },
      {
        latex: raw`\theta_t=\theta_{t-1}-\eta\,\frac{\hat{m}_t}{\sqrt{\hat{v}_t}+\epsilon},\qquad \hat{m}_t=\frac{m_t}{1-\beta_1^{t}}`,
        label: "Bias-corrected update",
        plain: "Both moments start at zero, so they underestimate early. Dividing by 1−βᵗ rescales them to be unbiased.",
        symbols: [
          { symbol: "\\hat{m}_t,\\hat{v}_t", meaning: "bias-corrected moment estimates" },
          { symbol: "\\epsilon", meaning: "numerical stabilizer" },
        ],
      },
    ],
    steps: [
      {
        title: "Why the moving average starts biased",
        latex: raw`\mathbb{E}[m_1]=(1-\beta_1)\mathbb{E}[g_1]\neq\mathbb{E}[g_1]`,
        explanation: "Initializing at zero drags the average down by a factor of (1−β₁).",
      },
      {
        title: "Correct the bias",
        latex: raw`\mathbb{E}[\hat{m}_t]=\mathbb{E}[m_t]/(1-\beta_1^t)=\mathbb{E}[g_t]`,
        explanation: "The correction factor vanishes geometrically, so it matters only in the first ~1/(1−β) steps.",
      },
      {
        title: "Interpret the preconditioner",
        latex: raw`\Delta\theta_i=-\eta\,\frac{m_i}{\sqrt{v_i}}\;\Rightarrow\; \left|\Delta\theta_i\right|\approx\eta`,
        explanation: "In steady state, each coordinate's update magnitude is roughly the learning rate — hence the 'sign-like' behavior.",
      },
    ],
    complexity:
      "O(P) extra memory for P parameters (two scalars each) and O(P) time per step; negligible next to a forward/backward pass but substantial for huge models.",
    pitfalls: [
      "The original convergence proof has known gaps; transformers often use AdamW to decouple weight decay.",
      "Bias correction is not optional early in training — skipping it causes huge first steps.",
    ],
  },
  {
    id: "duality",
    test: /support vector|margin|kernel|dual|lagrang|convex|slack/i,
    domain: "Machine Learning",
    topics: ["Kernels", "Convex Optimization", "Classification"],
    headline: "Maximum margin, then duality turns geometry into kernels",
    intuition:
      "Among all separating hyperplanes, pick the one whose closest points are farthest away. Only those boundary points (support vectors) determine the answer, which lets you rewrite the problem using inner products — and swap inner products for kernels.",
    equations: [
      {
        latex: raw`\min_{w,b}\;\tfrac{1}{2}\|w\|^{2}\quad\text{s.t.}\quad y_i\!\left(w^{\top}\phi(x_i)+b\right)\ge 1-\xi_i,\;\;\xi_i\ge 0`,
        label: "Soft-margin primal",
        plain: "Minimize weight norm (maximize margin) while paying a linear price for points inside the margin.",
        symbols: [
          { symbol: "\\phi(x_i)", meaning: "feature map into a higher-dimensional space" },
          { symbol: "\\xi_i", meaning: "slack for margin violations" },
        ],
      },
      {
        latex: raw`\max_{\alpha}\;\sum_i\alpha_i-\frac{1}{2}\sum_{i,j}\alpha_i\alpha_j y_i y_j K(x_i,x_j)\quad\text{s.t.}\quad 0\le\alpha_i\le C,\;\;\sum_i\alpha_i y_i=0`,
        label: "Dual problem",
        plain: "The data appear only through the kernel matrix K; w is replaced by a weighted sum over support vectors.",
        symbols: [
          { symbol: "\\alpha_i", meaning: "multiplier per example; non-zero only for support vectors" },
          { symbol: "K(x_i,x_j)=\\langle\\phi(x_i),\\phi(x_j)\\rangle", meaning: "kernel function" },
        ],
      },
    ],
    steps: [
      {
        title: "Form the Lagrangian",
        latex: raw`\mathcal{L}(w,b,\alpha)=\tfrac12\|w\|^2-\sum_i\alpha_i\!\left[y_i(w^{\top}x_i+b)-1\right]`,
        explanation: "Introduce a multiplier for each constraint and subtract violations.",
      },
      {
        title: "Stationarity gives the representer theorem",
        latex: raw`\frac{\partial\mathcal{L}}{\partial w}=0\Rightarrow w=\sum_i\alpha_i y_i x_i`,
        explanation: "The optimal weight vector is a linear combination of training points — the seed of kernel methods.",
      },
      {
        title: "Complementary slackness selects support vectors",
        latex: raw`\alpha_i\!\left[y_i(w^{\top}x_i+b)-1+\xi_i\right]=0`,
        explanation: "Points strictly outside the margin get α=0 and can be discarded; only boundary points matter.",
      },
    ],
    complexity:
      "Naive kernel SVM training is O(n²) memory and O(n³) time for the QP; prediction is O(n_sv·d) with the number of support vectors.",
    pitfalls: [
      "Assuming the kernel matrix is a similarity matrix only — it must be positive semi-definite.",
      "Ignoring the role of C: it is the inverse regularization dial, not a margin width.",
    ],
  },
  {
    id: "information",
    test: /entropy|information theory|mutual information|coding|bits|shannon|cross-entropy/i,
    domain: "Information Theory",
    topics: ["Entropy", "Probability", "Information Theory"],
    headline: "Information is the expected surprise of an outcome",
    intuition:
      "Rare events carry more information. Summing −log p over outcomes gives entropy: the average number of bits needed to describe a draw from the distribution. Cross-entropy — the loss you minimize every day — is entropy plus a divergence.",
    equations: [
      {
        latex: raw`H(X)=-\sum_{x}p(x)\log_2 p(x)`,
        label: "Shannon entropy",
        plain: "Expected surprise. Uniform over 8 outcomes is exactly 3 bits; a deterministic variable is 0 bits.",
        symbols: [
          { symbol: "p(x)", meaning: "probability mass of outcome x" },
          { symbol: "\\log_2", meaning: "bits; natural log gives nats" },
        ],
      },
      {
        latex: raw`H(p,q)=-\sum_x p(x)\log q(x)=H(p)+D_{\mathrm{KL}}(p\|q)`,
        label: "Cross-entropy decomposition",
        plain: "Training with cross-entropy is minimizing the KL divergence because H(p) does not depend on the model.",
        symbols: [
          { symbol: "p", meaning: "true label distribution" },
          { symbol: "q", meaning: "model prediction" },
        ],
      },
      {
        latex: raw`C=\max_{p(x)} I(X;Y),\qquad I(X;Y)=H(X)-H(X\mid Y)`,
        label: "Channel capacity",
        plain: "The largest reliable transmission rate is the maximum mutual information over input distributions.",
        symbols: [
          { symbol: "I(X;Y)", meaning: "mutual information between input and output" },
          { symbol: "C", meaning: "channel capacity in bits per channel use" },
        ],
      },
    ],
    steps: [
      {
        title: "Axioms force the log form",
        explanation: "Continuity, symmetry in outcomes of equal probability, and additivity for independent events uniquely determine −log p up to base.",
      },
      {
        title: "Chain rule for entropy",
        latex: raw`H(X,Y)=H(X)+H(Y\mid X)`,
        explanation: "Joint surprise equals the surprise of X plus what Y adds once X is known.",
      },
      {
        title: "Source coding bound",
        latex: raw`L\ge H(X)`,
        explanation: "No prefix code can beat the entropy on average; Huffman coding comes within one bit of it.",
      },
    ],
    complexity:
      "Computing entropy over n outcomes is O(n) time and O(1) extra space; the interesting cost is estimating it from samples, which is O(n) per estimate and biased for large alphabets.",
    pitfalls: [
      "Mixing log bases between bits and nats and misreading reported values by 1.44×.",
      "Estimating entropy from finite samples and ignoring the downward bias.",
    ],
  },
  {
    id: "statistics",
    test: /clinical|trial|hypothesis|p-value|confidence interval|statistical signific|regression|cohort|patient|medical/i,
    domain: "Medical and Health Informatics",
    topics: ["Statistics", "Regression", "Classification"],
    headline: "Estimates, uncertainty, and the cost of multiple comparisons",
    intuition:
      "A measured effect is a random variable. Report its uncertainty, correct for the number of tests, and remember that a p-value is P(data | null), not P(null | data).",
    equations: [
      {
        latex: raw`\hat{\beta}=(X^{\top}X)^{-1}X^{\top}y,\qquad \mathrm{Var}(\hat{\beta})=\sigma^{2}(X^{\top}X)^{-1}`,
        label: "Ordinary least squares",
        plain: "The best linear unbiased estimate and its covariance; standard errors are square roots of the diagonal.",
        symbols: [
          { symbol: "X", meaning: "design matrix of covariates" },
          { symbol: "\\sigma^2", meaning: "residual variance" },
        ],
      },
      {
        latex: raw`t=\frac{\hat{\beta}_j}{\mathrm{SE}(\hat{\beta}_j)},\qquad p=2\left(1-F_{t_{n-p}}(|t|)\right)`,
        label: "Wald test",
        plain: "How many standard errors the effect is from zero; the p-value converts that into tail probability.",
        symbols: [
          { symbol: "\\mathrm{SE}", meaning: "standard error of the estimate" },
          { symbol: "F_{t_{n-p}}", meaning: "t-distribution CDF with n−p degrees of freedom" },
        ],
      },
      {
        latex: raw`\text{CI}_{95\%}=\hat{\beta}\pm t_{0.975,\,df}\,\mathrm{SE}(\hat{\beta})`,
        label: "Confidence interval",
        plain: "A procedure that covers the true effect 95% of the time across repeated studies — not a 95% probability for this interval.",
        symbols: [{ symbol: "df", meaning: "degrees of freedom" }],
      },
    ],
    steps: [
      {
        title: "Justify the estimator",
        latex: raw`\nabla_\beta\|y-X\beta\|^2=0\Rightarrow X^{\top}X\beta=X^{\top}y`,
        explanation: "Setting the derivative to zero gives the normal equations; feasibility needs X full column rank.",
      },
      {
        title: "Propagate uncertainty",
        latex: raw`\mathrm{Var}(A y)=A\,\mathrm{Var}(y)\,A^{\top}`,
        explanation: "Linear transformations propagate covariance by congruence, which yields the estimator covariance.",
      },
      {
        title: "Correct for multiple testing",
        latex: raw`p_{\text{Bonferroni}}=\min(1,\,m\,p),\qquad \text{FDR}=\mathbb{E}\!\left[\frac{V}{R}\right]`,
        explanation: "Testing m hypotheses inflates false positives; Bonferroni controls family-wise error, Benjamini–Hochberg controls the false discovery rate.",
      },
    ],
    complexity:
      "OLS is O(np²) time and O(p²) memory for p covariates; bootstrap confidence intervals cost B refits, i.e. B·O(np²).",
    pitfalls: [
      "Reading a p-value as the probability the null hypothesis is true.",
      "Overlapping confidence intervals do not imply a non-significant difference.",
    ],
  },
  {
    id: "markov",
    test: /graph|pagerank|markov|eigen|spectral|random walk|adjacency/i,
    domain: "Graph Learning",
    topics: ["Graph Algorithms", "Linear Algebra", "Spectral Methods"],
    headline: "Importance as the stationary distribution of a random walk",
    intuition:
      "Imagine a surfer clicking random links forever. The fraction of time spent on each page is its importance. That long-run distribution is the top eigenvector of a row-stochastic matrix, computable by repeated multiplication.",
    equations: [
      {
        latex: raw`\pi=d\,P^{\top}\pi+\frac{1-d}{N}\mathbf{1},\qquad \pi^{\top}\mathbf{1}=1`,
        label: "Damped PageRank fixed point",
        plain: "With probability d follow a link, otherwise teleport uniformly — the teleport term guarantees a unique solution.",
        symbols: [
          { symbol: "P", meaning: "column-stochastic link matrix" },
          { symbol: "d", meaning: "damping factor, usually 0.85" },
        ],
      },
      {
        latex: raw`\pi^{(k+1)}=d\,P^{\top}\pi^{(k)}+\frac{1-d}{N}\mathbf{1},\qquad \left\|\pi^{(k)}-\pi\right\|_1\le 2d^{k}`,
        label: "Power iteration and its rate",
        plain: "Each iteration multiplies the damping factor into the error, giving geometric convergence.",
        symbols: [{ symbol: "\\|\\cdot\\|_1", meaning: "L1 norm, total variation bound" }],
      },
    ],
    steps: [
      {
        title: "Make the chain well behaved",
        explanation: "Dangling nodes (no out-links) break stochasticity; the teleport term plus dangling redistribution makes the chain irreducible and aperiodic.",
      },
      {
        title: "Perron–Frobenius guarantees existence",
        latex: raw`M_{ij}=d\,P_{ij}+\frac{1-d}{N}>0 \Rightarrow \exists!\,\pi>0 \text{ with } M^{\top}\pi=\pi`,
        explanation: "A strictly positive stochastic matrix has a unique stationary distribution.",
      },
      {
        title: "Bound the iteration count",
        latex: raw`k \ge \frac{\log(2/\delta)}{\log(1/d)} \Rightarrow \text{error}\le\delta`,
        explanation: "For d=0.85, ~90 iterations suffice for 10⁻⁶ accuracy regardless of graph size — a rare explicit convergence guarantee.",
      },
    ],
    complexity:
      "O(E) per iteration for E edges; total O(E log(1/δ)/log(1/d)). Sparse matrix-vector products make web-scale graphs feasible.",
    pitfalls: [
      "Forgetting that scores are relative — PageRank values are meaningless without their sum.",
      "Treating teleport as a hack when it is the mathematical device that makes the answer unique.",
    ],
  },
  {
    id: "quantum",
    test: /quantum|qubit|superposition|amplitude amplification|shor|grover|hamiltonian/i,
    domain: "Quantum Computing",
    topics: ["Quantum Algorithms", "Linear Algebra", "Complexity Theory"],
    headline: "Speedup comes from rotating amplitudes, not trying everything at once",
    intuition:
      "A quantum state is a unit vector in a complex vector space. Algorithms apply unitary matrices that rotate that vector; interference cancels wrong answers and reinforces the right one. Amplitude amplification is a rotation in a 2D plane.",
    equations: [
      {
        latex: raw`|\psi\rangle=\sum_{x}\alpha_x|x\rangle,\qquad \sum_x|\alpha_x|^2=1`,
        label: "State vector and normalization",
        plain: "Amplitudes are complex; squared magnitudes are probabilities and must sum to one.",
        symbols: [
          { symbol: "\\alpha_x", meaning: "complex amplitude of basis state x" },
          { symbol: "|x\\rangle", meaning: "computational basis vector" },
        ],
      },
      {
        latex: raw`G=\left(2|\psi\rangle\langle\psi|-I\right)O,\qquad \theta=2\arcsin\sqrt{\tfrac{1}{N}}`,
        label: "Grover iterate",
        plain: "O flips the sign of the marked state; the reflection about the mean turns that sign into amplitude. Each iteration rotates by 2θ.",
        symbols: [
          { symbol: "O", meaning: "oracle that phase-flips the solution" },
          { symbol: "\\theta", meaning: "rotation angle per iteration" },
        ],
      },
      {
        latex: raw`k_{\text{opt}}=\left\lfloor\frac{\pi}{4}\sqrt{N}\right\rfloor`,
        label: "Optimal query count",
        plain: "Rotating too far overshoots the target: the success probability is periodic, not monotone.",
        symbols: [{ symbol: "N", meaning: "size of the unstructured search space" }],
      },
    ],
    steps: [
      {
        title: "Restrict to the 2D span",
        latex: raw`\mathrm{span}\{|w\rangle,|\bar{w}\rangle\},\qquad |\psi\rangle=\sin\theta\,|w\rangle+\cos\theta\,|\bar{w}\rangle`,
        explanation: "Symmetry reduces an N-dimensional problem to a plane, which is why the analysis is exact.",
      },
      {
        title: "Compose the two reflections",
        latex: raw`G=R_{\psi}O \;\Rightarrow\; \text{rotation by }2\theta \text{ in that plane}`,
        explanation: "A product of two reflections is a rotation; the angle between the target and the state drives everything.",
      },
      {
        title: "Compute the failure probability",
        latex: raw`P_{\text{fail}}=\cos^2\!\left((2k+1)\theta\right)`,
        explanation: "Setting (2k+1)θ ≈ π/2 maximizes success; deviations are catastrophic near k_opt, so exact counting matters.",
      },
    ],
    complexity:
      "O(√N) oracle queries versus O(N) classically — a provable quadratic speedup. Circuit depth is O(√N log N) for the diffusion operator on a scalable architecture.",
    pitfalls: [
      "Claiming Grover tries all answers simultaneously; measurement only ever returns one basis state.",
      "Ignoring that √N queries still need error-corrected hardware and a reversible oracle.",
    ],
  },
  {
    id: "scientific",
    test: /pde|differential equation|physics|simulation|fluid|residual|navier|schr|biology|protein/i,
    domain: "AI for Science",
    topics: ["Scientific Computing", "PDEs", "Automatic Differentiation"],
    headline: "Put the governing equation inside the loss",
    intuition:
      "Instead of only fitting observed data, enforce the physical law at random collocation points. Automatic differentiation gives exact derivatives of the network, so the residual can be evaluated anywhere — no mesh required.",
    equations: [
      {
        latex: raw`\mathcal{N}\!\left[u\right](t,x)=0,\;\; x\in\Omega,\qquad \mathcal{B}\!\left[u\right]=0,\;\; x\in\partial\Omega`,
        label: "Governing PDE and boundary conditions",
        plain: "A differential operator plus boundary data define the physical problem.",
        symbols: [
          { symbol: "\\mathcal{N}", meaning: "differential operator, e.g. ∂ₜ − ν∂ₓₓ" },
          { symbol: "\\mathcal{B}", meaning: "boundary/initial condition operator" },
        ],
      },
      {
        latex: raw`\mathcal{L}(\theta)=\frac{1}{N_u}\sum_i\left|u_\theta(t_i,x_i)-u_i\right|^2+\frac{\lambda}{N_f}\sum_j\left|\mathcal{N}\!\left[u_\theta\right](t_j,x_j)\right|^2`,
        label: "Composite loss",
        plain: "Fit the observations and satisfy the differential equation at collocation points; λ balances the two.",
        symbols: [
          { symbol: "\\theta", meaning: "network weights" },
          { symbol: "\\lambda", meaning: "residual weighting" },
        ],
      },
      {
        latex: raw`\mathcal{N}[u_\theta]=\frac{\partial u_\theta}{\partial t}-\nu\frac{\partial^2 u_\theta}{\partial x^2},\qquad \frac{\partial u_\theta}{\partial t}=\text{autodiff}`,
        label: "Residual via automatic differentiation",
        plain: "Differentiating the network is a cheap, exact operation, which is what makes the residual honest.",
        symbols: [{ symbol: "\\nu", meaning: "diffusivity (inverse Reynolds number for Burgers)" }],
      },
    ],
    steps: [
      {
        title: "Approximate the solution with a smooth network",
        latex: raw`u_\theta(t,x)\approx u(t,x)`,
        explanation: "Activation choice matters: tanh/sin give well-defined higher derivatives, ReLU does not.",
      },
      {
        title: "Differentiate to form the residual",
        latex: raw`r_\theta=\mathcal{N}\!\left[u_\theta\right]`,
        explanation: "Autodiff computes ∂ₜ and ∂ₓₓ exactly, so no discretization error enters the residual.",
      },
      {
        title: "Optimize a weighted multi-objective loss",
        explanation: "The tricky part is conditioning: gradients from the data and residual terms differ by orders of magnitude, so λ or adaptive weighting is essential.",
      },
    ],
    complexity:
      "Per iteration O(B·C_forward) with an extra backward pass per derivative order; second-order residuals roughly triple cost. Training time dominates because convergence is slow and non-convex.",
    pitfalls: [
      "Reporting a small residual while the boundary conditions are violated.",
      "Treating PINNs as a mesh-free replacement for all solvers — high-frequency and stiff problems remain hard.",
    ],
  },
];

const KERNEL_MATH_FLOOR: Record<string, number> = {
  attention: 68,
  diffusion: 76,
  variational: 80,
  adversarial: 74,
  residual: 54,
  optimization: 50,
  duality: 70,
  information: 64,
  statistics: 56,
  markov: 60,
  quantum: 80,
  scientific: 74,
  generic: 40,
};

const FALLBACK: Kernel = {
  id: "generic",
  test: /.*/,
  domain: "Machine Learning",
  topics: ["Optimization", "Statistics", "Deep Learning"],
  headline: "Reduce the paper's claim to an objective plus an estimator",
  intuition:
    "Almost every empirical paper fits one pattern: define a loss, estimate its gradient from data, minimize it, and argue the estimate generalizes. Reading the math means locating each of those four pieces precisely.",
  equations: [
    GRADIENT_STEP,
    {
      latex: raw`\hat{R}_n(f)=\frac{1}{n}\sum_{i=1}^{n}\ell\!\left(f(x_i),y_i\right),\qquad R(f)=\mathbb{E}_{(x,y)\sim p}\!\left[\ell(f(x),y)\right]`,
      label: "Empirical versus population risk",
      plain: "You can only minimize what you can compute; the population risk is the quantity you actually care about.",
      symbols: [
        { symbol: "n", meaning: "number of samples" },
        { symbol: "\\ell", meaning: "per-example loss" },
      ],
    },
    {
      latex: raw`R(\hat{f}_n)\le \hat{R}_n(\hat{f}_n)+\mathcal{O}\!\left(\sqrt{\frac{\mathrm{cap}(\mathcal{F})+\log(1/\delta)}{n}}\right)`,
      label: "Generalization bound (sketch)",
      plain: "The gap between training and test risk shrinks with sample size and grows with model capacity — the fundamental tension of learning theory.",
      symbols: [
        { symbol: "\\mathrm{cap}(\\mathcal{F})", meaning: "capacity measure: VC dimension, norm, or Rademacher complexity" },
        { symbol: "\\delta", meaning: "confidence failure probability" },
      ],
    },
  ],
  steps: [
    { title: "Identify the objective", explanation: "Write down exactly what is being minimized, including every regularizer and constraint." },
    {
      title: "Identify the estimator",
      latex: raw`\nabla_\theta\hat{R}_n=\frac{1}{n}\sum_i\nabla_\theta\ell_i`,
      explanation: "Check whether the gradient is unbiased, and over what distribution the expectation is taken.",
    },
    {
      title: "Separate optimization from generalization",
      explanation: "Training error and test error are governed by different math. Papers often improve one and claim the other.",
    },
  ],
  complexity: "Look for the dominant term: dataset size n, dimension d, sequence length L, or number of iterations T. Most reported gains are constant-factor changes to one of these.",
  pitfalls: [
    "Accepting an ablation without checking whether the baseline was tuned equally.",
    "Confusing a statistical improvement with a practically meaningful one — check effect sizes and variance.",
  ],
};

export interface MathDetection {
  kernel: Kernel;
  mathScore: number;
  matchedTopics: string[];
  domain: string;
}

export function buildMathBreakdown(input: {
  title: string;
  abstract?: string | null;
  content: string;
}): MathDetection {
  const text = `${input.title} ${input.abstract ?? ""} ${input.content}`;
  const kernel = KERNELS.find((k) => k.test.test(text)) ?? FALLBACK;

  const symbolHits = (text.match(/[=<>∑∏∫∂∇√±≈≤≥θλσμαβγπ]/g) ?? []).length;
  const mathWords = (
    text.match(
      /\b(theorem|lemma|proof|derivation|derive|gradient|loss|objective|equation|matrix|matrices|probability|distribution|estimate|estimator|bound|complexity|algorithm|variational|gaussian|noise|latent|likelihood|softmax|attention|kernel|entropy|divergence|expectation|variance|convex|dual|lagrang|optimization|normaliz|sampling|stochastic|jacobian|eigen|approximat|asymptotic|regression|hypothesis|confidence|integral|differential)\b/gi,
    ) ?? []
  ).length;
  const digitHits = (text.match(/\b\d+(\.\d+)?\b/g) ?? []).length;
  const density = (symbolHits * 2.2 + mathWords + digitHits * 0.4) / Math.max(1, text.split(/\s+/).length / 110);
  const base = KERNEL_MATH_FLOOR[kernel.id] ?? 42;
  const mathScore = Math.max(16, Math.min(99, Math.round(base + Math.min(20, density * 1.9))));

  const topics = new Set<string>(kernel.topics);
  const detectors: [RegExp, string][] = [
    [/neural|deep learning|network/i, "Deep Learning"],
    [/transformer|attention/i, "Transformers"],
    [/diffusion/i, "Diffusion Models"],
    [/quantum/i, "Quantum Algorithms"],
    [/graph|node/i, "Graph Learning"],
    [/medical|clinical|patient/i, "Healthcare"],
    [/climate|environment/i, "Climate"],
    [/robot/i, "Robotics"],
    [/entropy|information/i, "Information Theory"],
    [/kernel|svm/i, "Kernels"],
  ];
  for (const [re, topic] of detectors) if (re.test(text)) topics.add(topic);

  const breakdown: MathBreakdown = {
    headline: kernel.headline,
    intuition: kernel.intuition,
    equations: kernel.equations,
    steps: kernel.steps,
    complexity: kernel.complexity,
    pitfalls: kernel.pitfalls,
  };

  return {
    kernel: { ...kernel, ...breakdown },
    mathScore,
    matchedTopics: [...topics],
    domain: kernel.domain,
  };
}

export { FALLBACK as GENERIC_MATH_KERNEL, KERNELS as MATH_KERNELS };
