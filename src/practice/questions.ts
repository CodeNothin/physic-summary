// =====================================================================
// The full practice question bank, and the timed exam sets.
//
// `generators` = every question type from every chapter. The practice
// page picks from this list (optionally filtered by chapter or skill).
// =====================================================================
import { electricGenerators } from './bankElectric';
import { emwaveGenerators } from './bankEmwave';
import { lightGenerators } from './bankLight';
import { faradayGenerators } from './bankFaraday';
import { magnetismGenerators } from './bankMagnetism';
import { mulberry32, skillChapter, skillNames } from './common';
import type { Generator, Problem, Skill } from './common';

/**
 * Which worksheet question each short question is a piece of. The
 * practice page shows "ส่วนหนึ่งของข้อ N" on these, and the
 * ตัวอย่างข้อสอบ tab links to them as "ฝึกทีละส่วน".
 * Generators not listed here come from lecture examples only.
 */
const wsOf: Record<string, number> = {
  'shell-metal-E': 21,
  'shell-outside-E': 21,
  'shell-inner': 21,
  'shell-outer': 21,
  'sheets-middle': 22,
  'sheets-outside': 22,
  'sheets-numeric': 22,
  'uniform-VA-VB': 23,
  'uniform-VB-VA': 23,
  'uniform-Wext': 23,
  'condV-ratio-out': 24,
  'condV-charge': 24,
  'cond-E-out': 25,
  'cond-V-out': 25,
  'cond-E-in': 25,
  'cond-V-in': 25,
  'q26-radius': 26,
  'q27-Bx': 27,
  'q27-By': 27,
  'q28-imax': 28,
  'q28-current': 28,
  'rl-tau': 28,
  'q29-intensity': 29,
  'q29-energy': 29,
  'q30-Bmax': 30,
  'q30-freq': 30,
  'wave-lambda': 30,
  'q31-x': 31,
  'q31-dx': 31,
  'q31-ratio': 31,
  'q32-L': 32,
  'q32-intensity': 32,
  'q33-time': 33,
  'q33-index': 33,
};

export const generators: Generator[] = [
  ...electricGenerators,
  ...magnetismGenerators,
  ...faradayGenerators,
  ...emwaveGenerators,
  ...lightGenerators,
].map((g) => ({
  ...g,
  ws: wsOf[g.id],
}));

/** Builds a concrete problem from a generator and a seed (same seed ⇒ same numbers). */
export function makeProblem(gen: Generator, seed: number): Problem {
  return { genId: gen.id, skill: gen.skill, title: gen.title, ...gen.make(mulberry32(seed)) };
}

/** A fresh random seed for a new attempt. */
export const newSeed = () => (Math.random() * 2 ** 32) >>> 0;

/** Every skill, in the order they are listed on the practice page. */
export const skills = Object.keys(skillNames) as Skill[];

/** Skills of one chapter (chapter id from src/chapters.ts), or all skills for 'all'. */
export const skillsOf = (chapter: string): Skill[] =>
  chapter === 'all' ? skills : skills.filter((s) => skillChapter[s] === chapter);

/**
 * A timed exam set. Each slot is a list of generator ids; one of them is
 * chosen at random for that slot, so every exam is different.
 */
export interface ExamSet {
  id: string;
  label: string;
  /** chapter ids this set covers (for the practice page's chapter filter) */
  chapters: string[];
  minutes: number;
  slots: string[][];
}

export const examSets: ExamSet[] = [
  {
    id: 'ch12',
    label: 'บทที่ 1–2 (แนวข้อ 21–25)',
    chapters: ['gauss', 'potential'],
    minutes: 20,
    slots: [
      ['shell-inner', 'shell-outer'],
      ['shell-metal-E', 'shell-outside-E'],
      ['sheets-middle', 'sheets-outside'],
      ['uniform-VA-VB', 'uniform-VB-VA'],
      ['uniform-Wext'],
      ['condV-ratio-out', 'condV-charge'],
      ['cond-E-out', 'cond-V-out'],
      ['cond-V-in', 'cond-E-in'],
      ['ins-in', 'points-V', 'flux-tilt', 'two-ratio', 'ring-V', 'efromv-Ex'],
    ],
  },
  {
    id: 'ch3',
    label: 'บทที่ 3 (แนวข้อ 26–27)',
    chapters: ['magnetism'],
    minutes: 20,
    slots: [
      ['q26-radius'],
      ['mag-force-angle', 'selector-v', 'selector-E'],
      ['wire-force', 'semi-straight', 'semi-curved'],
      ['finite-wire', 'long-wire'],
      ['thick-in', 'thick-out'],
      ['solenoid', 'ampere-loop'],
      ['two-wires-page'],
      ['q27-Bx', 'q27-By'],
    ],
  },
  {
    id: 'ch4',
    label: 'บทที่ 4 (แนวข้อ 28)',
    chapters: ['faraday'],
    minutes: 15,
    slots: [
      ['flux-angle', 'faraday-dB'],
      ['motional-emf', 'rail-current', 'rail-force'],
      ['loop-region-emf'],
      ['rl-tau', 'q28-imax'],
      ['q28-current'],
      ['rl-decay', 'rl-VL'],
      ['rl-time-fraction', 'rl-design-L'],
    ],
  },
  {
    id: 'ch5',
    label: 'บทที่ 5 (แนวข้อ 29–30)',
    chapters: ['emwave'],
    minutes: 15,
    slots: [
      ['q29-intensity', 'hemisphere-intensity'],
      ['q29-energy'],
      ['q30-Bmax', 'wave-Emax-from-B'],
      ['q30-freq', 'wave-lambda', 'lc-wavelength'],
      ['intensity-from-E', 'emax-from-intensity', 'emax-at-distance'],
      ['pressure-absorb-reflect', 'pressure-partial', 'sail-force'],
      ['power-from-pressure', 'force-planet', 'momentum-oblique', 'displacement-current'],
    ],
  },
  {
    id: 'ch6',
    label: 'บทที่ 6 (แนวข้อ 31–33)',
    chapters: ['light'],
    minutes: 20,
    slots: [
      ['snell-angle', 'critical-angle', 'speed-wavelength-medium'],
      ['q33-time', 'q33-index', 'tank-depth'],
      ['q31-x', 'q31-dx', 'q31-ratio'],
      ['q32-L', 'ds-bright', 'ds-dark'],
      ['q32-intensity', 'ds-intensity-position'],
      ['ds-lambda-from-spacing', 'ds-dark-matches-bright'],
      ['ss-first-dark', 'ss-central-width', 'ss-slit-width'],
      ['grating-angle', 'grating-max-order', 'rayleigh-circle'],
      ['malus-unpol-two', 'malus-three', 'crossed-middle', 'brewster-angle'],
    ],
  },
];
