// =====================================================================
// Every piece of math the practice and worksheet questions can show —
// prompts, hints, worked solutions, choice options, sheet formulas —
// must be valid KaTeX. Hints and solutions are hidden until a button is
// pressed, so a typo there (e.g. "\sigmaA" instead of "\sigma A") is
// easy to miss by looking at the page; this test renders all of it for
// 25 random seeds per question and fails on the first bad expression.
// =====================================================================
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { built } from '../worksheet/index';
import { generators, makeProblem } from './questions';

/** Renders every $...$ in `text` (or `text` itself when `whole`); returns the first error, or null. */
function firstError(text: string, whole = false): string | null {
  const parts = whole ? [text] : (text.match(/\$[^$]+\$/g) ?? []).map((s) => s.slice(1, -1));
  for (const tex of parts) {
    try {
      katex.renderToString(tex, { throwOnError: true, strict: 'ignore' });
    } catch (e) {
      return `${(e as Error).message.split('\n')[0]}  in  ${tex}`;
    }
  }
  return null;
}

describe('all practice math renders with KaTeX', () => {
  for (const g of generators) {
    it(g.id, () => {
      for (let s = 1; s <= 25; s++) {
        const p = makeProblem(g, s * 104729);
        for (const t of [p.prompt, ...p.hints, ...p.solution]) expect(firstError(t)).toBeNull();
      }
    });
  }
});

describe('all worksheet math renders with KaTeX', () => {
  for (const q of built) {
    it(`Q${q.q}`, () => {
      for (const seed of ['original' as const, ...Array.from({ length: 25 }, (_, i) => i * 31 + 7)]) {
        const p = q.make(seed);
        for (const t of [p.prompt, ...p.hints, ...p.solution, q.idea, ...q.notOnSheet]) expect(firstError(t)).toBeNull();
        for (const t of q.sheet) expect(firstError(t, true)).toBeNull();
        for (const part of p.parts) {
          expect(firstError(part.ask)).toBeNull();
          for (const b of part.boxes) {
            expect(firstError(b.label)).toBeNull();
            if (b.kind === 'choice') for (const o of b.options) expect(firstError(o.tex, true)).toBeNull();
          }
        }
      }
    });
  }
});
