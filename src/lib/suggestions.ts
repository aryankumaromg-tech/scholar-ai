import { db } from "@/db";
import { catalogPapers } from "@/db/schema";
import { ensureCatalog, rankRelated, toCatalogItem, type CatalogItem } from "@/lib/catalog";

export async function loadCatalog(): Promise<CatalogItem[]> {
  await ensureCatalog();
  const rows = await db.select().from(catalogPapers);
  return rows.map(toCatalogItem);
}

const DOMAIN_HINTS: [RegExp, string][] = [
  [/transformer|attention|language model|token|nlp/i, "Deep Learning"],
  [/diffusion|generative|variational|adversarial|latent variable|reparameterization/i, "Generative Models"],
  [/image|vision|convolution|segmentation|pixel/i, "Computer Vision"],
  [/quantum|qubit|superposition/i, "Quantum Computing"],
  [/protein|physics|pde|simulation|molecul/i, "AI for Science"],
  [/clinical|patient|medical|trial|cohort/i, "Medical and Health Informatics"],
  [/graph|node|recommendation|ranking/i, "Graph Learning"],
  [/regression|statistic|entropy|information/i, "Statistics"],
];

export function inferFromText(text: string, catalog: CatalogItem[]): { topics: string[]; domain: string } {
  const topics = new Set<string>();
  for (const item of catalog) {
    for (const topic of item.topics) {
      const pattern = new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      if (pattern.test(text)) topics.add(topic);
    }
  }
  const domain = DOMAIN_HINTS.find(([re]) => re.test(text))?.[1] ?? "Machine Learning";
  return { topics: [...topics], domain };
}

export async function suggestForText(
  text: string,
  limit = 4,
): Promise<{ item: CatalogItem; reason: string; score: number }[]> {
  const catalog = await loadCatalog();
  const inferred = inferFromText(text, catalog);
  return rankRelated({ topics: inferred.topics, domain: inferred.domain }, catalog, limit);
}

export async function suggestForPaper(
  topics: string[],
  domain: string | null,
  difficulty: string | null,
  limit = 4,
): Promise<{ item: CatalogItem; reason: string; score: number }[]> {
  const catalog = await loadCatalog();
  return rankRelated({ topics, domain, difficulty }, catalog, limit);
}
