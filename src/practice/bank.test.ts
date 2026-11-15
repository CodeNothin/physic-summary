import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../physics/answers';
import { examBlueprint, generators, makeProblem, mistakeText, skills } from './bank';

describe('question bank', () => {
  it('has unique ids and covers every skill', () => {
    const ids = generators.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of skills) expect(generators.some((g) => g.skill === s)).toBe(true);
  });

  it('exam blueprint only names existing generators', () => {
    for (const id of examBlueprint.flat()) expect(generators.some((g) => g.id === id)).toBe(true);
  });

  for (const gen of generators) {
    it(`${gen.id}: 200 random attempts are well-formed`, () => {
      for (let seed = 1; seed <= 200; seed++) {
        const p = makeProblem(gen, seed * 7919);
        expect(Number.isFinite(p.answer)).toBe(true);
        expect(p.scale).toBeGreaterThan(0);
        expect(p.hints.length).toBeGreaterThan(0);
        expect(p.solution.length).toBeGreaterThan(0);
        expect(p.prompt).not.toMatch(/NaN|undefined|Infinity/);
        expect(p.solution.join(' ')).not.toMatch(/NaN|undefined|Infinity/);
        // the exact answer is accepted and never mistaken for a known slip
        expect(checkAnswer(p.answer, p.answer, p.mistakes, p.scale).kind).toBe('correct');
        expect(checkAnswer(p.answer * 1.015, p.answer, p.mistakes, p.scale).kind).toBe('correct');
        for (const m of p.mistakes) {
          expect(mistakeText[m.id]).toBeTruthy();
          expect(Number.isFinite(m.value)).toBe(true);
        }
        // same seed, same problem
        expect(makeProblem(gen, seed * 7919).answer).toBe(p.answer);
      }
    });
  }
});
