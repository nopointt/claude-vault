import type { ClaimToVerify } from "./types";

/**
 * Extract factual claims from text that need external verification.
 * Regex-based, deterministic, zero deps. Captures numbers, CVE ids, URLs,
 * dates, versions, HN-style scores, and percentage-vs-baseline stats.
 */
export function extractClaims(text: string): ClaimToVerify[] {
  const claims: ClaimToVerify[] = [];
  const lines = text.split(/\r?\n/);

  const patterns: Array<{ re: RegExp; type: ClaimToVerify["type"] }> = [
    { re: /\b(CVE-\d{4}-\d{4,7})\b/g, type: "cve" },
    { re: /\bhttps?:\/\/[^\s<>()"'\]]+/g, type: "url" },
    { re: /\b\d+(?:\.\d+)?%\s*(?:vs\.?|versus)\s*\d+(?:\.\d+)?%\s*(?:baseline|basis)?/gi, type: "stat" },
    { re: /\b\d+(?:\.\d+)?%\b/g, type: "stat" },
    { re: /\b\d{1,3}(?:,\d{3})+\s+(?:secrets?|credentials?|downloads?|users?|stars?|pts?|points?|subscribers?|developers?|devs?|requests?)\b/gi, type: "stat" },
    { re: /\b\d+(?:[,.]\d+)?\s*(?:K|M|B)\+?\s+(?:stars?|downloads?|users?|subscribers?|developers?|devs?|members?)\b/gi, type: "stat" },
    { re: /\b(?:Show HN|HN) #?\d+[\w-]*\b/gi, type: "score" },
    { re: /\b\d{4}-\d{2}-\d{2}\b/g, type: "date" },
    { re: /\bv\d+\.\d+(?:\.\d+)?(?:-[a-z0-9]+)?\b|\bversion\s+\d+\.\d+(?:\.\d+)?(?:-[a-z0-9]+)?\b/gi, type: "version" },
    { re: /\b(?:MIT|Apache-2\.0|Apache\s*2|BSD-[23]|BSD\s*[23]-Clause|GPL(?:v[23])?|AGPL(?:v3)?|MPL\s*2|LGPL(?:v[23])?|ISC|CC0|Unlicense)\s+(?:licen[sc]e|licen[sc]ed)\b/gi, type: "license" },
    { re: /\b(acquired|bought|purchased)\s+(?:by\s+)?[A-Z][A-Za-z0-9_-]+\b/g, type: "org" },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const seen = new Set<string>();
    for (const { re, type } of patterns) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        const match = m[0].trim();
        const key = `${type}::${match}`;
        if (seen.has(key)) continue;
        seen.add(key);
        claims.push({
          claim: match,
          type,
          context: line.trim().slice(0, 240),
          line: i + 1,
        });
      }
    }
  }

  return claims;
}
