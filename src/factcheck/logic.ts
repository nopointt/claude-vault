import type { LogicFlag } from "./types";

/**
 * Simple logic/consistency heuristics. MVP-only: catches obvious
 * contradictions and a few known AI-failure classes. Not a full reasoner.
 */

export function checkLogic(text: string): LogicFlag[] {
  const flags: LogicFlag[] = [];
  const lines = text.split(/\r?\n/);
  const joined = text.toLowerCase();

  // Heuristic: same noun "X is ..." and "X is not ..." nearby — potential contradiction
  const isRe = /\b([a-z][a-z-]{2,24})\s+is\s+([a-z-]+)\b/gi;
  const isNotRe = /\b([a-z][a-z-]{2,24})\s+is\s+not\s+([a-z-]+)\b/gi;
  const positives: Record<string, string[]> = {};
  const negatives: Record<string, string[]> = {};
  let m: RegExpExecArray | null;
  while ((m = isRe.exec(text)) !== null) {
    const key = `${m[1].toLowerCase()}::${m[2].toLowerCase()}`;
    (positives[key] ||= []).push(m[0]);
  }
  while ((m = isNotRe.exec(text)) !== null) {
    const key = `${m[1].toLowerCase()}::${m[2].toLowerCase()}`;
    (negatives[key] ||= []).push(m[0]);
  }
  for (const key of Object.keys(negatives)) {
    if (positives[key]) {
      flags.push({
        type: "potential-contradiction",
        detail: `Statement asserts both "${positives[key][0]}" and "${negatives[key][0]}"`,
        quotes: [...positives[key], ...negatives[key]],
      });
    }
  }

  // Heuristic: "zero dependencies" + any "we use X library" nearby
  if (/\bzero\s+(?:runtime\s+)?(?:dependencies|deps)\b/i.test(text)) {
    const usesRe = /\buses?\s+(?:the\s+)?([a-z][a-z0-9-]{2,20})\s+(?:library|package|module|dep|dependency)\b/gi;
    const usedLibs: string[] = [];
    while ((m = usesRe.exec(text)) !== null) usedLibs.push(m[1]);
    if (usedLibs.length > 0) {
      flags.push({
        type: "dependency-claim-conflict",
        detail: `Text claims "zero dependencies" but mentions using: ${usedLibs.join(", ")}`,
        quotes: usedLibs,
      });
    }
  }

  // Heuristic: "for free" / "no cost" + pricing mention nearby
  const freeRe = /\b(?:for\s+free|no\s+cost|zero\s+cost|completely\s+free)\b/i;
  const priceRe = /\$\s*\d+(?:\.\d+)?\s*(?:\/mo|\/month|per\s+month|\/yr|\/year)?/g;
  if (freeRe.test(joined) && priceRe.test(text)) {
    flags.push({
      type: "free-vs-price-conflict",
      detail: "Text claims 'free / no cost' but also mentions a price",
      quotes: [],
    });
  }

  // Heuristic: anachronism — a version/date that predates a product's existence
  // (naive, only flags obvious cases like claims about 2027+ dated events)
  const futureDate = /\b20(?:2[7-9]|[3-9]\d)-\d{2}-\d{2}\b/g;
  let mDate: RegExpExecArray | null;
  while ((mDate = futureDate.exec(text)) !== null) {
    flags.push({
      type: "future-date",
      detail: `Date "${mDate[0]}" is in the future relative to current day`,
      quotes: [mDate[0]],
    });
  }

  return flags;
}
