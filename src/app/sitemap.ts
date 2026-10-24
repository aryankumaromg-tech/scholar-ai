import type { MetadataRoute } from "next";
import { CATALOG } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/discover`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/papers/new`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteConfig.url}/skills`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
  const catalogPages: MetadataRoute.Sitemap = CATALOG.map((paper) => ({
    url: `${siteConfig.url}/discover/${paper.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: paper.featured ? 0.8 : 0.65,
  }));
  return [...staticPages, ...catalogPages];
}
