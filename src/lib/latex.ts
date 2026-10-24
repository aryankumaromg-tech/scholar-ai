import katex from "katex";

export function renderTex(tex: string, displayMode = true): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: false,
      output: "html",
      trust: false,
    });
  } catch {
    return tex;
  }
}
