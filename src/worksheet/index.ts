// =====================================================================
// The list of all 20 worksheet questions (21–40) for the
// "ตัวอย่างข้อสอบ" tab, plus answer checking for one answer box.
//
// Built questions come from the chapter files (ch1to3.ts, …). The rest
// are listed as `planned` so the checklist can show all 20 from day one.
// When a chapter's questions are written: add them to `built` and delete
// their lines from `planned`.
// =====================================================================
import { checkAnswer, parseNumber } from '../physics/answers';
import type { Verdict } from '../physics/answers';
import { ch1to3Questions } from './ch1to3';
import type { PlannedQuestion, Question, ShuffledBox } from './types';

export const built: Question[] = [...ch1to3Questions];

/** Not written yet. `chapter` is the expected chapter id; check it when the chapter is built. */
export const planned: PlannedQuestion[] = [
  { q: 28, chapter: 'faraday', title: 'วงจร RL: กระแสสูงสุด และกระแสหลังสับสวิตช์' },
  { q: 29, chapter: 'emwave', title: 'แหล่งกำเนิดคลื่น EM: ความเข้มและพลังงาน' },
  { q: 30, chapter: 'emwave', title: 'สมการสนามไฟฟ้าของคลื่น EM' },
  { q: 31, chapter: 'light', title: 'การแทรกสอดสองสลิต (ตัวแปร)' },
  { q: 32, chapter: 'light', title: 'การแทรกสอดสองสลิต (600 nm)' },
  { q: 33, chapter: 'light', title: 'แสงผ่านแผ่นพลาสติก มุมตกกระทบ 60°' },
  { q: 34, chapter: 'modern1', title: 'การแผ่รังสีของวัตถุดำ (ดาวซิริอุส)' },
  { q: 35, chapter: 'modern1', title: 'จำนวนโฟตอนจากไมโครเวฟ' },
  { q: 36, chapter: 'modern1', title: 'ความยาวคลื่นเดอบรอยล์ (ตัวแปร)' },
  { q: 37, chapter: 'modern1', title: 'อิเล็กตรอนเร่งผ่าน 100 V' },
  { q: 38, chapter: 'modern2', title: 'หลักความไม่แน่นอน' },
  { q: 39, chapter: 'nuclear', title: 'ปฏิกิริยาฟิวชัน' },
  { q: 40, chapter: 'nuclear', title: 'ครึ่งชีวิตจากกราฟ ln(A)–t' },
];

/** All 20 in order: a built Question, or a planned placeholder. */
export const allQuestions: (Question | PlannedQuestion)[] = [...built, ...planned].sort((a, b) => a.q - b.q);

export const isBuilt = (x: Question | PlannedQuestion): x is Question => 'make' in x;

export const questionByNumber = (q: number): Question | undefined => built.find((x) => x.q === q);

// ------------------------------------------------------------ checking

/** What the student entered in one box: typed number + unit index, or a chosen option. */
export interface BoxInput {
  text: string;
  unitIdx: number;
  /** chosen option index for a choice box, null = not chosen */
  choice: number | null;
}

export const emptyInput = (): BoxInput => ({ text: '', unitIdx: 0, choice: null });

/** The checker's verdict, plus 'invalid' (not a number) and 'blank' (nothing entered). */
export type BoxResult = Verdict | { kind: 'invalid' } | { kind: 'blank' };

/** Checks one box. Number boxes use the practice-mode checker (2 %, sign, power of ten, known slips). */
export function checkBox(box: ShuffledBox, input: BoxInput): BoxResult {
  if (box.kind === 'choice') {
    if (input.choice === null) return { kind: 'blank' };
    if (input.choice === box.correctIndex) return { kind: 'correct' };
    const why = box.options[input.choice].mistake;
    return why ? { kind: 'mistake', id: why } : { kind: 'wrong' };
  }
  if (input.text.trim() === '') return { kind: 'blank' };
  const v = parseNumber(input.text);
  if (Number.isNaN(v)) return { kind: 'invalid' };
  return checkAnswer(v * box.units[input.unitIdx].factor, box.answer, box.mistakes, box.scale);
}
