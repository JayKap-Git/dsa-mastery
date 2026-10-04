export interface JavaSnippet {
  /** Clean, dedented code with step markers removed — what the copy button copies. */
  code: string;
  /** Highlighted HTML, one entry per line. */
  lines: string[];
  /** `// @step label` → 1-based line numbers inside the snippet. */
  steps: Record<string, number[]>;
}

export function parseJava(source: string, region?: string): { code: string; steps: Record<string, number[]> };
export function highlightJava(code: string): Promise<string[]>;
export function loadJava(absPath: string, region?: string): Promise<JavaSnippet>;
