import type { TOVViolation } from "./types";

/**
 * TOV compliance check. Source: contexter-vault/brand/tov.md v1.0.
 * Banned/preferred vocab lists duplicated here for zero-file-read speed.
 * Sync with tov.md when vocabulary section changes.
 */

const BANNED_WORDS: Array<{ word: string; reason: string }> = [
  { word: "game-changing", reason: "superlative without substance" },
  { word: "game changing", reason: "superlative without substance" },
  { word: "revolutionary", reason: "marketing inflation" },
  { word: "transformative", reason: "marketing inflation" },
  { word: "groundbreaking", reason: "marketing inflation" },
  { word: "cutting-edge", reason: "brochure vocabulary" },
  { word: "cutting edge", reason: "brochure vocabulary" },
  { word: "state-of-the-art", reason: "brochure vocabulary" },
  { word: "next-gen", reason: "brochure vocabulary" },
  { word: "best-in-class", reason: "self-superlative" },
  { word: "end-to-end", reason: "means nothing, tier signaling" },
  { word: "enterprise-grade", reason: "tier signaling without substance" },
  { word: "leverage", reason: "aggressive verb cluster" },
  { word: "leveraging", reason: "aggressive verb cluster" },
  { word: "harness", reason: "aggressive verb cluster" },
  { word: "unleash", reason: "aggressive verb cluster" },
  { word: "empower", reason: "aggressive verb cluster" },
  { word: "seamlessly", reason: "performance adverb" },
  { word: "effortlessly", reason: "performance adverb" },
  { word: "magically", reason: "performance adverb" },
  { word: "actionable insights", reason: "corporate filler" },
  { word: "synergy", reason: "corporate filler" },
  { word: "deep dive", reason: "corporate filler" },
  { word: "stakeholders", reason: "corporate filler" },
  { word: "move the needle", reason: "corporate idiom" },
  { word: "touch base", reason: "corporate idiom" },
  { word: "circle back", reason: "corporate idiom" },
  { word: "take your X to the next level", reason: "universal killswitch" },
  { word: "ready to", reason: "performance opener in CTAs" },
  { word: "exciting", reason: "excitement inflation" },
  { word: "thrilled", reason: "excitement inflation" },
  { word: "amazing", reason: "excitement inflation" },
  { word: "incredible", reason: "excitement inflation" },
  { word: "utilize", reason: "unnecessarily formal (use 'use')" },
  { word: "utilizes", reason: "unnecessarily formal (use 'use')" },
  { word: "utilized", reason: "unnecessarily formal (use 'use')" },
];

const BANNED_JUST_AS_ONLY: RegExp = /\b(?:just|simply)\s+(?:click|run|install|use|type|do|add|set)\b/gi;

export interface TOVCheckOptions {
  /** Context surface: adjusts exclamation-mark rules */
  surface?: "readme" | "cli" | "error" | "blog" | "post" | "release" | "reply";
}

export function checkTOV(text: string, opts: TOVCheckOptions = {}): TOVViolation[] {
  const v: TOVViolation[] = [];
  const lines = text.split(/\r?\n/);
  const surface = opts.surface ?? "readme";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith("```")) continue;
    const lower = line.toLowerCase();

    for (const { word, reason } of BANNED_WORDS) {
      if (word.includes(" X ") || word.includes("-X-")) continue;
      const idx = lower.indexOf(word.toLowerCase());
      if (idx !== -1) {
        // Avoid matching inside longer legit words (e.g., "amazing" inside "amazingness")
        const before = idx > 0 ? lower[idx - 1] : " ";
        const after = lower[idx + word.length] ?? " ";
        const isBoundary = /[^a-z-]/.test(before) && /[^a-z-]/.test(after);
        if (!isBoundary) continue;
        v.push({
          rule: "banned-word",
          detail: `"${line.slice(idx, idx + word.length)}" — ${reason}`,
          line: i + 1,
        });
      }
    }

    // "just/simply + verb" = condescending minimizer
    BANNED_JUST_AS_ONLY.lastIndex = 0;
    let mJust: RegExpExecArray | null;
    while ((mJust = BANNED_JUST_AS_ONLY.exec(line)) !== null) {
      v.push({
        rule: "condescending-minimizer",
        detail: `"${mJust[0]}" — 'just'/'simply' before a verb reads as condescending (NN/G frustration trigger)`,
        line: i + 1,
      });
    }

    // Exclamation marks — rules vary by surface
    const exclaimCount = (line.match(/!/g) || []).length;
    if (exclaimCount > 0) {
      const blocked = surface === "readme" || surface === "cli" || surface === "error" || surface === "post";
      if (blocked) {
        v.push({
          rule: "exclamation-in-restricted-surface",
          detail: `${exclaimCount} exclamation mark(s) — not allowed in ${surface}`,
          line: i + 1,
        });
      }
    }

    // Title case in headings (lines starting with ##)
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      const heading = headingMatch[1];
      // Count capitalized non-first words (not proper nouns — heuristic)
      const words = heading.split(/\s+/);
      const capsAfterFirst = words.slice(1).filter((w) => /^[A-Z][a-z]/.test(w) && !PROPER_NOUNS.has(w.replace(/[^A-Za-z]/g, "")));
      if (capsAfterFirst.length >= 2) {
        v.push({
          rule: "title-case-heading",
          detail: `Heading "${heading}" uses title case; TOV requires sentence case`,
          line: i + 1,
        });
      }
    }
  }

  return v;
}

const PROPER_NOUNS = new Set([
  "Claude", "Anthropic", "Bun", "Node", "TypeScript", "JavaScript", "Python", "Rust", "Go",
  "GitHub", "npm", "PyPI", "Docker", "Linux", "macOS", "Windows", "AWS", "GCP", "Azure",
  "OpenAI", "GPT", "Gemini", "MCP", "CLI", "API", "HTTP", "HTTPS", "TLS", "SSE", "TCP",
  "CVE", "AES", "MIT", "Apache", "BSD", "GPL", "OAuth", "JSON", "YAML", "Markdown",
  "README", "Stripe", "Vercel", "Cloudflare", "Fly", "Mozilla", "I", "HN", "LLM", "OS",
  "Hacker", "News", "Day",
]);
