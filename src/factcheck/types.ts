export type Verdict = "pass" | "warn" | "fail";

export interface ClaimToVerify {
  claim: string;
  type: "stat" | "cve" | "url" | "date" | "version" | "score" | "person" | "org" | "license" | "general";
  context: string;
  line: number;
}

export interface AITell {
  pattern: string;
  quote: string;
  line: number;
}

export interface TOVViolation {
  rule: string;
  detail: string;
  line: number;
}

export interface LogicFlag {
  type: string;
  detail: string;
  quotes: string[];
}

export interface CheckReport {
  overall: Verdict;
  input_length_chars: number;
  input_length_words: number;
  claims_to_verify: ClaimToVerify[];
  ai_tells: AITell[];
  tov_violations: TOVViolation[];
  logic_flags: LogicFlag[];
  summary: {
    claims: number;
    ai_tells: number;
    tov_violations: number;
    logic_flags: number;
  };
}
