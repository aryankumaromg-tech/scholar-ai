import { pgTable, serial, text, timestamp, integer, varchar, jsonb, boolean } from "drizzle-orm/pg-core";

export interface MathSymbol {
  symbol: string;
  meaning: string;
}

export interface MathEquation {
  latex: string;
  label: string;
  plain: string;
  symbols: MathSymbol[];
}

export interface MathStep {
  title: string;
  latex?: string;
  explanation: string;
}

export interface MathBreakdown {
  headline: string;
  intuition: string;
  equations: MathEquation[];
  steps: MathStep[];
  complexity: string;
  pitfalls: string[];
}

export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  abstract: text("abstract"),
  content: text("content").notNull(),
  authors: text("authors"),
  year: integer("year"),
  source: varchar("source", { length: 255 }),
  fileName: text("file_name"),
  fileType: varchar("file_type", { length: 24 }),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchNotes = pgTable("research_notes", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").references(() => papers.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 180 }).default("Research note").notNull(),
  body: text("body").notNull(),
  color: varchar("color", { length: 24 }).default("amber").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").references(() => papers.id).notNull(),
  tldr: text("tldr"),
  summary: text("summary").notNull(),
  keyFindings: text("key_findings").notNull(),
  methodology: text("methodology"),
  contributions: text("contributions").notNull(),
  limitations: text("limitations"),
  recommendations: text("recommendations"),
  citations: text("citations"),
  domain: varchar("domain", { length: 120 }),
  topics: text("topics"),
  difficulty: varchar("difficulty", { length: 40 }),
  readingMinutes: integer("reading_minutes"),
  mathScore: integer("math_score"),
  mathJson: jsonb("math_json").$type<MathBreakdown>(),
  aiModel: varchar("ai_model", { length: 100 }).default("simulated-ai").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const catalogPapers = pgTable("catalog_papers", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  year: integer("year").notNull(),
  venue: varchar("venue", { length: 160 }),
  domain: varchar("domain", { length: 120 }).notNull(),
  topics: text("topics").notNull(),
  difficulty: varchar("difficulty", { length: 40 }).notNull(),
  mathFocus: text("math_focus").notNull(),
  abstract: text("abstract").notNull(),
  keyEquation: text("key_equation").notNull(),
  equationLabel: text("equation_label").notNull(),
  whyRead: text("why_read").notNull(),
  citations: integer("citations").default(0).notNull(),
  readingMinutes: integer("reading_minutes").default(20).notNull(),
  url: text("url"),
  featured: boolean("featured").default(false).notNull(),
});
