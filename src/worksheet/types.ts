// =====================================================================
// Types for the "ตัวอย่างข้อสอบ" tab: worksheet questions 21–40 in full.
//
// Six of these 20 questions appear on the exam with new numbers, so each
// one here keeps the worksheet's exact wording and all of its parts
// (ก, ข, …) and only changes the numbers.
//
// How one question is written (see ch1to3.ts for real examples):
//
//   defineQuestion({
//     q: 25,                         worksheet number
//     original: { R: 10, Q: 4 },     the worksheet's own numbers
//     random: (rng) => ({ ... }),    new numbers with the same structure
//     build: (n) => ({ ... }),       turns numbers into the question,
//   })                               its answers, hints and solution
//
// `build` is a plain function of the numbers, so the test file can call
// it with `original` and compare against the worksheet's answer key.
// =====================================================================
import type { KnownMistake } from '../physics/answers';
import type { Rng, UnitOpt } from '../practice/common';
import { mulberry32 } from '../practice/common';

/** One answer box: a number with a unit, or a multiple-choice pick. */
export type Box =
  | {
      kind: 'number';
      /** what this box asks for, e.g. "$E$ ที่ $r=14.0$ cm" ($...$ = math) */
      label: string;
      /** unit drop-down; the first one is used to show the answer */
      units: UnitOpt[];
      /** correct answer, in SI (or in the multiple shown by the unit, e.g. × V₀) */
      answer: number;
      /** typical size, only used when the answer is exactly 0 */
      scale: number;
      /** wrong values typical slips give; ids are keys of mistakeText in practice/common.ts */
      mistakes: KnownMistake[];
    }
  | {
      kind: 'choice';
      label: string;
      /**
       * The options as TeX. Write the CORRECT one first; the page shuffles
       * them. `mistake` (a mistakeText id) explains why a wrong option is wrong.
       */
      options: { tex: string; mistake?: string }[];
    };

/** One lettered part of a question (ก, ข, …). Questions without parts use one part with label ''. */
export interface Part {
  label: string;
  /** the sub-question text, '' when the main prompt already says it */
  ask: string;
  /** in `build` just write Box objects; `correctIndex` is filled in by defineQuestion */
  boxes: ShuffledBox[];
}

/** A question with its numbers filled in. */
export interface WsProblem {
  /** main text, as in the worksheet ($...$ = math, **...** = bold) */
  prompt: string;
  /** optional figure: an id of a component in figures.tsx, plus the numbers it needs */
  figure?: { id: string; props: Record<string, number> };
  parts: Part[];
  /** shown one at a time with the "คำใบ้" button */
  hints: string[];
  /** worked solution lines with these numbers */
  solution: string[];
}

/** Fixed facts about a question, the same whatever the numbers. */
export interface QuestionInfo {
  /** worksheet number, 21–40 */
  q: number;
  /** chapter id from src/chapters.ts */
  chapter: string;
  /** short Thai name of the situation, for the list */
  title: string;
  /** the one idea that solves it ($...$ allowed) */
  idea: string;
  /** link to the lesson section that teaches it, e.g. "#/gauss/conductors" */
  lesson: string;
  /** formulas from the official exam sheet this question uses (TeX) */
  sheet: string[];
  /** things the solution needs that are NOT on the exam sheet ($...$ allowed) */
  notOnSheet: string[];
}

/** A ready-to-use worksheet question (what defineQuestion returns). */
export interface Question extends QuestionInfo {
  /** 'original' = the worksheet's numbers; a number = a random seed */
  make: (seed: number | 'original') => WsProblem;
}

/**
 * Wraps one question definition. N is the type of its numbers object.
 * Also shuffles each multiple-choice box (with the same seed, so a
 * problem can be rebuilt exactly) and keeps track of which option is correct.
 */
export function defineQuestion<N>(
  def: QuestionInfo & {
    original: N;
    random: (rng: Rng) => N;
    build: (n: N) => WsProblem;
  },
): Question {
  const { original, random, build, ...info } = def;
  return {
    ...info,
    make: (seed) => {
      const rng = mulberry32(seed === 'original' ? 12345 : seed);
      const p = build(seed === 'original' ? original : random(rng));
      return { ...p, parts: p.parts.map((part) => ({ ...part, boxes: part.boxes.map((b) => shuffleChoice(b, rng)) })) };
    },
  };
}

/** A shuffled choice box remembers where the correct option went. */
export type ShuffledBox = Box & { correctIndex?: number };

function shuffleChoice(b: Box, rng: Rng): ShuffledBox {
  if (b.kind !== 'choice') return b;
  // Fisher–Yates shuffle of the option positions
  const order = b.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...b, options: order.map((i) => b.options[i]), correctIndex: order.indexOf(0) };
}

/** A worksheet question that has not been built yet (its chapter is still to come). */
export interface PlannedQuestion {
  q: number;
  chapter: string;
  title: string;
}
