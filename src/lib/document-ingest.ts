import { parseOffice } from "officeparser";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = ["pdf", "ppt", "pptx", "txt"] as const;
export type AcceptedExtension = (typeof ACCEPTED_EXTENSIONS)[number];

export interface ExtractedDocument {
  fileName: string;
  fileType: AcceptedExtension;
  fileSize: number;
  title: string;
  authors: string;
  year: string;
  abstract: string;
  content: string;
  wordCount: number;
  warnings: string[];
}

function cleanText(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{4,}/g, "\n\n")
    .replace(/[ \t]{3,}/g, " ")
    .trim();
}

function legacyPptText(buffer: Buffer): string {
  // Binary .ppt is an OLE compound file. In environments without LibreOffice,
  // extracting printable ASCII and UTF-16LE runs provides a useful fallback.
  const ascii = buffer
    .toString("latin1")
    .match(/[\x20-\x7E]{5,}/g)
    ?.filter((s) => !/^(PowerPoint Document|Current User|Pictures|SummaryInformation)/i.test(s))
    .join("\n") ?? "";

  const utf16 = buffer
    .toString("utf16le")
    .match(/[\x20-\x7E\u00A0-\u024F]{5,}/g)
    ?.join("\n") ?? "";

  return cleanText(`${utf16}\n${ascii}`);
}

function titleFromFilename(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferAbstract(text: string): string {
  const abstractMatch = text.match(
    /(?:^|\n)\s*abstract\s*[:—-]?\s*\n?([\s\S]{80,4000}?)(?=\n\s*(?:(?:1\.?\s+)?(?:introduction|keywords?|index terms|background|methods?)\b|equal contribution\b|work performed while\b|\d+(?:st|nd|rd|th)\s+conference\b)|$)/i,
  );
  if (abstractMatch?.[1]) return cleanText(abstractMatch[1]).slice(0, 2200);

  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => cleanText(p))
    .filter(
      (p) =>
        p.length >= 100 &&
        p.length <= 2200 &&
        !/permission|copyright|all rights reserved|proper attribution|creative commons|journalistic or scholarly/i.test(p),
    );
  return (paragraphs.find((p) => /\b(we|this (?:paper|study|work)|our)\b/i.test(p)) ?? paragraphs[0] ?? "").slice(0, 2200);
}

function inferTitle(text: string, fallback: string, metadataTitle?: string): string {
  if (
    metadataTitle &&
    metadataTitle.trim().length >= 4 &&
    metadataTitle.trim().length <= 240 &&
    !/permission|copyright|proper attribution|creative commons|all rights reserved/i.test(metadataTitle)
  )
    return metadataTitle.trim();
  const lines = text
    .split("\n")
    .map((line) => line.replace(/^\s*(?:slide\s+\d+|page\s+\d+)\s*[:—-]?\s*/i, "").trim())
    .filter((line) => line.length >= 6 && line.length <= 220);
  const first = lines.find(
    (line) =>
      !/^(abstract|introduction|contents?|agenda|overview|references)$/i.test(line) &&
      !/permission|copyright|all rights reserved|proper attribution|creative commons|journalistic|scholarly works|reproduce the tables|legacy powerpoint document|powerpoint document|arxiv:/i.test(line),
  );
  return first ?? fallback;
}

function inferYear(text: string, metadata: Record<string, unknown>): string {
  const opening = text.slice(0, 12_000);
  const venueYear = opening.match(/(?:conference|proceedings|journal|transactions|symposium)[^\n]{0,180}?\b((?:19|20)\d{2})\b/i)?.[1];
  if (venueYear) return venueYear;

  const openingYear = opening.match(/\b(19|20)\d{2}\b/)?.[0];
  if (openingYear) return openingYear;

  const dates = [metadata.created, metadata.modified, metadata.creationDate, metadata.date];
  for (const value of dates) {
    const match = String(value ?? "").match(/\b(19|20)\d{2}\b/);
    if (match) return match[0];
  }
  return "";
}

function inferAuthors(text: string, metadata: Record<string, unknown>, title: string): string {
  const fromMeta = metadata.author ?? metadata.creator ?? metadata.authors;
  if (typeof fromMeta === "string" && fromMeta.trim().length > 1) return fromMeta.trim();

  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const titleIndex = lines.findIndex((line) => line.includes(title.slice(0, Math.min(title.length, 40))));
  const candidates = lines.slice(Math.max(0, titleIndex + 1), Math.max(0, titleIndex + 5));
  return (
    candidates.find(
      (line) =>
        line.length < 180 &&
        /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(line) &&
        !/abstract|university|department|institute|http|@|introduction|arxiv:|permission|copyright/i.test(line),
    ) ?? ""
  );
}

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  const extension = file.name.split(".").pop()?.toLowerCase() as AcceptedExtension | undefined;
  if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
    throw new Error("Unsupported file. Upload a PDF, PPT, PPTX, or TXT document.");
  }
  if (file.size === 0) throw new Error("The uploaded file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File is too large. The upload limit is 15 MB.");

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";
  let metadata: Record<string, unknown> = {};
  const warnings: string[] = [];

  if (extension === "txt") {
    text = buffer.toString("utf8");
  } else if (extension === "ppt") {
    text = legacyPptText(buffer);
    warnings.push("Legacy PPT text was recovered with compatibility mode. Save as PPTX for more accurate slide extraction.");
  } else {
    try {
      const ast = await parseOffice(buffer, {
        fileType: extension,
        ignoreSlideMasters: true,
        ignoreHeadersAndFooters: true,
        ignoreComments: true,
        extractAttachments: false,
        decompressionLimits: {
          maxUncompressedBytes: 64 * 1024 * 1024,
          maxZipEntries: 5_000,
          maxXmlElements: 500_000,
        },
      });
      const converted = await ast.to("text", { includeFormatting: false });
      text = String(converted.value ?? "");
      metadata = (ast.metadata ?? {}) as Record<string, unknown>;
      for (const warning of ast.warnings ?? []) {
        const message = typeof warning === "object" && warning && "message" in warning ? String(warning.message) : String(warning);
        if (message && !/auto-detection of file type failed/i.test(message)) warnings.push(message);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown parser error";
      throw new Error(`Could not read this ${extension.toUpperCase()} file. ${detail}`);
    }
  }

  text = cleanText(text);
  if (text.length < 40) {
    throw new Error(
      extension === "pdf"
        ? "Very little text could be extracted. This may be a scanned PDF; use a text-based PDF or paste the abstract manually."
        : "Very little readable text was found in this file.",
    );
  }

  // Protect the database and analysis engine while retaining ample paper context.
  if (text.length > 300_000) {
    text = text.slice(0, 300_000);
    warnings.push("The document was truncated to the first 300,000 characters for analysis.");
  }

  const filenameTitle = titleFromFilename(file.name);
  const title = inferTitle(text, filenameTitle, typeof metadata.title === "string" ? metadata.title : undefined);

  return {
    fileName: file.name,
    fileType: extension,
    fileSize: file.size,
    title,
    authors: inferAuthors(text, metadata, title),
    year: inferYear(text, metadata),
    abstract: inferAbstract(text),
    content: text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    warnings: [...new Set(warnings)].slice(0, 5),
  };
}
