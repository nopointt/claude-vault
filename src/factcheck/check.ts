import type { CheckReport, Verdict } from "./types";
import { extractClaims } from "./claim-extractor";
import { detectAITells } from "./tropes";
import { checkTOV, type TOVCheckOptions } from "./tov";
import { checkLogic } from "./logic";

export interface CheckOptions extends TOVCheckOptions {}

export function runCheck(text: string, opts: CheckOptions = {}): CheckReport {
  const claims = extractClaims(text);
  const tells = detectAITells(text);
  const tov = checkTOV(text, opts);
  const logic = checkLogic(text);

  // Overall verdict: fail if any tov banned or any high-severity tell;
  // warn if claims need verify OR AI tells OR logic flags;
  // pass if clean.
  const hardFailRules = new Set([
    "banned-word", "condescending-minimizer", "exclamation-in-restricted-surface",
  ]);
  const hasHardFail = tov.some((x) => hardFailRules.has(x.rule)) || logic.some((x) => x.type === "potential-contradiction" || x.type === "dependency-claim-conflict");
  const hasWarn = tells.length > 0 || claims.length > 0 || tov.length > 0 || logic.length > 0;

  const overall: Verdict = hasHardFail ? "fail" : hasWarn ? "warn" : "pass";

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return {
    overall,
    input_length_chars: text.length,
    input_length_words: words,
    claims_to_verify: claims,
    ai_tells: tells,
    tov_violations: tov,
    logic_flags: logic,
    summary: {
      claims: claims.length,
      ai_tells: tells.length,
      tov_violations: tov.length,
      logic_flags: logic.length,
    },
  };
}

export function formatReport(report: CheckReport, format: "json" | "markdown" = "markdown"): string {
  if (format === "json") return JSON.stringify(report, null, 2);

  const lines: string[] = [];
  const icon = report.overall === "pass" ? "PASS" : report.overall === "warn" ? "WARN" : "FAIL";
  lines.push(`# contexter-vault check — ${icon}`);
  lines.push("");
  lines.push(`Length: ${report.input_length_words} words, ${report.input_length_chars} chars`);
  lines.push("");
  lines.push(`Summary: ${report.summary.claims} claims, ${report.summary.ai_tells} AI tells, ${report.summary.tov_violations} TOV violations, ${report.summary.logic_flags} logic flags`);
  lines.push("");

  if (report.tov_violations.length > 0) {
    lines.push("## TOV violations");
    for (const v of report.tov_violations) {
      lines.push(`- [line ${v.line}] (${v.rule}) ${v.detail}`);
    }
    lines.push("");
  }

  if (report.ai_tells.length > 0) {
    lines.push("## AI tells");
    for (const t of report.ai_tells) {
      lines.push(`- [line ${t.line}] (${t.pattern}) "${t.quote}"`);
    }
    lines.push("");
  }

  if (report.logic_flags.length > 0) {
    lines.push("## Logic flags");
    for (const f of report.logic_flags) {
      lines.push(`- (${f.type}) ${f.detail}`);
      for (const q of f.quotes) lines.push(`    > ${q}`);
    }
    lines.push("");
  }

  if (report.claims_to_verify.length > 0) {
    lines.push("## Claims to verify (send to factcheck-agent)");
    for (const c of report.claims_to_verify) {
      lines.push(`- [line ${c.line}] (${c.type}) "${c.claim}"`);
      lines.push(`    context: ${c.context}`);
    }
    lines.push("");
  }

  if (report.overall === "pass") lines.push("All checks clean.");
  return lines.join("\n");
}
