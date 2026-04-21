import type { AITell } from "./types";

/**
 * AI-text tell patterns. Source: tropes.fyi + HN research 2026-04-22 + Wikipedia
 * "Signs of AI writing". Pattern-match only (cheap, local, zero deps).
 * Detection rate: ~70-80% on obvious AI; lower on edited text. Sufficient for
 * catching silent AI-isms that slip through humanizer.
 */

interface Pattern {
  id: string;
  re: RegExp;
  label: string;
}

const PATTERNS: Pattern[] = [
  // Negative parallelism — #1 AI tell per tropes.fyi
  { id: "negative-parallelism", re: /\bit'?s\s+not\s+(?:just\s+)?[A-Za-z][\w\s,]*?[.,]\s*(?:it'?s|it\s+is)\s+[A-Za-z]/gi, label: "negative parallelism: 'It's not X, it's Y'" },
  { id: "cross-sentence-reframe", re: /\bthe\s+question\s+(?:isn'?t|is\s+not)\s+.+?\.\s+the\s+question\s+is\s+/gi, label: "cross-sentence reframe: 'The question isn't X. The question is Y'" },
  { id: "triple-negation", re: /\bnot\s+\w+\.\s*not\s+\w+\.\s*(?:just|only|simply)\s+\w+/gi, label: "triple negation build" },
  { id: "dramatic-fragment", re: /\b(?:the\s+result|the\s+answer|the\s+problem|the\s+reality)\?\s+[A-Z]\w+\b/gi, label: "dramatic clipped fragment" },
  { id: "serves-as-reminder", re: /\bserves\s+as\s+(?:a\s+)?reminder\s+that\b/gi, label: "'serves as a reminder that'" },

  // Copula avoidance — use "is" / "has" / "does"
  { id: "copula-serves-as", re: /\bserves\s+as\s+(?:a|an|the)?\s*[a-z]+/gi, label: "copula avoidance: 'serves as'" },
  { id: "copula-stands-as", re: /\bstands\s+as\s+(?:a|an|the)?\s*[a-z]+/gi, label: "copula avoidance: 'stands as'" },
  { id: "copula-functions-as", re: /\bfunctions\s+as\s+(?:a|an|the)?\s*[a-z]+/gi, label: "copula avoidance: 'functions as'" },
  { id: "copula-acts-as", re: /\bacts\s+as\s+(?:a|an|the)?\s*[a-z]+/gi, label: "copula avoidance: 'acts as'" },

  // Significance inflation
  { id: "pivotal-moment", re: /\bpivotal\s+moment\b/gi, label: "significance inflation: 'pivotal moment'" },
  { id: "testament-to", re: /\b(?:a\s+)?testament\s+to\b/gi, label: "significance inflation: 'testament to'" },
  { id: "marks-a-shift", re: /\bmarks?\s+(?:a\s+)?(?:shift|moment|turning|transition)\b/gi, label: "significance inflation: 'marks a shift/moment'" },
  { id: "underscores", re: /\bunderscor(?:es?|ing|ed)\s+(?:the\s+)?(?:importance|significance|need|fact)\b/gi, label: "significance inflation: 'underscores the'" },

  // Meta-commentary / announcements
  { id: "its-worth-noting", re: /\bit'?s\s+worth\s+noting\b/gi, label: "meta-commentary: 'it's worth noting'" },
  { id: "its-important-to", re: /\bit'?s\s+important\s+to\s+(?:note|remember|consider|mention|understand)\b/gi, label: "meta-commentary: 'it's important to X'" },
  { id: "in-conclusion", re: /\bin\s+conclusion\b/gi, label: "meta-commentary: 'in conclusion'" },
  { id: "to-summarize", re: /\bto\s+summari[sz]e\b/gi, label: "meta-commentary: 'to summarize'" },
  { id: "lets-dive-in", re: /\blet'?s\s+(?:dive\s+in|dive\s+into|explore)\b/gi, label: "meta-commentary: 'let's dive in/explore'" },

  // Sycophantic openers
  { id: "great-question", re: /\bgreat\s+question\b/gi, label: "sycophantic opener: 'great question'" },
  { id: "excellent-point", re: /\b(?:excellent|great)\s+(?:point|observation)\b/gi, label: "sycophantic opener: 'excellent point'" },
  { id: "absolutely-right", re: /\byou(?:'?re|\s+are)\s+absolutely\s+right\b/gi, label: "sycophantic opener: 'absolutely right'" },
  { id: "certainly-opener", re: /^(?:certainly!?|of\s+course!?)\s/gim, label: "sycophantic opener: 'Certainly!' / 'Of course!'" },

  // Modern AI vocabulary
  { id: "delve", re: /\bdelve\s+(?:into|in)\b/gi, label: "AI vocab: 'delve'" },
  { id: "leveraging", re: /\blevera(?:ge|ging|ges|ged)\b/gi, label: "AI vocab: 'leverage'" },
  { id: "utilize", re: /\butili[sz]e[sd]?\b/gi, label: "AI vocab: 'utilize' (use 'use')" },
  { id: "seamlessly", re: /\bseamless(?:ly)?\b/gi, label: "AI vocab: 'seamless(ly)'" },
  { id: "effortlessly", re: /\beffortless(?:ly)?\b/gi, label: "AI vocab: 'effortless(ly)'" },
  { id: "robust-alone", re: /\brobust\b(?![\w\s]+(?:benchmark|\d))/gi, label: "AI vocab: 'robust' without specs" },
  { id: "tapestry", re: /\btapestry\b/gi, label: "AI vocab: 'tapestry'" },
  { id: "landscape-abstract", re: /\b(?:tech|ai|development|digital|modern)\s+landscape\b/gi, label: "AI vocab: 'landscape' (abstract)" },
  { id: "navigate-metaphor", re: /\bnavigat(?:e|ing|es|ed)\s+(?:the|this|a|an)\s+(?:landscape|world|future|complexities?|challenges?)\b/gi, label: "AI vocab: 'navigate' (metaphorical)" },

  // Superlatives (hype)
  { id: "revolutionary", re: /\brevolutionary\b/gi, label: "superlative: 'revolutionary'" },
  { id: "game-changing", re: /\bgame[- ]?changing\b/gi, label: "superlative: 'game-changing'" },
  { id: "transformative", re: /\btransformative\b/gi, label: "superlative: 'transformative'" },
  { id: "groundbreaking", re: /\bgroundbreaking\b/gi, label: "superlative: 'groundbreaking'" },
  { id: "cutting-edge", re: /\bcutting[- ]?edge\b/gi, label: "superlative: 'cutting-edge'" },
  { id: "state-of-art", re: /\bstate[- ]of[- ]the[- ]art\b/gi, label: "superlative: 'state-of-the-art'" },
  { id: "unlock", re: /\bunlock(?:s|ing|ed)?\s+(?:the\s+)?(?:full\s+)?(?:power|potential|value)\b/gi, label: "superlative verb: 'unlock the power/potential'" },

  // Superficial -ing endings
  { id: "highlighting-importance", re: /,\s*highlighting\s+(?:the\s+)?(?:importance|significance|need|value)\s+of\b/gi, label: "superficial -ing: 'highlighting the importance of'" },
  { id: "reflecting-broader", re: /,\s*reflecting\s+(?:a\s+)?broader\b/gi, label: "superficial -ing: 'reflecting a broader X'" },
  { id: "ensuring-that", re: /,\s*ensuring\s+(?:that\s+)?[a-z]/gi, label: "superficial -ing: ', ensuring that X'" },
  { id: "fostering", re: /,\s*fostering\s+(?:a\s+)?/gi, label: "superficial -ing: ', fostering X'" },

  // Chatbot residue
  { id: "hope-this-helps", re: /\bhope\s+this\s+helps\b/gi, label: "chatbot residue: 'hope this helps'" },
  { id: "let-me-know", re: /\blet\s+me\s+know\s+if\s+you(?:'?d|\s+would)\s+like\b/gi, label: "chatbot residue: 'let me know if'" },

  // Knowledge-cutoff disclaimers
  { id: "as-of-last-update", re: /\bas\s+of\s+my\s+last\s+(?:training\s+)?update\b/gi, label: "knowledge-cutoff disclaimer" },
  { id: "based-on-available", re: /\bbased\s+on\s+(?:the\s+)?available\s+information\b/gi, label: "knowledge-cutoff disclaimer" },
];

export function detectAITells(text: string): AITell[] {
  const tells: AITell[] = [];
  const lines = text.split(/\r?\n/);

  // Em-dash abuse — count em-dashes in prose lines (non-code, non-table)
  let emDashCount = 0;
  const emDashLines: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```") || line.startsWith("    ") || line.startsWith("|")) continue;
    const count = (line.match(/—/g) || []).length;
    if (count > 0) {
      emDashCount += count;
      emDashLines.push(i + 1);
    }
  }
  const proseLines = lines.filter((l) => !l.startsWith("```") && !l.startsWith("    ") && !l.startsWith("|") && l.trim().length > 0).length;
  if (emDashCount >= 2 && proseLines > 0 && emDashCount / proseLines > 0.15) {
    tells.push({
      pattern: "em-dash-abuse",
      quote: `${emDashCount} em-dashes across ${proseLines} prose lines`,
      line: emDashLines[0] ?? 0,
    });
  }

  // Pattern matches
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith("```")) continue;
    for (const p of PATTERNS) {
      p.re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = p.re.exec(line)) !== null) {
        tells.push({
          pattern: p.id,
          quote: m[0].slice(0, 160),
          line: i + 1,
        });
      }
    }
  }

  return tells;
}
