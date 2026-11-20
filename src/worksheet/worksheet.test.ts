// =====================================================================
// Tests for the "ตัวอย่างข้อสอบ" questions.
//  1. With the worksheet's own numbers, every answer matches the
//     worksheet's answer key (เฉลย).
//  2. With 300 random seeds, every question is well-formed and its own
//     answers are accepted.
// =====================================================================
import { describe, expect, it } from 'vitest';
import { mistakeText } from '../practice/common';
import { allQuestions, built, checkBox, isBuilt, questionByNumber } from './index';
import type { ShuffledBox } from './types';

/** All boxes of a question, in order. */
const boxes = (q: number, seed: number | 'original' = 'original'): ShuffledBox[] =>
  questionByNumber(q)!.make(seed).parts.flatMap((p) => p.boxes);

/** The number answer of box i (fails the test if it is a choice box). */
const num = (q: number, i: number) => {
  const b = boxes(q)[i];
  if (b.kind !== 'number') throw new Error(`box ${i} of Q${q} is not a number box`);
  return b.answer;
};

/** Relative closeness, like the 2 % the site accepts but tighter. */
const near = (x: number, y: number, rel = 0.006) => expect(Math.abs(x - y)).toBeLessThanOrEqual(rel * Math.abs(y));

describe('worksheet answer key (original numbers)', () => {
  it('Q21: E = 0 in the metal; q1 = −5.0 μC, q2 = −15.0 μC', () => {
    expect(num(21, 0)).toBe(0);
    near(num(21, 1), -5e-6);
    near(num(21, 2), -15e-6);
  });
  it('Q22: 3σ/2ε0 between the sheets', () => near(num(22, 0), 1.5));
  it('Q23: V_A − V_B = −9.0 V; W_ext = 2.7×10⁻⁵ J', () => {
    near(num(23, 0), -9);
    near(num(23, 1), 2.7e-5);
  });
  it('Q24: Q = 4πε0RV0 is the correct choice; V(R) = V0, V(6R) = V0/6', () => {
    const b = boxes(24)[0];
    expect(b.kind).toBe('choice');
    if (b.kind === 'choice') expect(b.options[b.correctIndex!].tex).toBe(String.raw`Q=4\pi\varepsilon_0RV_0`);
    near(num(24, 1), 1);
    near(num(24, 2), 1 / 6);
  });
  it('Q25: 1.84×10⁶ N/C and 2.57×10⁵ V at 14 cm; 0 and 3.6×10⁵ V at 5 cm', () => {
    near(num(25, 0), 1.84e6);
    near(num(25, 1), 2.57e5);
    expect(num(25, 2)).toBe(0);
    near(num(25, 3), 3.6e5);
  });
  it('Q26: r = 0.98 m', () => near(num(26, 0), 0.98, 0.01));
  it('Q27: B = μ0I/2π (1/3 î + 1/2 ĵ)', () => {
    near(num(27, 0), 1 / 3);
    near(num(27, 1), 1 / 2);
  });
});

describe('worksheet list', () => {
  it('has exactly questions 21–40, once each', () => {
    expect(allQuestions.map((x) => x.q)).toEqual(Array.from({ length: 20 }, (_, i) => 21 + i));
  });
});

describe('random numbers keep every question well-formed', () => {
  for (const q of allQuestions.filter(isBuilt)) {
    it(`Q${q.q}: 300 seeds`, () => {
      for (let s = 1; s <= 300; s++) {
        const seed = s * 7919;
        const p = q.make(seed);
        const text = [p.prompt, ...p.hints, ...p.solution, ...p.parts.map((x) => x.ask)].join(' ');
        expect(text).not.toMatch(/NaN|undefined|Infinity/);
        expect(p.parts.length).toBeGreaterThan(0);
        for (const b of p.parts.flatMap((x) => x.boxes)) {
          if (b.kind === 'number') {
            expect(Number.isFinite(b.answer)).toBe(true);
            expect(b.scale).toBeGreaterThan(0);
            // the exact answer, and one 1.5 % off, are both accepted
            expect(checkBox(b, { text: String(b.answer / b.units[0].factor), unitIdx: 0, choice: null }).kind).toBe('correct');
            expect(checkBox(b, { text: String((b.answer * 1.015) / b.units[0].factor), unitIdx: 0, choice: null }).kind).toBe('correct');
            for (const m of b.mistakes) expect(mistakeText[m.id]).toBeTruthy();
          } else {
            expect(checkBox(b, { text: '', unitIdx: 0, choice: b.correctIndex! }).kind).toBe('correct');
            for (const o of b.options) if (o.mistake) expect(mistakeText[o.mistake]).toBeTruthy();
          }
        }
        // same seed ⇒ same question
        expect(q.make(seed).prompt).toBe(p.prompt);
      }
    });
  }
  it('every built question lists the exam-sheet formulas it uses', () => {
    for (const q of built) expect(q.sheet.length).toBeGreaterThan(0);
  });
});
